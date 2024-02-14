/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';

@Component({
  selector: 'eustrosoft-front-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    NgClass,
    NgFor,
    NgIf,
    MatButtonModule,
    MatIconModule,
  ],
})
export class FileListComponent {
  @Input() files!: File[];
  @Input() classesForVirtualViewport: string[] = [];
  @Input() stylesForVirtualViewport: { [p: string]: unknown } | undefined =
    undefined;
  @Input() classesForList: string[] = [];
  @Output() deleteFile = new EventEmitter<number>();

  delete(index: number): void {
    this.deleteFile.emit(index);
  }
}
