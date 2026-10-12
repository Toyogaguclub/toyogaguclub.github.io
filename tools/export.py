#!/usr/bin/env python3
"""Build the public static site from the Builder's data.

usage: export.py PAGE DB_DIR ASSET_DIR OUT_DIR
  PAGE      the artifact page source (collective-seoul.html)
  DB_DIR    ArtifactData dump: products/*.json, archive/*.json, site/config.json
  ASSET_DIR files named <asset id>.<ext> (downloaded from the artifact)
  OUT_DIR   site root to write (index.html, img/, .nojekyll)
Exits 2 and prints the ids when a referenced asset file is missing.
"""
import glob, json, os, shutil, sys

page, dbdir, adir, out = sys.argv[1:5]
def load(pattern):
    return {os.path.basename(f)[:-5]: json.load(open(f, encoding='utf-8')) for f in sorted(glob.glob(os.path.join(dbdir, pattern)))}
products, archive = load('products/*.json'), load('archive/*.json')
config = json.load(open(os.path.join(dbdir, 'site', 'config.json'), encoding='utf-8'))

ids = []
for p in products.values():
    ids += [p.get('thumb')] + list(p.get('photos') or [])
for a in archive.values():
    ids += list(a.get('photos') or []) + [a.get('image')]
ids += [config.get('logo'), (config.get('brief') or {}).get('id')]
ids = [i for i in dict.fromkeys(ids) if i]

os.makedirs(os.path.join(out, 'img'), exist_ok=True)
files, missing = {}, []
for i in ids:
    hit = [f for f in glob.glob(os.path.join(adir, i + '.*'))]
    if not hit:
        missing.append(i); continue
    ext = os.path.splitext(hit[0])[1].lower()
    shutil.copyfile(hit[0], os.path.join(out, 'img', i + ext))
    files[i] = 'img/' + i + ext
if missing:
    print('MISSING', ' '.join(missing)); sys.exit(2)
# drop images no longer referenced
for f in glob.glob(os.path.join(out, 'img', '*')):
    if os.path.splitext(os.path.basename(f))[0] not in files: os.remove(f)

data = json.dumps({'products': products, 'archive': archive, 'config': config, 'files': files}, ensure_ascii=False).replace('</', '<\\/')
body = open(page, encoding='utf-8').read()
html = ('<!doctype html><html lang="ko"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '</head><body><script>window.__CS_STATIC__=' + data + ';</script>\n' + body + '\n</body></html>')
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
open(os.path.join(out, '.nojekyll'), 'w').close()
print('OK', len(products), 'products,', len(archive), 'exhibitions,', len(files), 'images')
