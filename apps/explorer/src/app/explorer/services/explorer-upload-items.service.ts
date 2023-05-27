import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UploadItem, UploadObject } from '@eustrosoft-front/core';

@Injectable()
export class ExplorerUploadItemsService {
  uploadItems$ = new BehaviorSubject<UploadItem[]>([]);
  uploadObjects$ = new BehaviorSubject<UploadObject[]>([]);
}
