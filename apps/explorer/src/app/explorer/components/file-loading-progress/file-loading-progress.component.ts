import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
} from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import {
  BehaviorSubject,
  combineLatestWith,
  filter,
  from,
  mergeMap,
  of,
  pairwise,
  tap,
} from 'rxjs';
import { combineLatest } from 'rxjs/internal/operators/combineLatest';

@Component({
  selector: 'eustrosoft-front-file-loading-progress',
  templateUrl: './file-loading-progress.component.html',
  styleUrls: ['./file-loading-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileLoadingProgressComponent implements OnInit {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      files$: BehaviorSubject<File[]>;
      progressBarValue$: BehaviorSubject<number>;
      currentFile$: BehaviorSubject<string>;
    }
  ) {}

  ngOnInit(): void {
    console.log(1111);
  }

  done() {
    this.data.currentFile$.next('Upload completed!');
  }
}
