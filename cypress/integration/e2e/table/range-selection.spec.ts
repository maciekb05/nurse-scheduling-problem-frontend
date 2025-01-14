/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { GetWorkerShiftOptions } from "../../../support/commands";
import { WorkerType } from "../../../../src/common-models/worker-info.model";
import { ShiftCode } from "../../../../src/common-models/shift-info.model";
import * as _ from "lodash";
import { Simulate } from "react-dom/test-utils";
import { keepOnShiftClassName } from "../../../../src/components/schedule-page/table/schedule/schedule-parts/base-cell/base-cell.models";
import error = Simulate.error;

const prevMonthDays = 6;

interface WorkerTestCase {
  title: string;
  startShiftCell: GetWorkerShiftOptions;
  endShiftCell: GetWorkerShiftOptions;
  desiredShiftCode: ShiftCode;
}

const workerTestCases: WorkerTestCase[] = [
  {
    title: "Should be able to edit multiple days of single nurse (drag left to right)",
    startShiftCell: {
      workerType: WorkerType.NURSE,
      workerIdx: 3,
      shiftIdx: 3,
    },
    endShiftCell: {
      workerType: WorkerType.NURSE,
      workerIdx: 3,
      shiftIdx: 7,
    },
    desiredShiftCode: ShiftCode.L4,
  },
  {
    title: "Should be able to edit multiple days of single nurse (drag right to left)",
    startShiftCell: {
      workerType: WorkerType.NURSE,
      workerIdx: 3,
      shiftIdx: prevMonthDays + 3,
    },
    endShiftCell: {
      workerType: WorkerType.NURSE,
      workerIdx: 3,
      shiftIdx: prevMonthDays,
    },
    desiredShiftCode: ShiftCode.U,
  },
  {
    title: "Should be able to edit multiple single day of multiple nurses",
    startShiftCell: {
      workerType: WorkerType.NURSE,
      workerIdx: 0,
      shiftIdx: prevMonthDays + 5,
    },
    endShiftCell: {
      workerType: WorkerType.NURSE,
      workerIdx: 2,
      shiftIdx: prevMonthDays + 5,
    },
    desiredShiftCode: ShiftCode.L4,
  },
  {
    title: "Should be able to edit multiple days of single babysitter",
    startShiftCell: {
      workerType: WorkerType.OTHER,
      workerIdx: 0,
      shiftIdx: 0,
    },
    endShiftCell: {
      workerType: WorkerType.OTHER,
      workerIdx: 0,
      shiftIdx: prevMonthDays + 8,
    },
    desiredShiftCode: ShiftCode.L4,
  },
  {
    title: "Should be able to edit multiple single day of multiple babysitters",
    startShiftCell: {
      workerType: WorkerType.OTHER,
      workerIdx: 3,
      shiftIdx: prevMonthDays + 3,
    },
    endShiftCell: {
      workerType: WorkerType.OTHER,
      workerIdx: 3,
      shiftIdx: prevMonthDays + 6,
    },
    desiredShiftCode: ShiftCode.L4,
  },
];

enum FoundationInfoKeys {
  EXTRA_WORKERS,
  CHILDREN,
}

interface FoundationTestCase {
  title: string;
  dataKey: FoundationInfoKeys;
  startDayIdx: number;
  endDayIdx: number;
  desiredNumber: number;
}

const foundationTestCases: FoundationTestCase[] = [
  {
    title: "Should be able to edit extra workers number with range selection",
    dataKey: FoundationInfoKeys.EXTRA_WORKERS,
    startDayIdx: prevMonthDays + 3,
    endDayIdx: prevMonthDays + 8,
    desiredNumber: 10,
  },
  {
    title: "Should be able to edit children number with range selection",
    dataKey: FoundationInfoKeys.CHILDREN,
    startDayIdx: prevMonthDays + 12,
    endDayIdx: prevMonthDays + 3,
    desiredNumber: 13,
  },
];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function validateHorizontalShifts(
  workerType: WorkerType,
  workerIdx: number,
  startShiftIdx: number,
  endShiftIdx: number,
  desiredShiftCode: ShiftCode
) {
  cy.checkWorkerShift({
    workerType,
    workerIdx,
    shiftIdx: Math.min(startShiftIdx, endShiftIdx),
    desiredShiftCode,
  });
  const [start, end] = [
    Math.min(startShiftIdx, endShiftIdx) + 1,
    Math.max(startShiftIdx, endShiftIdx) + 1,
  ];
  for (const shiftIdx of _.range(start, end)) {
    cy.getWorkerShift({
      workerType,
      workerIdx,
      shiftIdx,
      selector: "highlighted-cell",
    }).should("have.class", `${keepOnShiftClassName(true)}${desiredShiftCode}`);
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function validateVerticalShifts(
  workerType: WorkerType,
  shiftIdx: number,
  startWorkerIdx: number,
  endWorkerIdx: number,
  desiredShiftCode: ShiftCode
) {
  for (const workerIdx of _.range(startWorkerIdx, endWorkerIdx + 1)) {
    cy.checkWorkerShift({
      workerType,
      workerIdx,
      shiftIdx,
      desiredShiftCode,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function validateChange({ startShiftCell, endShiftCell, desiredShiftCode }: WorkerTestCase) {
  const {
    workerType: startWorkerType,
    workerIdx: startWorkerIdx,
    shiftIdx: startShiftIdx,
  } = startShiftCell;

  const {
    workerType: endWorkerType,
    workerIdx: endWorkerIdx,
    shiftIdx: endShiftIdx,
  } = endShiftCell;

  const isChangeHorizontal = startWorkerType === endWorkerType && startWorkerIdx === endWorkerIdx;
  const isChangeVertical = startWorkerType === endWorkerType && startShiftIdx === endShiftIdx;

  if (isChangeHorizontal) {
    validateHorizontalShifts(
      startWorkerType,
      startWorkerIdx,
      startShiftIdx,
      endShiftIdx,
      desiredShiftCode
    );
  } else if (isChangeVertical) {
    validateVerticalShifts(
      startWorkerType,
      startShiftIdx,
      startWorkerIdx,
      endWorkerIdx,
      desiredShiftCode
    );
  } else {
    cy.log("WRONG TEST SPEC");
    throw error;
  }
}

context("Shift range selection", () => {
  before(() => {
    cy.loadScheduleToMonth();
    cy.enterEditMode();
  });

  workerTestCases.forEach((test) => {
    it(test.title, () => {
      cy.getWorkerShift(test.startShiftCell).trigger("dragstart");
      cy.getWorkerShift(test.endShiftCell).trigger("drop");
      cy.useAutocomplete(test.desiredShiftCode);
      validateChange(test);
    });
  });

  foundationTestCases.forEach(({ title, dataKey, startDayIdx, endDayIdx, desiredNumber }) => {
    it(title, () => {
      cy.get(`[data-cy=foundationInfoSection]`)
        .children()
        .eq(dataKey)
        .children()
        .eq(startDayIdx)
        .trigger("dragstart");
      cy.get(`[data-cy=foundationInfoSection]`)
        .children()
        .eq(dataKey)
        .children()
        .eq(endDayIdx)
        .trigger("drop")
        .type(`${desiredNumber}{enter}`);
      for (const dayIdx of _.range(startDayIdx, endDayIdx + 1)) {
        cy.get(`[data-cy=foundationInfoSection]`)
          .children()
          .eq(dataKey)
          .children()
          .eq(dayIdx)
          .should("contain", desiredNumber);
      }
    });
  });
});
