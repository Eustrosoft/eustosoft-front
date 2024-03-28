/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { CdkTableDataSourceInput } from '@angular/cdk/table';

export interface Table {
  dataSource: CdkTableDataSourceInput<unknown>;
  columnsToDisplay: string[];
  displayedColumns: string[];
  data_types: string[];
}
