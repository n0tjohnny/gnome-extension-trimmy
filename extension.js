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
import Shell from "gi://Shell";
import St from "gi://St";

export default class TrimmerExtension extends Extension {
  constructor(metadata) {
    super(metadata);
    this._clipboard = null;
    this._selection = null;
    this._trimId = null;
    this._settings = null;
  }

  _processClipboardContent(text) {
    if (!text) {
      return;
    }

    const trimMode = this._settings.get_int("trim-mode");
    const trimString = this._settings.get_string("trim-string");
    let trimText;

    if (trimMode === 0) {
      trimText = text.trim();
      if (trimString) {
        // Fix regex to handle the custom string properly
        trimText = trimText.replace(new RegExp(`^${this._escapeRegex(trimString)}|${this._escapeRegex(trimString)}$`, 'g'), '');
      }
    } else if (trimMode === 1) {
      trimText = text.trimStart();
      if (trimString) {
        trimText = trimText.replace(new RegExp(`^${this._escapeRegex(trimString)}`, 'g'), '');
      }
    } else if (trimMode === 2) {
      trimText = text.trimEnd();
      if (trimString) {
        trimText = trimText.replace(new RegExp(`${this._escapeRegex(trimString)}$`, 'g'), '');
      }
    }

    if (!trimText) {
      return;
    }

    if (trimText === text) {
      return;
    }

    this._clipboard.set_text(St.ClipboardType.CLIPBOARD, trimText);
  }

  // Helper function to escape special regex characters
  _escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _getClipboardContent() {
    this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (_, text) => {
      this._processClipboardContent(text);
    });
  }

  enable() {
    // Use default settings without custom ID
    this._settings = this.getSettings();
    this._clipboard = St.Clipboard.get_default();
    
    const display = global.display;
    this._selection = display.get_selection();
    
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
  }
}