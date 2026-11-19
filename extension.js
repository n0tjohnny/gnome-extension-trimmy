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
    this._ownWrite = null;
  }

  _processClipboardContent(text) {
    // Our own set_text fires owner-changed too; trimming it again would strip the trim string twice
    const isOwnWrite = text === this._ownWrite;
    this._ownWrite = null;
    // get_text is async: the reply can arrive after disable()
    if (isOwnWrite || text === null || !this._settings) {
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

    this._ownWrite = result;
    this._clipboard.set_text(St.ClipboardType.CLIPBOARD, result);
  }

  _getClipboardContent() {
    this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (_, text) => {
      this._processClipboardContent(text);
    });
  }

  enable() {
    this._settings = this.getSettings();
    this._clipboard = St.Clipboard.get_default();
    this._selection = global.display.get_selection();
    this._trimId = this._selection.connect(
      "owner-changed",
      (_, selectionType) => {
        if (selectionType === Meta.SelectionType.SELECTION_CLIPBOARD) {
          this._getClipboardContent();
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
    this._ownWrite = null;
  }
}