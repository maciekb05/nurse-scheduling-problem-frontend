/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { InputFileErrorCode, ScheduleError } from "../../common-models/schedule-error.model";
import { WorkerType } from "../../common-models/worker-info.model";
import { FoundationInfoOptions } from "../providers/foundation-info-provider.model";
import { Schedule, ScheduleProvider, Sections } from "../providers/schedule-provider.model";
import { ChildrenInfoParser } from "./children-info.parser";
import { ExtraWorkersInfoParser } from "./extra-workers-info.parser";
import { FoundationInfoHeaders, FoundationInfoParser } from "./foundation-info.parser";
import { MetaDataParser } from "./metadata.parser";
import { ShiftsInfoParser } from "./shifts-info.parser";
import { WorkersInfoParser } from "./workers-info.parser";

export class ScheduleParser implements ScheduleProvider {
  readonly sections: Sections;
  readonly workersInfo: WorkersInfoParser;
  readonly schedule: Schedule;
  readonly isAutoGenerated: boolean;
  _parseErrors: ScheduleError[] = [];

  constructor(readonly month, readonly year, rawSchedule: string[][][], workersInfo: string[][]) {
    this.sections = this.parseSections(rawSchedule);
    this.workersInfo = new WorkersInfoParser(workersInfo);
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
    let babysitters;

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

    const nurseGroupNumber = 1;
    const babysittersGroupNumber = 2;
    rawSchedule.forEach((r) => {
      if (r) {
        if (!nurses) {
          nurses = new ShiftsInfoParser(WorkerType.NURSE, metadata, nurseGroupNumber, r);
        } else if (!babysitters) {
          babysitters = new ShiftsInfoParser(WorkerType.OTHER, metadata, babysittersGroupNumber, r);
        }
      }
    });

    if (!nurses) {
      nurses = new ShiftsInfoParser(WorkerType.NURSE, metadata, nurseGroupNumber);
    }
    if (!babysitters) {
      babysitters = new ShiftsInfoParser(WorkerType.OTHER, metadata, babysittersGroupNumber);
    }

    const parsers: FoundationInfoOptions = {
      ChildrenInfo: children,
      WorkerGroups: [nurses, babysitters],
      ExtraWorkersInfo: extraWorkers,
    };

    const foundationParser = new FoundationInfoParser(parsers);
    return {
      WorkerGroups: [nurses, babysitters],
      FoundationInfo: foundationParser,
      Metadata: metadata,
    };
  }

  getWorkerTypes(): { [key: string]: WorkerType } {
    const workers = this.workersInfo.workerDescriptions;
    const result = {};
    workers.forEach((worker) => {
      result[worker.name] = worker.type;
    });
    return result;
  }
}
