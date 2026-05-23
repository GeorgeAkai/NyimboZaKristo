#!/usr/bin/env bash
# Print SHA1 fingerprint(s) for a keystore. Compare with Play Console → App signing → Upload key certificate.
set -euo pipefail

ANDROID_DIR="$(cd "$(dirname "$0")/../android" && pwd)"
PROPS="$ANDROID_DIR/keystore.properties"
EXPECTED_SHA1="${PLAY_EXPECTED_SHA1:-CD:5C:BA:77:6A:79:2D:B2:54:96:FC:CC:71:B1:AC:A7:38:86:F2:83}"

if [[ -f "$PROPS" ]]; then
  KEYSTORE_FILE="$(grep '^storeFile=' "$PROPS" | cut -d= -f2- | tr -d '\r')"
  KEYSTORE_PASS="$(grep '^storePassword=' "$PROPS" | cut -d= -f2- | tr -d '\r')"
  KEY_ALIAS="$(grep '^keyAlias=' "$PROPS" | cut -d= -f2- | tr -d '\r')"
  KEYSTORE_PATH="$ANDROID_DIR/$KEYSTORE_FILE"
  if [[ "$KEYSTORE_FILE" == /* ]]; then
    KEYSTORE_PATH="$KEYSTORE_FILE"
  fi
else
  KEYSTORE_PATH="${1:-}"
  KEYSTORE_PASS="${2:-}"
  KEY_ALIAS="${3:-}"
fi

if [[ -z "${KEYSTORE_PATH:-}" || ! -f "$KEYSTORE_PATH" ]]; then
  echo "Usage: $0 [path/to/upload.keystore] [storePassword] [keyAlias]" >&2
  echo "Or configure android/keystore.properties first." >&2
  exit 1
fi

if [[ -z "${KEYSTORE_PASS:-}" ]]; then
  read -r -s -p "Keystore password: " KEYSTORE_PASS
  echo
fi

KEY_ALIAS="${KEY_ALIAS:-upload}"

echo "Keystore: $KEYSTORE_PATH"
echo "Alias: $KEY_ALIAS"
echo ""

SHA1="$(keytool -list -v -keystore "$KEYSTORE_PATH" -storepass "$KEYSTORE_PASS" -alias "$KEY_ALIAS" 2>/dev/null | awk -F': ' '/SHA1:/{print $2; exit}')"

if [[ -z "$SHA1" ]]; then
  echo "Could not read certificate. Check path, password, and alias." >&2
  exit 1
fi

echo "SHA1: $SHA1"
echo ""
echo "Play Console expects: $EXPECTED_SHA1"

if [[ "$(echo "$SHA1" | tr '[:lower:]' '[:upper:]')" == "$(echo "$EXPECTED_SHA1" | tr '[:lower:]' '[:upper:]')" ]]; then
  echo "OK — this keystore matches Play Console."
  exit 0
fi

echo "MISMATCH — do not upload a bundle signed with this keystore." >&2
exit 1
