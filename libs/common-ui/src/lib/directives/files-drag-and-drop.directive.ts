import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[eustrosoftFrontFilesDragAndDrop]',
})
export class FilesDragAndDropDirective {
  @HostBinding('class.files-over') filesOver!: boolean;
  @Output() filesDropped = new EventEmitter<File[]>();

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.filesOver = true;
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
    const filesArray = Array.from(event.dataTransfer!.files);
    if (filesArray.length > 0) {
      this.filesDropped.emit(filesArray);
    }
  }
}
