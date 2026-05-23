#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT/android"
SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}"
KEYSTORE_PROPS="$ANDROID_DIR/keystore.properties"
# Upload key registered in Play Console (App signing → Upload key certificate)
PLAY_EXPECTED_SHA1="CD:5C:BA:77:6A:79:2D:B2:54:96:FC:CC:71:B1:AC:A7:38:86:F2:83"

cd "$ROOT"

ensure_sdk() {
  if [[ -f "$ANDROID_DIR/local.properties" ]]; then
    return
  fi

  mkdir -p "$SDK_ROOT/cmdline-tools"
  if [[ ! -x "$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" ]]; then
    echo "Installing Android command-line tools into $SDK_ROOT ..."
    TMP_ZIP="$(mktemp /tmp/cmdline-tools.XXXXXX.zip)"
    curl -fsSL -o "$TMP_ZIP" \
      "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    rm -rf "$SDK_ROOT/cmdline-tools/latest"
    unzip -q "$TMP_ZIP" -d "$SDK_ROOT/cmdline-tools"
    mv "$SDK_ROOT/cmdline-tools/cmdline-tools" "$SDK_ROOT/cmdline-tools/latest"
    rm -f "$TMP_ZIP"
  fi

  export ANDROID_SDK_ROOT="$SDK_ROOT"
  export ANDROID_HOME="$SDK_ROOT"
  yes | "$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK_ROOT" --licenses >/dev/null || true
  "$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK_ROOT" \
    "platform-tools" "platforms;android-35" "build-tools;35.0.0"

  echo "sdk.dir=$SDK_ROOT" >"$ANDROID_DIR/local.properties"
}

require_upload_keystore() {
  if [[ ! -f "$KEYSTORE_PROPS" ]]; then
    echo "" >&2
    echo "ERROR: Missing $KEYSTORE_PROPS" >&2
    echo "" >&2
    echo "Play Console expects upload key SHA1:" >&2
    echo "  $PLAY_EXPECTED_SHA1" >&2
    echo "" >&2
    echo "Copy android/keystore.properties.example to keystore.properties and point" >&2
    echo "storeFile at your ORIGINAL upload keystore (from Android Studio or your first release)." >&2
    echo "" >&2
    echo "Verify before building:" >&2
    echo "  bash scripts/android-verify-signing.sh /path/to/your-upload.keystore" >&2
    echo "" >&2
    echo "The auto-generated nyimbozakristo-upload.keystore is NOT registered with Play — do not use it." >&2
    exit 1
  fi

  if ! PLAY_EXPECTED_SHA1="$PLAY_EXPECTED_SHA1" bash "$(dirname "$0")/android-verify-signing.sh"; then
    echo "" >&2
    echo "Fix android/keystore.properties to use the keystore that matches Play Console," >&2
    echo "then run: npm run android:play" >&2
    exit 1
  fi
}

echo "==> Building web app and syncing Capacitor"
npm run android:sync

ensure_sdk
require_upload_keystore

echo "==> Building signed release App Bundle (.aab)"
cd "$ANDROID_DIR"
./gradlew bundleRelease

AAB="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
if [[ -f "$AAB" ]]; then
  echo ""
  echo "Play Console upload bundle:"
  echo "  $AAB"
  ls -lh "$AAB"
else
  echo "Bundle not found at expected path." >&2
  exit 1
fi
