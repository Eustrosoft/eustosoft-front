import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
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

  protected control = new FormControl('', {
    nonNullable: true,
  });

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    this.dialogRef.close(this.control.value);
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    this.dialogRef.close(this.control.value);
  }
}
