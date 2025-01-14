/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useCallback, useContext, useState } from "react";
import {
  GroupedScheduleErrors,
  ScheduleError,
} from "../../../../../../common-models/schedule-error.model";
import { DataRowHelper } from "../../../../../../helpers/data-row.helper";
import { Sections } from "../../../../../../logic/providers/schedule-provider.model";
import { DataRow } from "../../../../../../logic/schedule-logic/data-row";
import { BaseCellComponent } from "../../schedule-parts/base-cell/base-cell.component";
import { BaseCellOptions } from "../../schedule-parts/base-cell/base-cell.models";
import { BaseRowComponent } from "../../schedule-parts/base-row.component";
import { PivotCell } from "../../schedule-parts/hooks/use-cell-selection";
import { ShiftRowOptions } from "../../schedule-parts/shift-row.component";
import { ScheduleLogicContext } from "../../use-schedule-state";
import { useSelectionMatrix } from "./use-selection-matrix";

export enum DirectionKey {
  ArrowRight = "ArrowRight",
  ArrowLeft = "ArrowLeft",
  ArrowDown = "ArrowDown",
  ArrowUp = "ArrowUp",
}

type PointerPosition = { row: number; cell: number };
export interface BaseSectionOptions {
  uuid: string;
  data?: DataRow[];
  cellComponent?: React.FC<BaseCellOptions>;
  rowComponent?: React.FC<ShiftRowOptions>;
  sectionKey: keyof Sections;
  onRowKeyClicked?: (rowIndex: number) => void;
  errorSelector?: (
    rowKey: string,
    cellIndex: number,
    scheduleErrors: GroupedScheduleErrors
  ) => ScheduleError[];
}

function BaseSectionComponentF({
  uuid,
  data = [],
  cellComponent = BaseCellComponent,
  rowComponent: RowComponent = BaseRowComponent,
  sectionKey,
  errorSelector,
}: BaseSectionOptions): JSX.Element {
  const scheduleLogic = useContext(ScheduleLogicContext);
  const [pointerPosition, setPointerPosition] = useState<PointerPosition>({ row: -1, cell: -1 });

  function isInRange(position: PointerPosition): boolean {
    return !!data[position.row] && !!data[position.row].rowData(false)[position.cell];
  }

  function movePointer(cellIndex: number, event: React.KeyboardEvent): void {
    let newPosition: PointerPosition;
    switch (event.key) {
      case DirectionKey.ArrowDown:
        newPosition = { row: pointerPosition.row + 1, cell: pointerPosition.cell };
        break;
      case DirectionKey.ArrowUp:
        newPosition = { row: pointerPosition.row - 1, cell: pointerPosition.cell };
        break;
      case DirectionKey.ArrowRight:
        newPosition = { row: pointerPosition.row, cell: pointerPosition.cell + 1 };
        break;
      case DirectionKey.ArrowLeft:
        newPosition = { row: pointerPosition.row, cell: pointerPosition.cell - 1 };
        break;
      case "Escape":
        resetSelection();
        return;
      default:
        return;
    }
    event.preventDefault();
    if (isInRange(newPosition) || (newPosition.row === -1 && newPosition.cell === -1)) {
      setPointerPosition(newPosition);
    }
  }

  const { selectionMatrix, setSelectionMatrix, resetSelectionMatrix } = useSelectionMatrix(
    data.map((d) => d.rowData())
  );

  const resetSelection = useCallback((): void => {
    setPointerPosition({ row: -1, cell: -1 });
    resetSelectionMatrix();
  }, [resetSelectionMatrix, setPointerPosition]);

  const onDrag = useCallback(
    (pivot: PivotCell, rowInd: number, cellInd: number): void => {
      setSelectionMatrix(selectionMatrix, pivot.cellIndex, pivot.rowIndex, cellInd, rowInd);
    },
    [selectionMatrix, setSelectionMatrix]
  );

  const handleCellClick = useCallback(
    (rowInd: number, cellInd: number): void => {
      setSelectionMatrix(selectionMatrix, cellInd, rowInd, cellInd, rowInd);
      setPointerPosition({ row: rowInd, cell: cellInd });
    },
    [selectionMatrix, setSelectionMatrix, setPointerPosition]
  );

  const onSave = useCallback(
    (newValue: string): void => {
      scheduleLogic?.updateSection(sectionKey, selectionMatrix, newValue);
      resetSelection();
    },
    [selectionMatrix, sectionKey, scheduleLogic, resetSelection]
  );

  return (
    <>
      {data.map((dataRow, rowInd) => (
        <RowComponent
          selection={[...selectionMatrix[rowInd]]}
          uuid={uuid}
          sectionKey={sectionKey}
          key={`${dataRow.rowKey}${rowInd}_${uuid}`}
          rowIndex={rowInd}
          dataRow={dataRow}
          cellComponent={cellComponent}
          pointerPosition={pointerPosition.row === rowInd ? pointerPosition.cell : -1}
          onKeyDown={movePointer}
          onClick={(cellInd): void => handleCellClick(rowInd, cellInd)}
          onDrag={(pivot, cellInd): void => onDrag(pivot, rowInd, cellInd)}
          onDragEnd={(rowIndex, cellIndex): void =>
            setPointerPosition({ row: rowIndex, cell: cellIndex })
          }
          onSave={onSave}
          onBlur={resetSelection}
          isEditable={dataRow.isEditable}
          errorSelector={(cellIndex, scheduleErrors): ScheduleError[] =>
            errorSelector?.(dataRow.rowKey, cellIndex, scheduleErrors) ?? []
          }
        />
      ))}
    </>
  );
}

export const BaseSectionComponent = React.memo(BaseSectionComponentF, (prev, next) => {
  const areEqual =
    prev.uuid === next.uuid && DataRowHelper.areDataRowArraysEqual(prev.data, next.data);
  return areEqual;
});
