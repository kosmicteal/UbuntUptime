import GLib from "gi://GLib";
import St from "gi://St";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import { PopupMenuBase } from "resource:///org/gnome/shell/ui/popupMenu.js";

export default class UbuntUptimeExtensionClass extends Extension {
  #_indicator: PanelMenu.Button | null;
  #_panelButton: St.Bin | null;
  #_panelButtonText: St.Label | null;
  #_popUpMenuItem: PopupMenu.PopupMenuItem | null;
  #_baseUptime: number;
  #_timeout: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(metadata: any) {
    super(metadata);

    this.#_indicator = null;
    this.#_panelButton = null;
    this.#_panelButtonText = null;
    this.#_popUpMenuItem = null;
    this.#_baseUptime = 0;
    this.#_timeout = 0;
  }
  #_getBaseUptime() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_ok, out] = GLib.spawn_command_line_sync(
      "awk '{printf int($1) }' /proc/uptime"
    );
    const utf8decoder = new TextDecoder();
    this.#_baseUptime = parseInt(utf8decoder.decode(out!));
  }

  #_padNumber(number: number) {
    return number.toString().padStart(2, "0");
  }

  #_setButtonText(time: number) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    this.#_baseUptime = time + 1;

    this.#_panelButtonText!.set_text(
      `${this.#_padNumber(hours)} : ${this.#_padNumber(
        minutes
      )} : ${this.#_padNumber(seconds)}`
    );
    return true;
  }

  #_setButtonInBar() {
    this.#_indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
    this.#_panelButton = new St.Bin({
      style_class: "panel-button",
    });
    this.#_panelButtonText = new St.Label({
      text: "-- : -- : --",
      style_class: "panel-text",
    });
    this.#_panelButton.set_child(this.#_panelButtonText);
    this.#_popUpMenuItem = new PopupMenu.PopupMenuItem(_("GNOME Extensions"));
    this.#_popUpMenuItem.connect("activate", () => {
      GLib.spawn_command_line_async("/usr/bin/gnome-extensions-app");
    });
    (this.#_indicator.menu as PopupMenuBase).addMenuItem(this.#_popUpMenuItem);
    this.#_indicator.add_child(this.#_panelButton);
  }

  enable() {
    this.#_setButtonInBar();
    Main.panel.addToStatusArea(this.uuid, this.#_indicator!);
    this.#_getBaseUptime();
    this.#_timeout = GLib.timeout_add_seconds(1, 1.0, () =>
      this.#_setButtonText(this.#_baseUptime)
    );
  }

  disable() {
    GLib.source_remove(this.#_timeout);
    this.#_indicator!.destroy();
    this.#_indicator = null;
  }
}
