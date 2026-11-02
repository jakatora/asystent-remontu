"""Seed only synthetic projects on a disposable rootable emulator running the release APK."""
from pathlib import Path
from contextlib import closing
import subprocess,sqlite3,json,time

package='pl.asystentremontu.app'
def adb(*args):return subprocess.check_output(['adb',*args],text=True).strip()
assert adb('shell','id','-u')=='0','A rootable Google APIs emulator is required, never a user phone'
deadline=time.monotonic()+60
database=None
while time.monotonic()<deadline:
    found=adb('shell','find','/data/user/0/'+package,'-name','remont_v2.db').splitlines()
    if found:
        database=found[0].strip();break
    time.sleep(1)
assert database and database.startswith('/data/user/0/'+package+'/') and database.endswith('/remont_v2.db')
owner=adb('shell','stat','-c','%u:%g',database)
assert all(s.isdigit() for s in owner.split(':'))
local=Path('native-db');local.mkdir(exist_ok=True)
def pull_snapshot():
    for suffix in ['', '-wal', '-shm']:
        target=local/('remont_v2.db'+suffix)
        if target.exists():target.unlink()
        if subprocess.run(['adb','shell','test','-f',database+suffix],capture_output=True).returncode==0:
            subprocess.run(['adb','pull',database+suffix,str(target)],check=True,stdout=subprocess.DEVNULL)
# File creation precedes native migrations. Read isolated copies until all 14
# migrations have committed; never stop the app just because an empty DB exists.
deadline=time.monotonic()+60
schema_ready=False
while time.monotonic()<deadline:
    pull_snapshot()
    try:
        with closing(sqlite3.connect(local/'remont_v2.db')) as probe:
            probe.execute('PRAGMA query_only=ON')
            versions=[r[0] for r in probe.execute('SELECT version FROM schema_versions ORDER BY version')]
            probe.execute('SELECT id FROM projects LIMIT 1').fetchall()
            schema_ready=versions==list(range(1,15))
    except sqlite3.DatabaseError:
        schema_ready=False
    if schema_ready:break
    time.sleep(1)
assert schema_ready,'The release app did not complete native SQLite migrations'
adb('shell','am','force-stop',package)
pull_snapshot()
projects=json.loads(Path(__file__).with_name('remont-smoke-projects.json').read_text())
with closing(sqlite3.connect(local/'remont_v2.db')) as connection:
    assert [r[0] for r in connection.execute('SELECT version FROM schema_versions ORDER BY version')]==list(range(1,15))
    columns={r[1] for r in connection.execute('PRAGMA table_info(projects)')}
    for project in projects:
        assert project['id'].startswith('paint-')
        fields=[k for k in project if k in columns]
        assert not connection.execute('SELECT 1 FROM projects WHERE id=?',(project['id'],)).fetchone()
        connection.execute('INSERT INTO projects ('+','.join(fields)+') VALUES ('+','.join('?' for _ in fields)+')',[project[k] for k in fields])
    connection.commit();connection.execute('PRAGMA wal_checkpoint(TRUNCATE)').fetchall()
subprocess.run(['adb','push',str(local/'remont_v2.db'),database],check=True)
adb('shell','chown',owner,database)
adb('shell','chmod','660',database)
# The only removed files belong to this newly installed test application's DB.
for suffix in ['-wal','-shm']:adb('shell','rm','-f',database+suffix)
print(json.dumps({'syntheticProjects':len(projects),'nativeMigrationsCompleted':14,'databaseCreatedByReleaseApk':True,'deliveryQuotesInjected':False}))
