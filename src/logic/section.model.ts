export enum ChildrenSectionKey {
  RegisteredChildrenCount = "Dzieci",
  HospitalizedChildrenCount = "liczba dzieci hospitalizowanych",
  VacationersChildrenCount = "liczba dzieci urlopowanych",
  ConsultedChildrenCount = "liczba dzieci konsultowanych",
}

export enum ExtraWorkersSectionKey {
  ExtraWorkersCount = "Pracownicy dzienni",
}

export class FoundationSectionKey {
  static get ChildrenCount(): string {
    return ChildrenSectionKey.RegisteredChildrenCount;
  }
  static get ExtraWorkersCount(): string {
    return ExtraWorkersSectionKey.ExtraWorkersCount;
  }
  static get NurseCount(): string {
    return "Pielęgniarki";
  }
  static get BabysittersCount(): string {
    return "Opiekunowie";
  }
}

export enum MetaDataSectionKey {
  Month = "miesiąc",
  Year = "rok",
  MonthDays = "Dni miesiąca",
  RequiredavailableWorkersWorkTime = "ilość godz",
}

export const MetaDataRowLabel = "Grafik";
