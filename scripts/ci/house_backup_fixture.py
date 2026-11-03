"""Synthetic records for testing house-building archives on mobile CI."""

STAMP = '2026-11-04T00:00:00.000Z'
PROJECT = 'qa-house-backup'
RECORDS = {
    'house_build_projects': {
        'id': PROJECT, 'name': 'QA Kopia budowy domu', 'notes': 'Testowa notatka inwestora',
        'created_at': STAMP, 'updated_at': STAMP,
    },
    'build_timeline_stages': {
        'id': 'qa-house-timeline', 'project_id': PROJECT, 'stage_key': 'formalities',
        'custom_name': 'Testowy etap harmonogramu', 'estimated_weeks': 3,
        'created_at': STAMP, 'updated_at': STAMP,
    },
    'build_budget_items': {
        'id': 'qa-house-budget', 'project_id': PROJECT, 'stage_key': 'formalities',
        'label': 'Testowa pozycja budżetu', 'user_override': 1234.56, 'created_at': STAMP,
    },
    'build_documents': {
        'id': 'qa-house-document', 'project_id': PROJECT, 'stage_key': 'formalities',
        'name': 'Testowy dokument budowy', 'created_at': STAMP,
    },
}


def seed_house_backup(connection):
    for table, record in RECORDS.items():
        columns = ', '.join(record)
        placeholders = ', '.join('?' for _ in record)
        connection.execute(f'INSERT INTO {table} ({columns}) VALUES ({placeholders})', tuple(record.values()))


def verify_house_backup(backup):
    assert (backup['format'], backup['version']) == ('asystent-remontu-house-build', 1)
    for table, record in RECORDS.items():
        stored, = (row for row in backup['tables'][table] if row['id'] == record['id'])
        assert all(stored[key] == value for key, value in record.items()), f'Unexpected data in {table}'

if __name__ == '__main__':
    import json
    from pathlib import Path
    import sys

    verify_house_backup(json.loads(Path(sys.argv[1]).read_text(encoding='utf-8')))
    print(json.dumps({'passed': True, 'verifiedTables': list(RECORDS)}))
