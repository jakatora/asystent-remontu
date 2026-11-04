"""Confirm the restored project, photograph and original projects in Android SQLite."""
from contextlib import closing
import json
from pathlib import Path, PurePosixPath
import sqlite3
import subprocess
import sys
import tempfile

package = 'pl.asystentremontu.app'
app = '/data/user/0/' + package


def adb(*args):
    return subprocess.check_output(['adb', *args])


fixture = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
project, = fixture['tables']['projects']
photo, = fixture['tables']['project_photos']
house = json.loads(Path(sys.argv[2]).read_text(encoding='utf-8')) if len(sys.argv) == 3 else None
assert adb('shell', 'id', '-u').strip() == b'0'
assert adb('shell', 'getprop', 'ro.kernel.qemu').strip() == b'1'
adb('shell', 'am', 'force-stop', package)
database, = adb('shell', 'find', app, '-name', 'remont_v2.db').decode().splitlines()
path = PurePosixPath(database)
assert path.is_relative_to(app) and '..' not in path.parts
with tempfile.TemporaryDirectory() as directory:
    local = Path(directory) / path.name
    local.write_bytes(adb('exec-out', 'cat', database))
    wal = subprocess.run(['adb', 'shell', 'test', '-f', database + '-wal'], check=False)
    if wal.returncode == 0:
        local.with_name(local.name + '-wal').write_bytes(adb('exec-out', 'cat', database + '-wal'))
    else:
        assert wal.returncode == 1
    with closing(sqlite3.connect(local)) as connection:
        connection.row_factory = sqlite3.Row
        connection.execute('PRAGMA query_only=ON')
        stored_project = connection.execute('SELECT * FROM projects WHERE id=?', (project['id'],)).fetchone()
        stored_photo = connection.execute('SELECT * FROM project_photos WHERE id=?', (photo['id'],)).fetchone()
        assert stored_project is not None and all(stored_project[key] == value for key, value in project.items())
        assert stored_photo is not None and all(stored_photo[key] == value for key, value in photo.items())
        original = json.loads(Path(__file__).with_name('remont-smoke-projects.json').read_text(encoding='utf-8'))
        for row in original:
            assert connection.execute('SELECT name FROM projects WHERE id=?', (row['id'],)).fetchone()['name'] == row['name']
        if house is not None:
            for table in ('house_build_projects', 'build_budget_notes'):
                expected, = house['tables'][table]
                saved = connection.execute(f'SELECT * FROM "{table}" WHERE id=?', (expected['id'],)).fetchone()
                assert saved is not None and all(saved[key] == value for key, value in expected.items()), table
result = {'passed': True, 'projectMatches': True, 'embeddedPhotoMatches': True, 'originalProjectsRetained': len(original)}
if house is not None:
    result.update(houseProjectMatches=True, houseBudgetNoteMatches=True)
print(json.dumps(result))
