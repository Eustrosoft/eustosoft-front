/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { ExplorerFsObjectTypes } from '@eustrosoft-front/explorer-lib';

@Directive({
  selector: '[eustrosoftFrontFilesDropZone]',
  standalone: true,
})
export class FilesDropZoneDirective {
  @HostBinding('class.files-over') filesOver!: boolean;
  @Input() fsObjType!: ExplorerFsObjectTypes;
  @Output() filesDropped = new EventEmitter<File[]>();

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.fsObjType === ExplorerFsObjectTypes.DIRECTORY) {
      this.filesOver = true;
    }
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.filesOver = false;
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.filesOver = false;
    const filesArray = Array.from((event.dataTransfer as DataTransfer).files);
    if (filesArray.length > 0) {
      this.filesDropped.emit(filesArray);
    }
  }
}
