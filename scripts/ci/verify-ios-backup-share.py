"""Verify the file handed to iOS sharing contains the synthetic projects and photo."""
import base64
import json
from pathlib import Path
import subprocess
import sys

container = Path(subprocess.check_output(
    ['xcrun', 'simctl', 'get_app_container', sys.argv[1], 'app.replit.remontasystent', 'data'],
    text=True,
).strip()).resolve()
files = list((container / 'Library' / 'Caches' / 'renovation-backup').glob('asystent-remontu-projekty_*.json'))
assert len(files) == 1, 'Expected one native share file'
backup = json.loads(files[0].read_text(encoding='utf-8'))
assert (backup['format'], backup['version']) == ('asystent-remontu-projects', 1)
expected = json.loads(Path(__file__).with_name('remont-smoke-projects.json').read_text(encoding='utf-8'))
project_ids = {row['id'] for row in backup['tables']['projects']}
assert {row['id'] for row in expected}.issubset(project_ids)
photo, = backup['tables']['project_photos']
assert (photo['id'], photo['project_id']) == ('qa-managed-photo', 'paint-base')
prefix, encoded = photo['uri'].split(',', 1)
assert prefix == 'data:image/png;base64'
assert base64.b64decode(encoded, validate=True) == (
    container / 'Documents' / 'project-photos' / 'photo_qa227.png'
).read_bytes()
print(json.dumps({'passed': True, 'projects': len(project_ids), 'embeddedPhotoMatches': True}))
