import { WorkerType } from "../../common-models/worker-info.model";
import { ScheduleDataModel } from "../../common-models/schedule-data.model";
import { ShiftsProvider } from "./shifts-provider.model";
import { MetadataProvider } from "./metadata-provider.model";
import { ChildrenInfoProvider } from "./children-info-provider.model";
import { ExtraWorkersInfoProvider } from "./extra-workers-info-provider.model";

export interface Sections {
  Metadata: MetadataProvider;
  NurseInfo: ShiftsProvider;
  BabysitterInfo: ShiftsProvider;
  ChildrenInfo: ChildrenInfoProvider;
  ExtraWorkersInfo: ExtraWorkersInfoProvider;
}

export interface ScheduleProvider {
  readonly sections: Sections;
  getWorkerTypes(): { [workerName: string]: WorkerType };
}

export class Schedule {
  private provider: ScheduleProvider;

  constructor(provider: ScheduleProvider) {
    this.provider = provider;
  }

  /* eslint-disable @typescript-eslint/camelcase */
  public getDataModel(): ScheduleDataModel {
    const sections = this.provider.sections;
    return {
      schedule_info: {
        month_number: sections.Metadata.monthNumber ?? 0,
        year: sections.Metadata?.year ?? 0,
        daysFromPreviousMonthExists: sections.Metadata?.daysFromPreviousMonthExists ?? false,
      },
      shifts: {
        ...sections.BabysitterInfo.workerShifts,
        ...sections.NurseInfo.workerShifts,
      },
      month_info: {
        frozen_shifts: sections.Metadata.frozenDates ?? [],
        children_number: sections.ChildrenInfo.registeredChildrenNumber,
        dates: sections.Metadata.dates ?? [],
        extra_workers: sections.ExtraWorkersInfo.extraWorkers ?? [],
      },
      employee_info: {
        type: this.provider.getWorkerTypes(),
        time: {
          ...sections.NurseInfo.availableWorkersWorkTime,
          ...sections.BabysitterInfo.availableWorkersWorkTime,
        },
      },
    };
  }
  /* eslint-enable @typescript-eslint/camelcase */
}