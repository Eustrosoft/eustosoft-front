import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UploadItem } from '@eustrosoft-front/core';

@Injectable()
export class ExplorerUploadItemsService {
  uploadItems$ = new BehaviorSubject<UploadItem[]>([]);
}
