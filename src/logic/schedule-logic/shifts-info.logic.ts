import { DataRowHelper } from "../../helpers/data-row.helper";
import { WorkerType } from "../../common-models/worker-info.model";
import { ScheduleErrorModel } from "../../common-models/schedule-error.model";
import { ShiftCode, ShiftInfoModel } from "../../common-models/shift-info.model";
import { Sections } from "../providers/schedule-provider.model";
import { DataRow } from "./data-row";
import { BaseSectionLogic } from "./base-section-logic.model";
import { ShiftsProvider } from "../providers/shifts-provider.model";

export class ShiftsInfoLogic extends BaseSectionLogic implements ShiftsProvider {
  get sectionKey(): keyof Sections {
    return this.workerType === WorkerType.NURSE ? "NurseInfo" : "BabysitterInfo";
  }

  private shifts: { [nurseName: string]: DataRow } = {};
  private _availableWorkersWorkTime: { [nurseName: string]: number } = {};
  private _scheduleErrors: ScheduleErrorModel[] = [];

  constructor(shiftSection: ShiftInfoModel = {}, private workerType: WorkerType) {
    super();
    Object.keys(shiftSection).forEach((key) => {
      this.shifts[key] = new DataRow(key, shiftSection[key]);
    });
    this._availableWorkersWorkTime = this.mockWorkersWorkTime();
  }

  workerWorkTime(workerName: string): number {
    return this._availableWorkersWorkTime[workerName];
  }

  get availableWorkersWorkTime(): { [key: string]: number } {
    return this._availableWorkersWorkTime;
  }

  public get errors(): ScheduleErrorModel[] {
    return [...this._scheduleErrors];
  }

  public set errors(value: ScheduleErrorModel[]) {
    this._scheduleErrors = value;
  }

  public get sectionData(): DataRow[] {
    return Object.values(this.shifts);
  }

  public set sectionData(dataRows: DataRow[]) {
    this.shifts = DataRowHelper.dataRowsAsDataRowDict<DataRow>(dataRows);
  }

  public get workersCount(): number {
    return this.sectionData.length;
  }

  public get workers(): string[] {
    return Object.keys(this.shifts);
  }

  public get workerShifts(): { [nurseName: string]: ShiftCode[] } {
    return DataRowHelper.dataRowsAsValueDict<ShiftCode>(Object.values(this.shifts), false);
  }

  private mockWorkersWorkTime(): { [key: string]: number } {
    const workerDict = {};
    Object.keys(this.shifts).forEach((key) => (workerDict[key] = 1.0));
    return workerDict;
  }

  public tryUpdate(row: DataRow): boolean {
    if (Object.keys(this.shifts).includes(row.rowKey)) {
      this.shifts[row.rowKey] = row;
      return true;
    }
    return false;
  }

  public addWorker(worker: DataRow, workerWorkTime: number): DataRow[] {
    this._availableWorkersWorkTime[worker.rowKey] = workerWorkTime;
    return this.addDataRow(worker);
  }
}
