/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useContext, useMemo } from "react";
import { VerboseDate } from "../../common-models/month-info.model";
import { DataRowHelper } from "../../helpers/data-row.helper";
import { DataRow } from "../../logic/schedule-logic/data-row";
import { MonthInfoLogic } from "../../logic/schedule-logic/month-info.logic";
import { ScheduleLogicContext } from "../schedule-page/table/schedule/use-schedule-state";
import { TimeTableCell } from "./timetable-cell.component";

export interface TimeTableRowOptions {
  uuid: string;
  dataRow: DataRow;
}

export function TimeTableRowF({ dataRow, uuid }: TimeTableRowOptions): JSX.Element {
  const scheduleLogic = useContext(ScheduleLogicContext);

  function getVerboseDates(): [VerboseDate[], number] {
    if (
      scheduleLogic?.sections.Metadata?.verboseDates &&
      scheduleLogic.sections.Metadata.verboseDates.length > 0
    ) {
      return [
        scheduleLogic?.sections.Metadata?.verboseDates,
        scheduleLogic.sections.Metadata.monthNumber,
      ];
    } else {
      const today = new Date();

      const monthLogic = new MonthInfoLogic(
        today.getMonth(),
        today.getFullYear().toString(),
        dataRow.rowData()
      );

      return [monthLogic.verboseDates, monthLogic.monthNumber];
    }
  }

  const [verboseDates, currMont] = getVerboseDates();

  const data = useMemo(() => dataRow.rowData(false), [dataRow]);
  return (
    <tr className="row" id="timetableRow">
      {data.map((cellData, cellIndex) => {
        return (
          <TimeTableCell
            key={`${dataRow.rowKey}_${cellData}_${cellIndex}${uuid}}`}
            value={verboseDates[cellIndex]}
            currMonth={currMont}
            index={cellIndex}
          />
        );
      })}
    </tr>
  );
}

export const TimeTableRow = React.memo(TimeTableRowF, (prev, next) => {
  return DataRowHelper.areDataRowsEqual(prev.dataRow, next.dataRow) && prev.uuid === next.uuid;
});
