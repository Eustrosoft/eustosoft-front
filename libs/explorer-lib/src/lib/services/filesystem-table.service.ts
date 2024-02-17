/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FileSystemObject } from '../interfaces/file-system-object.interface';
import { SelectionModel } from '@angular/cdk/collections';

@Injectable({ providedIn: 'root' })
export class FilesystemTableService {
  dataSource = new MatTableDataSource<FileSystemObject>([]);
  selection = new SelectionModel<FileSystemObject>(true, []);
}
