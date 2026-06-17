import google.generativeai as genai
import base64

genai.configure(api_key="GEMINI_API_KEY")

# for model in genai.list_models():
#     if "generateContent" in model.supported_generation_methods:
#         print(model.name)

# Load gambar dan convert ke base64
with open("mykad.jpg", "rb") as f:
    image_data = base64.b64encode(f.read()).decode("utf-8")

# Inisialisasi model
model = genai.GenerativeModel("models/gemini-3.5-flash")

# Kirim gambar + prompt
response = model.generate_content([
    {
        "mime_type": "image/jpeg",
        "data": image_data
    },
    """
    Kamu adalah sistem ekstraksi informasi kartu identitas Malaysia (MyKad).
    Dari gambar ini, ekstrak informasi berikut dalam format JSON:
    {
        "nomor_ic": "...",
        "alamat": "..."
    }
    Hanya return JSON saja, tanpa penjelasan tambahan.
    """
])

import json
result = json.loads(response.text)
print("=== Hasil Ekstraksi LLM ===")
print(f"Nomor IC : {result['nomor_ic']}")
print(f"Alamat   : {result['alamat']}")