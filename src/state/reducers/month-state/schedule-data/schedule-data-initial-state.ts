/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import * as _ from "lodash";
import { ScheduleKey } from "../../../../api/persistance-store.model";
import { MonthInfoModel } from "../../../../common-models/month-info.model";
import { ScheduleMetadata } from "../../../../common-models/schedule.model";
import { ShiftInfoModel, SHIFTS } from "../../../../common-models/shift-info.model";
import { WorkersInfoModel } from "../../../../common-models/worker-info.model";
import { ScheduleDataModel } from "../../../../common-models/schedule-data.model";
import { MonthHelper } from "../../../../helpers/month.helper";
import { PrimaryMonthRevisionDataModel } from "../../../models/application-state.model";

/* eslint-disable @typescript-eslint/camelcase */
const employeeInfoinitialState: WorkersInfoModel = { time: {}, type: {}, contractType: {} };
const initialDate = new Date();
const monthDays = MonthHelper.daysInMonth(initialDate.getMonth(), initialDate.getFullYear());

const monthInfoinitialState: MonthInfoModel = {
  children_number: new Array(monthDays.length).fill(0),
  extra_workers: new Array(monthDays.length).fill(0),
  frozen_shifts: [],
  dates: monthDays,
};

export const scheduleInfoInitialState: ScheduleMetadata = {
  year: initialDate.getFullYear(),
  month_number: initialDate.getMonth(),
};
export const shiftInfoInitialState: ShiftInfoModel = {};

export const scheduleDataInitialState: ScheduleDataModel = {
  schedule_info: scheduleInfoInitialState,
  month_info: monthInfoinitialState,
  employee_info: employeeInfoinitialState,
  shifts: shiftInfoInitialState,
  isAutoGenerated: true,
  shift_types: _.cloneDeep(SHIFTS),
  isCorrupted: false,
};

export const primaryRevisionInitialState: PrimaryMonthRevisionDataModel = {
  scheduleKey: new ScheduleKey(initialDate.getMonth(), initialDate.getFullYear()),
  ...scheduleDataInitialState,
  __TYPE__: "PrimaryScheduleRevision",
};
