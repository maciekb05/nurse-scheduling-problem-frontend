/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { WorkerType } from "../../common-models/worker-info.model";
import { ChildrenInfoParser } from "./children-info.parser";
import { MetaDataParser } from "./metadata.parser";
import { ShiftsInfoParser } from "./shifts-info.parser";
import { Schedule, ScheduleProvider, Sections } from "../providers/schedule-provider.model";
import { InputFileErrorCode, ScheduleError } from "../../common-models/schedule-error.model";
import { FoundationInfoHeaders, FoundationInfoParser } from "./foundation-info.parser";
import { FoundationInfoOptions } from "../providers/foundation-info-provider.model";
import { ExtraWorkersInfoParser } from "./extra-workers-info.parser";
import { WorkersInfoParser } from "./workers-info.parser";
import { ShiftsProperInfoParser } from "./shifts-proper-info.parser";

export class ScheduleParser implements ScheduleProvider {
  readonly sections: Sections;
  readonly workersInfo: WorkersInfoParser;
  readonly shiftsInfo: ShiftsProperInfoParser;
  readonly schedule: Schedule;
  readonly isAutoGenerated: boolean;
  _parseErrors: ScheduleError[] = [];

  constructor(
    readonly month,
    readonly year,
    rawSchedule: string[][][],
    workersInfo: string[][],
    shiftsInfo: string[][]
  ) {
    this.sections = this.parseSections(rawSchedule);
    this.workersInfo = new WorkersInfoParser(workersInfo);
    this.shiftsInfo = new ShiftsProperInfoParser(shiftsInfo);
    this.isAutoGenerated = false;
    this.schedule = new Schedule(this);
  }

  private logLoadFileError(msg: string): void {
    this._parseErrors.push({
      kind: InputFileErrorCode.LOAD_FILE_ERROR,
      message: msg,
    });
  }

  private parseSections(rawSchedule: string[][][]): Sections {
    let nurses;
    let babysiters;

    const foundationInfoHeaders = Object.values(FoundationInfoHeaders);

    const foundationInfoRaw = rawSchedule.find((r) =>
      foundationInfoHeaders.some((h) => r[0][0].toLowerCase().trim() === h)
    );
    const metadataRaw = foundationInfoRaw?.find(
      (r) => r[0].toLowerCase().trim() === FoundationInfoHeaders.MonthDates
    );
    const metadata = new MetaDataParser(this.month, this.year, metadataRaw);

    const childrenRaw = foundationInfoRaw?.find(
      (r) => r[0].toLowerCase().trim() === FoundationInfoHeaders.ChildrenInfo
    );
    const children = new ChildrenInfoParser(metadata, childrenRaw);

    const extraWorkersRaw = foundationInfoRaw?.find(
      (r) => r[0].toLowerCase().trim() === FoundationInfoHeaders.ExtraWorkers
    );
    const extraWorkers = new ExtraWorkersInfoParser(metadata, extraWorkersRaw);

    rawSchedule.splice(rawSchedule.indexOf(foundationInfoRaw!), 1);

    rawSchedule.forEach((r) => {
      if (r) {
        if (!nurses) {
          nurses = new ShiftsInfoParser(WorkerType.NURSE, metadata, r);
        } else if (!babysiters) {
          babysiters = new ShiftsInfoParser(WorkerType.OTHER, metadata, r);
        }
      }
    });

    if (!nurses) {
      nurses = new ShiftsInfoParser(WorkerType.NURSE, metadata);
    }
    if (!babysiters) {
      babysiters = new ShiftsInfoParser(WorkerType.OTHER, metadata);
    }

    const parsers: FoundationInfoOptions = {
      ChildrenInfo: children,
      NurseInfo: nurses,
      BabysitterInfo: babysiters,
      ExtraWorkersInfo: extraWorkers,
    };

    const foundationParser = new FoundationInfoParser(parsers);
    return {
      NurseInfo: nurses,
      BabysitterInfo: babysiters,
      FoundationInfo: foundationParser,
      Metadata: metadata,
    };
  }

  getWorkerTypes(): { [key: string]: WorkerType } {
    const result = {};
    Object.keys(this.sections.BabysitterInfo.workerShifts).forEach((babysitter) => {
      result[babysitter] = WorkerType.OTHER;
    });
    Object.keys(this.sections.NurseInfo.workerShifts).forEach((nurse) => {
      result[nurse] = WorkerType.NURSE;
    });

    return result;
  }
}
