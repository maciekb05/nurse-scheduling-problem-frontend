/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React from "react";
import { ScheduleError } from "../../../../../common-models/schedule-error.model";
import { useMonthInfo } from "../../../validation-drawer/use-verbose-dates";
import { BaseCellComponent } from "./base-cell/base-cell.component";
import { baseRowDataCy, BaseRowOptions, toCellDataItemArray } from "./base-row.models";

export function BaseRowComponent(options: BaseRowOptions): JSX.Element {
  const {
    rowIndex,
    dataRow,
    cellComponent: CellComponent = BaseCellComponent,
    pointerPosition = -1,
    onKeyDown,
    onClick,
    onDrag,
    onDragEnd,
    onSave,
    sectionKey,
    selection = [],
    isEditable = true,
    errorSelector,
    defaultEmpty = "",
  } = options;

  const { verboseDates, monthNumber: currMonthNumber } = useMonthInfo();
  const numberOfDays = verboseDates?.length;
  const firstMonthDayIndex = verboseDates?.findIndex((date) => date.date === 1);

  const isCellFromPrevMonth = (index, firstMonthDayIndex): boolean => {
    return index < firstMonthDayIndex;
  };

  function saveValue(newValue: string): void {
    onSave?.(newValue);
  }

  let data = toCellDataItemArray(dataRow.rowData(false));

  if (numberOfDays && data.length !== numberOfDays) {
    const diff = numberOfDays - data.length;
    data = [...data, ...Array.from(Array(diff))];
  }

  return (
    <div className="row scheduleStyle" id="mainRow" data-cy={baseRowDataCy(rowIndex)}>
      {data.map((dataItem = { value: defaultEmpty }, cellIndex) => (
        <CellComponent
          {...{
            ...options,
            ...dataItem,
          }}
          sectionKey={sectionKey}
          cellIndex={cellIndex}
          key={`${dataItem.value}_${cellIndex}`}
          isSelected={selection[cellIndex]}
          isPointerOn={cellIndex === pointerPosition}
          isBlocked={!isEditable || isCellFromPrevMonth(cellIndex, firstMonthDayIndex)}
          onKeyDown={(event): void => onKeyDown?.(cellIndex, event)}
          onValueChange={saveValue}
          onClick={(): void => onClick?.(cellIndex)}
          verboseDate={verboseDates?.[cellIndex]}
          errorSelector={(scheduleErrors): ScheduleError[] =>
            errorSelector?.(cellIndex, scheduleErrors) ?? []
          }
          onDrag={(pivot): void => onDrag?.(pivot, cellIndex)}
          onDragEnd={(): void => onDragEnd?.(rowIndex, cellIndex)}
          monthNumber={currMonthNumber}
        />
      ))}
    </div>
  );
}
