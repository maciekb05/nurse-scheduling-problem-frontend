/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { DataRowModel } from "../../common-models/data-row.model";

export class DataRow implements DataRowModel {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private key: string, private data: any[] = [], public isEditable = true) {}

  public get isEmpty(): boolean {
    return this.data.filter((i) => i !== null).length === 0;
  }

  public get rowKey(): string {
    return this.key;
  }

  public disableEdit(): void {
    this.isEditable = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public rowData(includeNulls = false, includeKey = false): any[] {
    const filteredRow = this.data.filter((c) => includeNulls || c != null);
    return includeKey ? [this.key, ...filteredRow] : filteredRow;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public updateData(updateCallback: (row: string[]) => any[]): DataRow {
    if (!this.isEditable) {
      return this;
    }
    const data = this.rowData(true, false);
    this.data = updateCallback(data);
    return this;
  }

  public setValue(indexes: number[], value: string): void {
    if (!this.isEditable) {
      return;
    }
    const data = this.rowData(true, false);
    for (const index of indexes) {
      data[index] = value;
    }
    this.data = [...data];
  }

  public get length(): number {
    // data + key
    return this.data.length + 1;
  }
}
