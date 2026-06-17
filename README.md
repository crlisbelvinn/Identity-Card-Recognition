# MyKad Extractor

Web app to extract IC number & address from Malaysian MyKad images, comparing **EasyOCR** vs **Claude** vs **Gemini** LLM extraction side-by-side.

## Project structure

```
mykad-extractor/
├── backend/          # Flask API (your existing OCR + LLM logic)
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/          # React + Tailwind UI
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── UploadZone.jsx
    │   │   ├── ResultCard.jsx
    │   │   ├── ConsensusBanner.jsx
    │   │   └── HistoryList.jsx
    │   ├── main.jsx
    │   └── index.css
    └── .env.example
```

## Setup (in VSCode)

### 1. Backend (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# fill in ANTHROPIC_API_KEY and GEMINI_API_KEY in .env
```

Load env vars and run:

```bash
export $(cat .env | xargs)      # Windows (PowerShell): use a package like python-dotenv instead
python app.py
```

Backend runs at `http://localhost:5000`.

> 💡 First run will download EasyOCR models (~100MB), so it may take a minute.

### 2. Frontend (React + Vite + Tailwind)

Open a **new terminal**:

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_URL=http://localhost:5000  (default is fine for local dev)

npm run dev
```

Frontend runs at `http://localhost:5173`.

## How it works

1. Upload / drag a MyKad image
2. Click **Analyze MyKad**
3. Backend runs:
   - `EasyOCR` (your existing regex-based extraction)
   - `Claude` (Anthropic vision API)
   - `Gemini` (Google Generative AI)
4. Frontend shows all 3 results side-by-side with confidence bars + a consensus check

## API

**POST** `/extract` — multipart form-data with field `image`

Response:
```json
{
  "ocr": { "nomor_ic": "...", "alamat": "...", "confidence": 75, "processing_ms": 1200 },
  "claude": { "nomor_ic": "...", "alamat": "...", "confidence": 90, "processing_ms": 1800 },
  "gemini": { "nomor_ic": "...", "alamat": "...", "confidence": 85, "processing_ms": 1500 },
  "consensus": { "nomor_ic": "...", "agreement": true }
}
```

## Deploying

- **Frontend** → Vercel/Netlify (set `VITE_API_URL` to your deployed backend URL)
- **Backend** → Render/Railway (set `ANTHROPIC_API_KEY` & `GEMINI_API_KEY` as env vars, `render.yaml` included)

## Notes for portfolio / Apple Academy

- Privacy: don't commit real MyKad photos — use the official "CONTOH" sample card for demos
- Mention the **comparison/consensus** angle — it shows you thinking about reliability, not just "it works"
# Identity-Card-Recognition
# Identity-Card-Recognition
