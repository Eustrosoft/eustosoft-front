import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlPipe } from './pipes/form-control.pipe';
import { FormArrayPipe } from './pipes/form-array.pipe';
import { FileReaderService } from './services/file-reader.service';

@NgModule({
  declarations: [FormControlPipe, FormArrayPipe],
  imports: [CommonModule],
  providers: [FileReaderService],
  exports: [FormControlPipe, FormArrayPipe],
})
export class CoreModule {}
