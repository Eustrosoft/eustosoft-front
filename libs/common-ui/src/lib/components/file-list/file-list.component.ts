import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'eustrosoft-front-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileListComponent {
  @Input() files!: File[];
  @Input() classesForVirtualViewport: string[] = [];
  @Input() classesForList: string[] = [];
  @Output() deleteFile = new EventEmitter<number>();

  delete(index: number): void {
    this.deleteFile.emit(index);
  }
}
