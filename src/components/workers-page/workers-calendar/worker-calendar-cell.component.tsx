/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from "react";
import { VerboseDate } from "../../../common-models/month-info.model";
import { ShiftCode } from "../../../common-models/shift-info.model";
import { getColor } from "../../schedule-page/table/schedule/schedule-parts/shift-cell/shift-cell.component";
import { fade } from "@material-ui/core";

interface CellOptions {
  keepOn: boolean;
  date: VerboseDate;
  shift: ShiftCode;
  hasNext: boolean;
  notCurrentMonth: boolean;
  workersCalendar: boolean;
}

export function WorkersCalendarCell(params: CellOptions): JSX.Element {
  const date = params.date;
  const shift = params.shift;
  const keepOn = "keepOn" + params.keepOn;
  const hasNext = "hasNext" + params.hasNext;
  const notCurrentMonth = "notCurrentMonth" + params.notCurrentMonth;
  const workersCalendar =
    params.keepOn || params.hasNext ? "" : "_workersCalendar" + params.workersCalendar;
  let shiftColor, background;
  if (shift) {
    shiftColor = `#${getColor(shift)}`;
    background = fade(shiftColor, 0.3);
  } else {
    shiftColor = fade("#FFFFFF", 0);
    background = fade(shiftColor, 0);
  }
  return (
    <>
      <div className={"workersCalendarCell"}>
        <div className={"TopCellPart " + notCurrentMonth}>{date!["date"]}</div>
        <div
          className={
            "BottomCellPart " + keepOn + workersCalendar + shift + " " + hasNext + " " + keepOn
          }
          style={{ color: shiftColor, backgroundColor: background }}
        >
          <div className={"leftBorder leftBorderColor"} style={{ backgroundColor: shiftColor }} />
          <p>{params.keepOn ? void 0 : shift}</p>
        </div>
      </div>
    </>
  );
}