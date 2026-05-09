"""Re-crop and brighten selected headshots per Vidal feedback.

Crops to a square centered on the estimated face location, zooms in, and
applies a mild auto-level + brightening pass for photos with shadows.
"""

from PIL import Image, ImageOps, ImageEnhance
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HEADSHOTS = ROOT / "assets" / "img" / "headshots"
BACKUP = HEADSHOTS / "originals"
BACKUP.mkdir(exist_ok=True)


def square_crop(img, fx, fy, scale=0.85):
    """Crop a centered square at (fx, fy) using `scale` of the smaller dim."""
    w, h = img.size
    side = int(min(w, h) * scale)
    cx = int(w * fx)
    cy = int(h * fy)
    left = max(0, cx - side // 2)
    top = max(0, cy - side // 2)
    if left + side > w:
        left = w - side
    if top + side > h:
        top = h - side
    return img.crop((left, top, left + side, top + side))


def brighten_and_level(img, brightness=1.10, contrast=1.05):
    img = ImageOps.autocontrast(img, cutoff=1)
    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    return img


SPECS = [
    # filename, face_x_frac, face_y_frac, brighten?, scale
    ("rene-IMG_1176.jpg", 0.43, 0.42, False, 0.78),
    ("liangzu.jpg",       0.50, 0.48, True,  0.85),
    ("fengrui.jpg",       0.50, 0.45, True,  0.85),
    ("uday.jpg",          0.46, 0.45, True,  0.85),
]

OUT_SIZE = 600

for filename, fx, fy, brighten, scale in SPECS:
    src = HEADSHOTS / filename
    if not src.exists():
        print(f"  ! missing {src}")
        continue

    backup = BACKUP / filename
    if not backup.exists():
        Image.open(src).save(backup)
        print(f"  backed up {filename} -> originals/")

    img = Image.open(src).convert("RGB")
    img = square_crop(img, fx, fy, scale=scale)
    if brighten:
        img = brighten_and_level(img)
    img = img.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
    img.save(src, "JPEG", quality=92)
    print(f"  rewrote {filename}  ->  {OUT_SIZE}x{OUT_SIZE}{' +brighten' if brighten else ''}")
