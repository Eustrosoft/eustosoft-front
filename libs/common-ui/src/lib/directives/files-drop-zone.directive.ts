import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { FileSystemObjectTypes } from '@eustrosoft-front/core';

@Directive({
  selector: '[eustrosoftFrontFilesDropZone]',
})
export class FilesDropZoneDirective {
  @HostBinding('class.files-over') filesOver!: boolean;
  @Input() fsObjType!: FileSystemObjectTypes;
  @Output() filesDropped = new EventEmitter<File[]>();

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.fsObjType === FileSystemObjectTypes.FOLDER) {
      this.filesOver = true;
    }
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.filesOver = false;
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.filesOver = false;
    const filesArray = Array.from((event.dataTransfer as DataTransfer).files);
    if (filesArray.length > 0) {
      this.filesDropped.emit(filesArray);
    }
  }
}
