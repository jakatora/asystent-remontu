#!/usr/bin/env bash
set -euo pipefail

# Shared by a fresh simulator build and a hash-verified binary retry.
cd "$CM_BUILD_DIR"
curl -fsSL https://get.maestro.mobile.dev | bash
export PATH="$HOME/.maestro/bin:$PATH"
mkdir -p native-screens
smoke_status=0
maestro --device "$REMONT_SIM_UDID" test --config scripts/ci/ios-native/config.yaml --format junit --output native-smoke.xml scripts/ci/ios-native || smoke_status=$?
maestro --device "$REMONT_SIM_UDID" test --format junit --output native-photo-smoke.xml scripts/ci/ios-managed-photo.yaml
if maestro --device "$REMONT_SIM_UDID" test --format junit --output native-backup-share.xml scripts/ci/ios-backup-share.yaml; then
  python3 scripts/ci/verify-ios-backup-share.py "$REMONT_SIM_UDID" > native-backup-share-verification.json || smoke_status=$?
else
  smoke_status=$?
fi
if [ "${REMONT_TEST_HOUSE_BACKUP:-0}" = "1" ]; then
  maestro --device "$REMONT_SIM_UDID" test --format junit --output native-house-backup-share.xml scripts/ci/ios-house-backup-share.yaml
  python3 scripts/ci/verify-ios-backup-share.py "$REMONT_SIM_UDID" --house-backup > native-house-backup-share-verification.json
fi
if [ "${REMONT_TEST_BACKUP_RESTORE:-0}" = "1" ]; then
  python3 scripts/ci/prepare-ios-backup-restore.py "$REMONT_SIM_UDID" remont-qa-ios-import.json
  maestro --device "$REMONT_SIM_UDID" test --format junit --output native-backup-restore.xml scripts/ci/ios-backup-restore.yaml
  python3 scripts/ci/verify-ios-backup-restore.py "$REMONT_SIM_UDID" remont-qa-ios-import.json > native-backup-restore-verification.json
fi
exit "$smoke_status"
