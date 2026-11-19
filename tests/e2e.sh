#!/usr/bin/env bash
# E2E: load this repo's extension in an isolated headless gnome-shell (own D-Bus,
# in-memory GSettings, temp XDG dirs) so the user's session is never touched.
#   positive: repo metadata          -> ACTIVE; each trim mode and the custom trim string work
#   negative: running major removed  -> OUT OF DATE; every clipboard input left untouched
# Idempotent: all state lives in one temp root that is removed on exit.
set -euo pipefail

repo=$(cd "$(dirname "$0")/.." && pwd)
uuid=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["uuid"])' "$repo/metadata.json")
major=$(gnome-shell --version | grep -oE '[0-9]+' | head -1)
probe=e2e-probe@trimmy.test
root=$(mktemp -d)
cleanup() { # the session's xdg-document-portal FUSE-mounts $XDG_RUNTIME_DIR/doc and may outlive the bus
  for m in "$root"/*/runtime/doc; do fusermount3 -uz "$m" 2>/dev/null || true; done
  rm -rf "$root"
}
trap cleanup EXIT

# Probe extension: sets the clipboard from inside the Shell (wl-copy can't, it is
# never focused in a headless session), then records what the clipboard holds.
write_probe() { # $1=extensions dir
  mkdir -p "$1/$probe"
  printf '{"uuid":"%s","name":"e2e probe","description":"test only","shell-version":["%s"]}' \
    "$probe" "$major" >"$1/$probe/metadata.json"
  cat >"$1/$probe/extension.js" <<'EOF'
import GLib from "gi://GLib";
import St from "gi://St";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import {Extension} from "resource:///org/gnome/shell/extensions/extension.js";
// [trim-mode, trim-string, clipboard input]; results are joined with "|"
const CASES = [[0, "", "  hi  "], [1, "", "  hi  "], [2, "", "  hi  "], [0, "$", " $ls$ "]];
export default class Probe extends Extension {
  enable() {
    const cb = St.Clipboard.get_default();
    // null when trimmy is not running (negative control): settings stay untouched
    const settings = Main.extensionManager.lookup(GLib.getenv("E2E_UUID"))?.stateObj?.getSettings();
    const results = [];
    const next = () => {
      if (results.length === CASES.length) {
        GLib.file_set_contents(GLib.getenv("E2E_OUT"), results.join("|"));
        return;
      }
      const [mode, str, input] = CASES[results.length];
      settings?.set_int("trim-mode", mode);
      settings?.set_string("trim-string", str);
      cb.set_text(St.ClipboardType.CLIPBOARD, input);
      this._id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
        cb.get_text(St.ClipboardType.CLIPBOARD, (_, text) => {
          results.push(text ?? "");
          next();
        });
        this._id = 0;
        return GLib.SOURCE_REMOVE;
      });
    };
    next();
  }
  disable() {
    if (this._id) GLib.source_remove(this._id);
    this._id = 0;
  }
}
EOF
}

run_case() { # $1=label $2=metadata.json $3=expected state $4=expected clipboard
  local tmp; tmp=$(mktemp -d -p "$root")
  local exts="$tmp/data/gnome-shell/extensions"
  mkdir -p "$exts/$uuid" "$tmp/config" "$tmp/runtime"; chmod 700 "$tmp/runtime"
  cp -r "$repo/extension.js" "$repo/prefs.js" "$repo/schemas" "$exts/$uuid/"
  cp "$2" "$exts/$uuid/metadata.json"
  glib-compile-schemas "$exts/$uuid/schemas" # what the Shell's installer does on install
  write_probe "$exts"

  XDG_DATA_HOME="$tmp/data" XDG_CONFIG_HOME="$tmp/config" XDG_RUNTIME_DIR="$tmp/runtime" \
  GSETTINGS_BACKEND=memory GIO_USE_VFS=local E2E_OUT="$tmp/clip" E2E_UUID="$uuid" \
  dbus-run-session -- bash -c '
    gnome-shell --headless --virtual-monitor 800x600 --wayland-display=trimmy-e2e &
    for _ in $(seq 100); do
      gdbus call --session -d org.gnome.Shell -o /org/gnome/Shell \
        -m org.freedesktop.DBus.Properties.Get org.gnome.Shell.Extensions ShellVersion &>/dev/null && break
      sleep 0.2
    done
    gnome-extensions enable "$1" || true   # fails by design in the negative case
    gnome-extensions info "$1" | sed -n "s/^ *State: //p" >"$0/state"
    gnome-extensions enable "$2"
    for _ in $(seq 50); do [[ -e $E2E_OUT ]] && break; sleep 0.2; done
    kill %1; wait
  ' "$tmp" "$uuid" "$probe" >"$tmp/shell.log" 2>&1 || true

  local state clip
  state=$(cat "$tmp/state" 2>/dev/null || echo "?")
  clip=$(cat "$tmp/clip" 2>/dev/null || echo "<none>")
  if [[ $state == "$3" && $clip == "$4" ]]; then
    echo "PASS $1: state=$state clipboard='$clip'"
  else
    echo "FAIL $1: state=$state (want $3) clipboard='$clip' (want '$4')"
    grep -iE 'trimmy|probe|error' "$tmp/shell.log" | tail -20
    return 1
  fi
}

rc=0 # run every case even if one fails
run_case "shell $major, repo metadata" "$repo/metadata.json" ACTIVE "hi|hi  |  hi|ls" || rc=1

neg="$root/negative-metadata.json"
python3 - "$repo/metadata.json" "$major" >"$neg" <<'EOF'
import json, sys
m = json.load(open(sys.argv[1]))
m["shell-version"] = [v for v in m["shell-version"] if v.split(".")[0] != sys.argv[2]]
print(json.dumps(m))
EOF
run_case "negative control, shell $major removed" "$neg" "OUT OF DATE" '  hi  |  hi  |  hi  | $ls$ ' || rc=1
exit $rc
