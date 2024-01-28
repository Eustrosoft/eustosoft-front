/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'eustrosoft-front-input-file',
  templateUrl: './input-file.component.html',
  styleUrls: ['./input-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule],
})
export class InputFileComponent implements OnInit, OnDestroy {
  @Input() control!: FormControl<File[]>;
  @Input() buttonText = 'Select files';
  @Input() multiple = false;
  @Output() filesSelected = new EventEmitter<boolean>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(
        tap((files: File[]) => {
          const dt = new DataTransfer();
          files.forEach((file: File) => dt.items.add(file));
          this.fileInput.nativeElement.files = dt.files;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  change(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (target.files?.length === 0) {
      this.control.patchValue([]);
      this.filesSelected.emit(true);
      return;
    }
    const filesArray = Array.from(target.files as FileList);
    this.control.patchValue(filesArray);
    this.filesSelected.emit(true);
  }

  clear(): void {
    this.fileInput.nativeElement.files = new DataTransfer().files;
  }

  ngOnDestroy(): void {
    this.clear();
  }
}
