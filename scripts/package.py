#!/usr/bin/env python3
"""Reproducible public plugin package from an explicit source allowlist."""
import hashlib,json,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'manifest.json').read_text())
files=['manifest.json','index.js','tasks.js','src/core.js','workbench.html','LICENSE','README.md','AI-GUIDE.md','vendor/Aide-LICENSE','docs/FORMAT.md','docs/FILES.md','docs/VERIFICATION.md']
out=ROOT/'dist';out.mkdir(exist_ok=True)
target=out/('aide-pkg-ProfessionalResume-v'+manifest['version']+'.zip')
with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for name in sorted(files):
  p=ROOT/name
  assert p.is_file() and not p.is_symlink()
  info=zipfile.ZipInfo(name,(2026,11,11,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16
  z.writestr(info,p.read_bytes())
digest=hashlib.sha256(target.read_bytes()).hexdigest()
(out/'SHA256SUMS').write_text(digest+'  '+target.name+'\n')
assert target.stat().st_size<=24*1024*1024
print(json.dumps({'file':str(target),'sha256':digest,'bytes':target.stat().st_size}))
