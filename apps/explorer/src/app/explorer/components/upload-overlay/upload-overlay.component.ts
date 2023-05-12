import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { UploadItem } from '@eustrosoft-front/core';
import { UploadingState } from '../../constants/enums/uploading-state.enum';

@Component({
  selector: 'eustrosoft-front-upload-overlay',
  templateUrl: './upload-overlay.component.html',
  styleUrls: ['./upload-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOverlayComponent {
  @Input() uploadItems!: UploadItem[];

  @Output() removeItem = new EventEmitter<UploadItem>();
  @Output() closeOverlay = new EventEmitter<UploadItem[]>();

  UploadingState = UploadingState;

  openFolder(item: UploadItem): void {
    console.log(item);
  }

  remove(item: UploadItem): void {
    item.cancelled = true;
    this.removeItem.emit(item);
  }

  close(): void {
    this.closeOverlay.emit(this.uploadItems);
  }
}
