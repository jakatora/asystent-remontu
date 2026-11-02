"""Seed only synthetic projects on a disposable rootable emulator running the release APK."""
from pathlib import Path
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
adb('shell','am','force-stop',package)
local=Path('native-db');local.mkdir(exist_ok=True)
for suffix in ['', '-wal', '-shm']:
    if subprocess.run(['adb','shell','test','-f',database+suffix],capture_output=True).returncode==0:
        subprocess.run(['adb','pull',database+suffix,str(local/('remont_v2.db'+suffix))],check=True)
projects=json.loads(Path(__file__).with_name('remont-smoke-projects.json').read_text())
with sqlite3.connect(local/'remont_v2.db') as connection:
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
print(json.dumps({'syntheticProjects':len(projects),'databaseCreatedByReleaseApk':True,'deliveryQuotesInjected':False}))
