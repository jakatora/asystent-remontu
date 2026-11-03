"""Check the native Android share file on the disposable emulator."""
import base64
import json
from pathlib import Path, PurePosixPath
import subprocess

app = '/data/user/0/pl.asystentremontu.app'


def adb(*args):
    return subprocess.check_output(['adb', *args])


assert adb('shell', 'id', '-u').strip() == b'0', 'A rootable emulator is required'
cache = app + '/cache/renovation-backup'
files = adb('shell', 'ls', '-1', cache).decode().splitlines()
assert len(files) == 1, 'Expected one native share file'
name = PurePosixPath(files[0])
assert name.name == files[0] and name.name.startswith('asystent-remontu-projekty_') and name.suffix == '.json'
backup = json.loads(adb('exec-out', 'cat', cache + '/' + name.name))
assert (backup['format'], backup['version']) == ('asystent-remontu-projects', 1)
expected = json.loads(Path(__file__).with_name('remont-smoke-projects.json').read_text(encoding='utf-8'))
project_ids = {row['id'] for row in backup['tables']['projects']}
assert project_ids == {row['id'] for row in expected}
photo, = backup['tables']['project_photos']
assert (photo['id'], photo['project_id']) == ('qa-managed-photo', 'paint-base')
prefix, encoded = photo['uri'].split(',', 1)
assert prefix == 'data:image/png;base64'
assert base64.b64decode(encoded, validate=True) == adb('exec-out', 'cat', app + '/files/project-photos/photo_qa233.png')
print(json.dumps({'passed': True, 'projects': len(project_ids), 'embeddedPhotoMatches': True}))
