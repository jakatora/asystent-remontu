"""Prepare a new synthetic project in the simulator's verified Files folder."""
import json
from pathlib import Path
import subprocess
import sys

udid = sys.argv[1]
assert (Path.home() / 'Library/Developer/CoreSimulator/Devices' / udid).is_dir()
container = Path(subprocess.check_output(
    ['xcrun', 'simctl', 'get_app_container', udid, 'app.replit.remontasystent', 'data'],
    text=True,
).strip()).resolve()
source, = (container / 'Library/Caches/renovation-backup').glob('asystent-remontu-projekty_*.json')
containers = next(parent for parent in container.parents if parent.name == 'Containers')
copies = [path for path in containers.rglob(source.name)
          if path.is_file() and path.resolve() != source.resolve() and path.read_bytes() == source.read_bytes()]
assert copies, 'No verified Files copy'
backup = json.loads(source.read_bytes())
project, = (row for row in backup['tables']['projects'] if row['id'] == 'paint-base')
photo, = backup['tables']['project_photos']
assert photo['project_id'] == project['id']
tables = {key: [] for key in backup['tables']}
project_id = 'qa-ios-backup-import'
tables['projects'] = [{**project, 'id': project_id, 'name': 'QA Kopia iOS'}]
tables['project_photos'] = [{**photo, 'id': 'qa-ios-backup-photo', 'project_id': project_id}]
file = Path(sys.argv[2])
file.write_text(json.dumps({**backup, 'tables': tables, 'preferences': {}}), encoding='utf-8')
for copy in copies:
    with copy.with_name(file.name).open('xb') as output:
        output.write(file.read_bytes())
