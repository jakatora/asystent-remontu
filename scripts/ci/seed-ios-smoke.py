"""Seed synthetic projects into an isolated CI Simulator; never quote fixtures."""
from pathlib import Path
import json, sqlite3, subprocess, sys, time
from managed_photo_fixture import write_managed_photo
from house_backup_fixture import seed_house_backup

udid=sys.argv[1]
container=Path(subprocess.check_output(['xcrun','simctl','get_app_container',udid,'app.replit.remontasystent','data'],text=True).strip()).resolve()
deadline=time.monotonic()+45
database=None
while time.monotonic()<deadline:
    paths=list(container.rglob('remont_v2.db'))
    if paths:
        candidate=paths[0].resolve()
        assert candidate.is_relative_to(container)
        try:
            with sqlite3.connect(candidate) as connection:
                connection.execute('SELECT id FROM projects LIMIT 1').fetchall()
            database=candidate
            break
        except sqlite3.OperationalError:
            pass
    time.sleep(1)
assert database,'Native application did not create the project database'
subprocess.run(['xcrun','simctl','terminate',udid,'app.replit.remontasystent'],check=True)
projects=json.loads(Path(__file__).with_name('remont-smoke-projects.json').read_text(encoding='utf-8'))
managed_photo='--managed-photo' in sys.argv[2:]
if managed_photo:
    name='photo_qa227.png'
    photo_dir=container/'Documents'/'project-photos'
    photo_dir.mkdir(parents=True,exist_ok=True)
    write_managed_photo(photo_dir/name)
with sqlite3.connect(database) as connection:
    columns={row[1] for row in connection.execute('PRAGMA table_info(projects)')}
    for project in projects:
        assert project['id'].startswith('paint-')
        fields=[key for key in project if key in columns]
        values=[project[key] for key in fields]
        assert not connection.execute('SELECT 1 FROM projects WHERE id=?',(project['id'],)).fetchone()
        connection.execute('INSERT INTO projects ('+','.join(fields)+') VALUES ('+','.join('?' for _ in fields)+')',values)
    if managed_photo:
        connection.execute(
            'INSERT INTO project_photos (id,project_id,uri,photo_type,created_at) VALUES (?,?,?,?,?)',
            ('qa-managed-photo','paint-base','project-photo:'+name,'before',projects[0]['created_at']),
        )
    if '--house-backup' in sys.argv[2:]:
        seed_house_backup(connection)
    connection.commit()
    connection.execute('PRAGMA wal_checkpoint(TRUNCATE)').fetchall()
print(json.dumps({'syntheticProjects':len(projects),'managedPhoto':managed_photo,'databaseCreatedByNativeApp':True,'deliveryQuotesInjected':False}))
