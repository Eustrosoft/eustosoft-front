import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FileSystemObject } from '../models/file-system-object.interface';
import { SelectionModel } from '@angular/cdk/collections';

@Injectable()
export class FilesystemTableService {
  dataSource = new MatTableDataSource<FileSystemObject>([]);
  selection = new SelectionModel<FileSystemObject>(true, []);
}
