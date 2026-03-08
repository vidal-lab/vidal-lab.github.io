#!/bin/bash
# Optimize photos for web using macOS sips
# Resizes large photos to web-appropriate dimensions

PHOTO_DIR="$(dirname "$0")/../photos"
OUT_DIR="$(dirname "$0")/../assets/img"

mkdir -p "$OUT_DIR/headshots" "$OUT_DIR/group"

echo "=== Optimizing Rene headshots ==="
for f in "$PHOTO_DIR/Rene headshots/"*.jpg; do
    name=$(basename "$f")
    sips -Z 600 "$f" --out "$OUT_DIR/headshots/rene-${name}" 2>/dev/null
    echo "  → rene-${name}"
done

echo "=== Optimizing Sonia headshots ==="
for f in "$PHOTO_DIR/Sonia headshots/"*.jpg; do
    name=$(basename "$f")
    sips -Z 600 "$f" --out "$OUT_DIR/headshots/sonia-${name}" 2>/dev/null
    echo "  → sonia-${name}"
done

echo "=== Optimizing Student headshots ==="
for f in "$PHOTO_DIR/Vidal Lab Student Headshots/"*.jpg; do
    name=$(basename "$f")
    clean_name=$(echo "$name" | sed 's/Vidal Lab-/student-/')
    sips -Z 600 "$f" --out "$OUT_DIR/headshots/${clean_name}" 2>/dev/null
    echo "  → ${clean_name}"
done

echo "=== Optimizing Group photos ==="
for f in "$PHOTO_DIR/"Vidal\ Lab\ Group\ Photo-*.jpg; do
    name=$(basename "$f")
    clean_name=$(echo "$name" | sed 's/Vidal Lab Group Photo-/group-/')
    sips -Z 1200 "$f" --out "$OUT_DIR/group/${clean_name}" 2>/dev/null
    echo "  → ${clean_name}"
done

echo "=== Done ==="
ls -lh "$OUT_DIR/headshots/" | head -5
echo "..."
ls -lh "$OUT_DIR/group/"
