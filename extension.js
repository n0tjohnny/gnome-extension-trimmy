/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import {Extension} from "resource:///org/gnome/shell/extensions/extension.js";
import GLib from "gi://GLib";
import Meta from "gi://Meta";
import St from "gi://St";
import {trim} from "./trim.js";

export default class TrimmerExtension extends Extension {
  constructor(metadata) {
    super(metadata);
    this._clipboard = null;
    this._selection = null;
    this._trimId = null;
    this._settings = null;
    this._owner = null;
    this._ownSource = null;
  }

  _processClipboardContent(owner, text) {
    // A newer copy, or this extension's own write, replaced the owner while the reply was in flight
    if (owner !== this._owner || text === null) {
      return;
    }

    const result = trim(
      text,
      this._settings.get_int("trim-mode"),
      this._settings.get_string("trim-string"),
    );
    if (result === text) {
      return;
    }

    this._ownSource = Meta.SelectionSourceMemory.new(
      "text/plain;charset=utf-8",
      new GLib.Bytes(new TextEncoder().encode(result)),
    );
    this._selection.set_owner(Meta.SelectionType.SELECTION_CLIPBOARD, this._ownSource);
  }

  _getClipboardContent(owner) {
    this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (_, text) => {
      this._processClipboardContent(owner, text);
    });
  }

  enable() {
    this._settings = this.getSettings();
    this._clipboard = St.Clipboard.get_default();
    this._selection = global.display.get_selection();
    this._trimId = this._selection.connect(
      "owner-changed",
      (_, selectionType, owner) => {
        if (selectionType !== Meta.SelectionType.SELECTION_CLIPBOARD) {
          return;
        }
        this._owner = owner;
        // Copied files also offer their paths as text; replacing them with text would break pasting the files
        if (owner && owner !== this._ownSource && !owner.get_mimetypes().includes("text/uri-list")) {
          this._getClipboardContent(owner);
        }
      },
    );
  }

  disable() {
    if (this._selection && this._trimId) {
      this._selection.disconnect(this._trimId);
    }
    this._selection = null;
    this._trimId = null;
    this._clipboard = null;
    this._settings = null;
    this._owner = null;
    this._ownSource = null;
  }
}
