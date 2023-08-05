import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { CreateTicketDialogFormInterface } from './create-ticket-dialog-form.interface';
import { CreateTicketDialogDataInterface } from './create-ticket-dialog-data.interface';

@Component({
  selector: 'eustrosoft-front-create-ticket-dialog',
  templateUrl: './create-ticket-dialog.component.html',
  styleUrls: ['./create-ticket-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTicketDialogComponent {
  private dialogRef: MatDialogRef<CreateTicketDialogComponent> = inject(
    MatDialogRef<CreateTicketDialogComponent>
  );
  public data: CreateTicketDialogDataInterface = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group<CreateTicketDialogFormInterface>({
    subject: this.fb.nonNullable.control('', [Validators.required]),
    message: this.fb.nonNullable.control('', [Validators.required]),
  });

  @HostListener('keydown.enter', ['$event'])
  onEnterKeydown(e: KeyboardEvent) {
    e.stopPropagation();
    this.dialogRef.close(this.form.value);
  }

  reject(): void {
    this.dialogRef.close();
  }

  resolve(): void {
    this.dialogRef.close(this.form.value);
  }
}
