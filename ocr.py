import cv2
import numpy as np
import easyocr
import re  # tambah import ini di atas
from matplotlib import pyplot as plt

# Inisialisasi
reader = easyocr.Reader(['en', 'ms'])

# Load gambar
image_path = 'mykad.jpg'
image = cv2.imread(image_path)
image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# Jalankan OCR
result = reader.readtext(image_path)

# Tampilkan hasil teks di terminal
print("=== Hasil OCR ===")
for (box, text, confidence) in result:
    print(f"{text} (confidence: {confidence:.2f})")

# ============================================
# EKSTRAK NOMOR IC DAN ALAMAT
# ============================================
all_texts = [text for (box, text, confidence) in result]

# Ekstrak Nomor IC
ic_pattern = re.compile(r'\d{6}-\d{2}-\d{4}')
nomor_ic = None
for text in all_texts:
    normalized = text.replace('o', '0').replace('O', '0')
    match = ic_pattern.search(normalized)
    if match:
        nomor_ic = match.group()
        break

# Ekstrak Alamat
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
    if capture:
        alamat_lines.append(text)

print("\n=== Hasil Ekstraksi ===")
print(f"Nomor IC : {nomor_ic if nomor_ic else 'Tidak ditemukan'}")
print(f"Alamat   : {', '.join(alamat_lines) if alamat_lines else 'Tidak ditemukan'}")

# ============================================
# Gambar kotak
# ============================================
image_boxes = image_rgb.copy()
for (box, text, confidence) in result:
    pts = np.array(box, dtype=np.int32)
    cv2.polylines(image_boxes, [pts], isClosed=True, color=(0, 255, 0), thickness=2)
    x, y = pts[0]
    cv2.putText(image_boxes, text, (x, y - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)

plt.figure(figsize=(12, 8))
plt.imshow(image_boxes)
plt.axis('off')
plt.title('OCR Result')
plt.show()