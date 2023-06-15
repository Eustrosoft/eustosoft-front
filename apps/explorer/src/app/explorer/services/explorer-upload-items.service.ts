/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UploadItem, UploadObject } from '@eustrosoft-front/core';

@Injectable()
export class ExplorerUploadItemsService {
  uploadItems$ = new BehaviorSubject<UploadItem[]>([]);
  uploadObjects$ = new BehaviorSubject<UploadObject[]>([]);
}
