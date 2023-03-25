import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlPipe } from './pipes/form-control.pipe';
import { FormArrayPipe } from './pipes/form-array.pipe';
import { FileReaderService } from './services/file-reader.service';
import { ToNumberPipe } from './pipes/to-number.pipe';

@NgModule({
  declarations: [FormControlPipe, FormArrayPipe, ToNumberPipe],
  imports: [CommonModule],
  providers: [FileReaderService],
  exports: [FormControlPipe, FormArrayPipe, ToNumberPipe],
})
export class CoreModule {}
