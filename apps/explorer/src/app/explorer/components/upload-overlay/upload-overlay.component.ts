import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UploadItem } from '../../interfaces/upload-item.interface';
import { UploadingState } from '../../constants/enums/uploading-state.enum';

@Component({
  selector: 'eustrosoft-front-upload-overlay',
  templateUrl: './upload-overlay.component.html',
  styleUrls: ['./upload-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadOverlayComponent {
  @Input() uploadItems!: UploadItem[];

  UploadingState = UploadingState;

  cancelClick(): void {
    console.log('Cancel click');
  }
}
