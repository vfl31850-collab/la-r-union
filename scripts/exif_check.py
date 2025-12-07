#!/usr/bin/env python3
"""
Parcourt `assets/images/` et affiche les métadonnées EXIF pertinentes.
Si Pillow n'est pas installé, le script imprime une instruction claire.
"""
import os
import sys
from pathlib import Path
suspicious_keywords = ('midjourney','mid-journey','dall','dalle','openai','stability','stable','ai','generated')
root = Path(__file__).resolve().parent.parent
img_dir = root / 'assets' / 'images'
if not img_dir.exists():
    print('ERROR: assets/images/ not found at', img_dir)
    sys.exit(2)
try:
    from PIL import Image, ExifTags
except Exception as e:
    print('MISSING_PILLOW')
    print('Install Pillow in your environment:')
    print('  pip install Pillow')
    sys.exit(3)

TAG_MAP = {v:k for k,v in ExifTags.TAGS.items()}

def read_exif(path: Path):
    try:
        with Image.open(path) as im:
            exif = im._getexif() or {}
            out = {}
            for k,v in exif.items():
                name = ExifTags.TAGS.get(k, k)
                out[name] = v
            return out
    except Exception as e:
        return {'_error': str(e)}

results = []
for p in sorted(img_dir.iterdir()):
    if not p.is_file():
        continue
    lower = p.name.lower()
    rec = {'file': p.name, 'suspicious_name': any(k in lower for k in suspicious_keywords)}
    exif = read_exif(p)
    rec['exif'] = {}
    if '_error' in exif:
        rec['exif_error'] = exif['_error']
    else:
        for key in ('Software','Artist','ImageDescription','Make','Model'):
            if key in exif:
                rec['exif'][key] = exif[key]
    # quick heuristic: check string values for suspicious keywords
    rec['suspicious_exif'] = any((isinstance(v,str) and any(k in v.lower() for k in suspicious_keywords)) for v in rec.get('exif',{}).values())
    results.append(rec)

# Print machine-friendly and human-friendly output
for r in results:
    print('FILE:', r['file'])
    if r.get('exif_error'):
        print('  EXIF_ERROR:', r['exif_error'])
    if r['exif']:
        for k,v in r['exif'].items():
            print(f'  {k}: {v}')
    if r['suspicious_name']:
        print('  SUSPICIOUS_NAME: filename contains probable AI keyword')
    if r['suspicious_exif']:
        print('  SUSPICIOUS_EXIF: metadata contains probable AI keyword')
    if not r['exif'] and not r.get('exif_error'):
        print('  NO_EXIF')
    print('')

# Summary
sus = [r for r in results if r['suspicious_name'] or r['suspicious_exif']]
print('SUMMARY:')
if sus:
    for r in sus:
        flags = []
        if r['suspicious_name']: flags.append('name')
        if r['suspicious_exif']: flags.append('exif')
        print(f" - {r['file']} => suspicious ({','.join(flags)})")
    sys.exit(0)
else:
    print('No suspicious images found by heuristics.')
    sys.exit(0)
