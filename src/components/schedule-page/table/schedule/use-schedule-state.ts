/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LocalStorageProvider } from "../../../../api/local-storage-provider.model";
import { ScheduleDataModel } from "../../../../common-models/schedule-data.model";
import { FoundationInfoLogic } from "../../../../logic/schedule-logic/foundation-info.logic";
import { MetadataLogic } from "../../../../logic/schedule-logic/metadata.logic";
import { ScheduleLogic } from "../../../../logic/schedule-logic/schedule.logic";
import { ShiftsInfoLogic } from "../../../../logic/schedule-logic/shifts-info.logic";
import { ScheduleComponentState, scheduleInitialState } from "./schedule-state.model";
import { ApplicationStateModel } from "../../../../state/models/application-state.model";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface useScheduleStateReturn {
  scheduleLogic: ScheduleLogic;
  scheduleLocalState: ScheduleComponentState;
}

export const ScheduleLogicContext = React.createContext<ScheduleLogic | null>(null);

export type ScheduleMode = "readonly" | "edit";

export function useScheduleState(
  scheduleSelector: (applicationStateModel: ApplicationStateModel) => ScheduleDataModel,
  mode: ScheduleMode
): useScheduleStateReturn {
  const dispatchGlobalState = useDispatch();
  const scheduleState = useSelector(scheduleSelector);

  const [scheduleLogic] = useState<ScheduleLogic>(
    new ScheduleLogic(dispatchGlobalState, new LocalStorageProvider(), scheduleState, mode)
  );

  const [scheduleLocalState, setScheduleLocalState] = useState<ScheduleComponentState>(
    extractScheduleLocalState(scheduleLogic)
  );

  useEffect(() => {
    scheduleLogic.update(scheduleState, mode);
    setScheduleLocalState(extractScheduleLocalState(scheduleLogic));
  }, [scheduleLogic, scheduleState, mode]);

  return { scheduleLogic, scheduleLocalState };
}

function extractScheduleLocalState(scheduleLogic: ScheduleLogic | null): ScheduleComponentState {
  if (!scheduleLogic) {
    return scheduleInitialState;
  }
  return {
    nurseShiftsSection: (scheduleLogic.sections.NurseInfo as ShiftsInfoLogic).sectionData,
    babysitterShiftsSection: (scheduleLogic.sections.BabysitterInfo as ShiftsInfoLogic).sectionData,
    foundationInfoSection: (scheduleLogic.sections.FoundationInfo as FoundationInfoLogic)
      .sectionData,
    dateSection: (scheduleLogic.sections.Metadata as MetadataLogic).sectionData,
    isInitialized: true,
    isAutoGenerated: scheduleLogic.isAutoGenerated,
    uuid: scheduleLogic.uuid,
  };
}
