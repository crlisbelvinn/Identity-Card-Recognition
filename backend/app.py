from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import re
import numpy as np
import cv2
import easyocr
import google.generativeai as genai
import anthropic
import json
import os
import time
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

_ocr_reader = None
_anthropic_client = None

def get_ocr():
    global _ocr_reader
    if _ocr_reader is None:
        _ocr_reader = easyocr.Reader(['en', 'ms'], gpu=False)
    return _ocr_reader

def get_anthropic():
    global _anthropic_client
    if _anthropic_client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if api_key:
            _anthropic_client = anthropic.Anthropic(api_key=api_key)
    return _anthropic_client

def run_hybrid_correction(ocr_text, api_key_gemini):
    """Uses LLM to clean, format, and correct the raw OCR text output."""
    if not ocr_text.strip():
        return {"nomor_ic": None, "alamat": None, "confidence": 0}
    
    if not api_key_gemini:
        return {"nomor_ic": None, "alamat": None, "confidence": 0, "error": "Gemini API key not configured for Hybrid correction"}
        
    try:
        genai.configure(api_key=api_key_gemini)
        model = genai.GenerativeModel("models/gemini-2.0-flash")
        
        prompt = f"""
        You are a Malaysian identity card (MyKad) post-processing system.
        I will give you a list of raw text fragments extracted via OCR.
        You must reconstruct the IC Number (Nomor IC) and the Address (Alamat) from these fragments.
        Correct any obvious OCR misspellings (e.g. '0' read as 'O' or 'DOKUMEN' read as 'DOKUMFN').
        
        Format of IC Number: 12-digit format, e.g. YYMMDD-PB-### (e.g., 960321-14-5231).
        Format of Address: Reconstruct a clean postal address from the messy fragments. Do not include unrelated words like 'WARGANEGARA', 'PEREMPUAN', 'LELAKI', 'DOKUMEN', 'ALAMAT' or names.
        
        OCR Fragments:
        {ocr_text}
        
        Respond with ONLY valid JSON, no markdown, no extra text:
        {{"nomor_ic": "...", "alamat": "...", "confidence": 0.0}}
        confidence is 0-1 reflecting how certain you are of the reconstruction.
        """
        
        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        clean = raw_text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean)
        return {
            "nomor_ic": parsed.get("nomor_ic"),
            "alamat": parsed.get("alamat"),
            "confidence": round((parsed.get("confidence") or 0) * 100)
        }
    except Exception as e:
        return {"nomor_ic": None, "alamat": None, "confidence": 0, "error": str(e)}

def run_ocr(image_bytes):
    start = time.time()
    reader = get_ocr()
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    h, w, _ = img.shape
    results = reader.readtext(img)
    elapsed = round((time.time() - start) * 1000)
    all_texts = [text for (_, text, _) in results]
    all_confs = [conf for (_, _, conf) in results]
    avg_conf = round(sum(all_confs) / len(all_confs) * 100) if all_confs else 0
    ic_pattern = re.compile(r'\d{6}-\d{2}-\d{4}')
    nomor_ic = None
    for text in all_texts:
        normalized = text.replace('o', '0').replace('O', '0').replace('l', '1').replace('I', '1')
        match = ic_pattern.search(normalized)
        if match:
            nomor_ic = match.group()
            break
    keywords_alamat = ['DOKUMEN', 'ALAMAT', 'ADDRESS']
    stop_words = ['WARGANEGARA', 'PEREMPUAN', 'LELAKI']
    alamat_lines = []
    capture = False
    for text in all_texts:
        if any(kw in text.upper() for kw in keywords_alamat):
            capture = True
            continue
        if capture and any(sw in text.upper() for sw in stop_words):
            break
        if capture and text.strip():
            alamat_lines.append(text.strip())
            
    # Format raw results to include normalized bounding box coordinates (0-100% relative coordinates for easy frontend display)
    raw_results = []
    for (box, t, c) in results:
        # box is a list of 4 points: [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]
        pts = np.array(box, dtype=np.int32)
        x_min = int(np.min(pts[:, 0]))
        y_min = int(np.min(pts[:, 1]))
        x_max = int(np.max(pts[:, 0]))
        y_max = int(np.max(pts[:, 1]))
        
        # Calculate percentage coordinates relative to image dimensions
        raw_results.append({
            "text": t,
            "confidence": round(c * 100),
            "box": {
                "x": round((x_min / w) * 100, 2),
                "y": round((y_min / h) * 100, 2),
                "width": round(((x_max - x_min) / w) * 100, 2),
                "height": round(((y_max - y_min) / h) * 100, 2)
            }
        })
        
    return {
        "nomor_ic": nomor_ic,
        "alamat": ", ".join(alamat_lines) if alamat_lines else None,
        "confidence": avg_conf,
        "processing_ms": elapsed,
        "raw_results": raw_results,
        "raw_text_concat": "\n".join(all_texts)
    }

