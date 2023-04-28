import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlPipe } from './pipes/form-control.pipe';
import { FormArrayPipe } from './pipes/form-array.pipe';
import { FileReaderService } from './services/file-reader.service';
import { ToNumberPipe } from './pipes/to-number.pipe';
import { ConfigModule } from '@eustrosoft-front/config';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorsInterceptorInterceptor } from './interceptors/http-errors-interceptor.interceptor';

@NgModule({
  declarations: [FormControlPipe, FormArrayPipe, ToNumberPipe],
  imports: [CommonModule, ConfigModule],
  providers: [
    FileReaderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorsInterceptorInterceptor,
      multi: true,
    },
  ],
  exports: [FormControlPipe, FormArrayPipe, ToNumberPipe],
})
export class CoreModule {}
