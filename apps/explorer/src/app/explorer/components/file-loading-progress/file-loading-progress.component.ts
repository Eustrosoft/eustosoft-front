import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'eustrosoft-front-file-loading-progress',
  templateUrl: './file-loading-progress.component.html',
  styleUrls: ['./file-loading-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileLoadingProgressComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      progressBarValue: BehaviorSubject<number>;
      currentFile: BehaviorSubject<string>;
    }
  ) {}

  done() {
    this.data.currentFile.next('Upload completed!');
  }
}
