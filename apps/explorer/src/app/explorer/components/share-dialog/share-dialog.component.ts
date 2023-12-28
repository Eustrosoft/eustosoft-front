import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Output,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ShareDialogDataInterface } from './share-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareDialogComponent {
  private readonly dialogRef = inject<
    MatDialogRef<ShareDialogComponent, string>
  >(MatDialogRef<ShareDialogComponent>);
  protected data = inject<ShareDialogDataInterface>(MAT_DIALOG_DATA);

  protected shareUrlControl = new FormControl('', {
    nonNullable: true,
  });
  protected shareOWikiUrlControl = new FormControl('', {
    nonNullable: true,
  });

  @Output() shareUrlCopied = new EventEmitter<string>();
  @Output() shareOWikiUrlCopied = new EventEmitter<string>();

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent): void {
    e.stopPropagation();
    this.reject();
  }

  reject(): void {
    this.dialogRef.close();
  }
}
