"""Verify the imported project and image in the simulator's persisted SQLite."""
from contextlib import closing
import json
from pathlib import Path
import sqlite3
import subprocess
import sys

udid, fixture = sys.argv[1:]
bundle = 'app.replit.remontasystent'
container = Path(subprocess.check_output(
    ['xcrun', 'simctl', 'get_app_container', udid, bundle, 'data'], text=True,
).strip()).resolve()
subprocess.run(['xcrun', 'simctl', 'terminate', udid, bundle], check=True)
database, = container.rglob('remont_v2.db')
assert database.resolve().is_relative_to(container)
backup = json.loads(Path(fixture).read_text(encoding='utf-8'))
originals = json.loads(Path(__file__).with_name('remont-smoke-projects.json').read_text(encoding='utf-8'))
with closing(sqlite3.connect(database)) as db:
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA query_only=ON')
    for table in ('projects', 'project_photos'):
        expected, = backup['tables'][table]
        saved = db.execute(f'SELECT * FROM "{table}" WHERE id=?', (expected['id'],)).fetchone()
        assert saved is not None and all(saved[key] == value for key, value in expected.items()), table
    for project in originals:
        saved = db.execute('SELECT name FROM projects WHERE id=?', (project['id'],)).fetchone()
        assert saved is not None and saved['name'] == project['name']
print(json.dumps({'passed': True, 'projectMatches': True, 'embeddedPhotoMatches': True,
                  'originalProjectsRetained': len(originals)}))