def run_claude(image_bytes, mime_type="image/jpeg"):
    client = get_anthropic()
    if not client:
        return {"error": "Anthropic API key not configured", "nomor_ic": None, "alamat": None, "confidence": 0, "processing_ms": 0}
    start = time.time()
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": mime_type, "data": b64}},
                {"type": "text", "text": "You are a Malaysian identity card (MyKad) information extraction system. From this image, extract the IC number and address. Respond with ONLY valid JSON, no markdown, no extra text:\n{\"nomor_ic\":\"...\",\"alamat\":\"...\",\"confidence\":0.0}\nconfidence is 0-1 reflecting how clearly the fields are visible. If a field cannot be found, use null."}
            ]
        }]
    )
    elapsed = round((time.time() - start) * 1000)
    raw_text = message.content[0].text.strip()
    try:
        clean = raw_text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean)
    except json.JSONDecodeError:
        parsed = {"nomor_ic": None, "alamat": None, "confidence": 0}
    return {
        "nomor_ic": parsed.get("nomor_ic"),
        "alamat": parsed.get("alamat"),
        "confidence": round((parsed.get("confidence") or 0) * 100),
        "processing_ms": elapsed
    }

def run_gemini(image_bytes, mime_type="image/jpeg"):
    start = time.time()
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"error": "GEMINI_API_KEY not set", "nomor_ic": None, "alamat": None, "confidence": 0, "processing_ms": 0}
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("models/gemini-2.0-flash")
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    response = model.generate_content([
        {"mime_type": mime_type, "data": b64},
        "You are a Malaysian identity card (MyKad) information extraction system. From this image, extract the IC number and address. Respond with ONLY valid JSON, no markdown, no extra text:\n{\"nomor_ic\":\"...\",\"alamat\":\"...\",\"confidence\":0.0}\nconfidence is 0-1 reflecting how clearly the fields are visible. If a field cannot be found, use null."
    ])
    elapsed = round((time.time() - start) * 1000)
    raw_text = response.text.strip()
    try:
        clean = raw_text.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean)
    except json.JSONDecodeError:
        parsed = {"nomor_ic": None, "alamat": None, "confidence": 0}
    return {
        "nomor_ic": parsed.get("nomor_ic"),
        "alamat": parsed.get("alamat"),
        "confidence": round((parsed.get("confidence") or 0) * 100),
        "processing_ms": elapsed
    }

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/extract", methods=["POST"])
def extract():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file = request.files["image"]
    image_bytes = file.read()
    mime_type = file.mimetype or "image/jpeg"
    
    # Run EasyOCR
    try:
        ocr_result = run_ocr(image_bytes)
    except Exception as e:
        ocr_result = {"error": str(e), "nomor_ic": None, "alamat": None, "confidence": 0, "processing_ms": 0, "raw_results": [], "raw_text_concat": ""}
    
    # Hybrid correction and Gemini direct vision are currently under development (on progress)
    hybrid_data = {
        "nomor_ic": None,
        "alamat": None,
        "confidence": 0,
        "error": "On Progress",
        "processing_ms": 0
    }
    gemini_result = {
        "nomor_ic": None,
        "alamat": None,
        "confidence": 0,
        "error": "On Progress",
        "processing_ms": 0
    }
    
    return jsonify({
        "ocr": ocr_result,
        "hybrid": hybrid_data,
        "gemini": gemini_result,
        "consensus": None
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
