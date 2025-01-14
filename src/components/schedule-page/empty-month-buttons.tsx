/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TranslationHelper } from "../../helpers/translations.helper";
import { ApplicationStateModel } from "../../state/models/application-state.model";
import { ScheduleDataActionCreator } from "../../state/reducers/month-state/schedule-data/schedule-data.action-creator";
import { Button } from "../common-components";
import { useScheduleConverter } from "./import-buttons/hooks/use-schedule-converter";
import { ScheduleKey } from "../../api/persistance-store.model";
import { MonthSwitchActionCreator } from "../../state/reducers/month-state/schedule-data/month-switch.action-creator";
import { LocalStorageProvider } from "../../api/local-storage-provider.model";
import { MonthDataModel } from "../../common-models/schedule-data.model";
import { MonthHelper } from "../../helpers/month.helper";

export function EmptyMonthButtons(): JSX.Element {
  const { month_number: currentMonth, year: currentYear } = useSelector(
    (state: ApplicationStateModel) => state.actualState.persistentSchedule.present.schedule_info
  );
  const { revision } = useSelector((state: ApplicationStateModel) => state.actualState);

  const prevDate = MonthHelper.getDateWithMonthOffset(currentMonth, currentYear, -1);

  const [hasValidPrevious, setHasValidPrevious] = useState<boolean>(false);
  const { monthModel, setSrcFile } = useScheduleConverter();
  const dispatch = useDispatch();

  const fileUpload = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // To prevent a memory leak
    // https://www.debuggr.io/react-update-unmounted-component/
    let mounted = true;
    const setPrevMonth = async (): Promise<void> => {
      const storageProvider = new LocalStorageProvider();
      const prevMonth = await storageProvider.getMonthRevision(
        new ScheduleKey(prevDate.getMonth(), prevDate.getFullYear()).getRevisionKey(revision)
      );
      if (mounted) {
        setHasValidPrevious(isMonthValid(prevMonth));
      }
    };
    setPrevMonth();
    return (): void => {
      mounted = false;
    };
  }, [prevDate, revision]);

  const isMonthValid = (month: MonthDataModel | undefined): boolean => {
    return (
      month !== undefined &&
      month.month_info.dates.length > 0 &&
      !month.isAutoGenerated &&
      !month.isCorrupted
    );
  };

  useEffect(() => {
    if (monthModel) {
      const action = ScheduleDataActionCreator.setScheduleFromMonthDMAndSaveInDB(monthModel);
      dispatch(action);
    }
  }, [monthModel, dispatch]);

  function handleImport(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target?.files && event.target?.files[0];
    if (file) {
      setSrcFile(file);
    }
  }

  return (
    <div className={"newPageButtonsPane"}>
      {hasValidPrevious && (
        <Button
          onClick={(): void => {
            dispatch(MonthSwitchActionCreator.copyFromPrevMonth());
          }}
          variant="secondary"
        >
          {" "}
          {`Kopiuj plan z ${
            TranslationHelper.polishMonths[prevDate.getMonth()]
          } ${prevDate.getFullYear()}`}
        </Button>
      )}

      <Button variant="primary" onClick={(): void => fileUpload.current?.click()}>
        <input
          ref={fileUpload}
          id="file-input"
          data-cy="file-input"
          onChange={(event): void => handleImport(event)}
          style={{ display: "none" }}
          type="file"
          accept=".xlsx"
        />
        Wgraj z pliku
      </Button>
    </div>
  );
}
