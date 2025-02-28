/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { CellColorSet } from "./cell-color-set.model";
import { Color, Colors } from "./color.model";

export class ColorHelper {
  static get DEFAULT_COLOR_SET(): CellColorSet {
    return { textColor: Colors.BLACK, backgroundColor: Colors.WHITE };
  }

  static getHighlightColor(): Color {
    return Colors.LIGHT_BLUE.fade(0.4);
  }

  public static getBorderColor(): Color {
    return Colors.LIGHT_GREY;
  }

  public static getDefaultColor(): Color {
    return Colors.WHITE;
  }
}
