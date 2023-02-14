import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { CommonUiModule } from '@eustrosoft-front/common-ui';
import { CoreModule, FileReaderService } from '@eustrosoft-front/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SecurityModule } from '@eustrosoft-front/security';
import { APP_ENVIRONMENT } from '@eustrosoft-front/app-config';
import { environment } from '../environments/environment';
import {
  MAT_ICON_DEFAULT_OPTIONS,
  MatIconDefaultOptions,
  MatIconModule,
} from '@angular/material/icon';
import { RequestsComponent } from './requests/requests.component';
import { MatTableModule } from '@angular/material/table';
import { RequestService } from './requests/services/request.service';
import { RequestBuilderService } from './requests/services/request-builder.service';
import { RequestFormBuilderService } from './requests/services/request-form-builder.service';
import { RequestComponent } from './requests/components/request/request.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent, RequestsComponent, RequestComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    CommonUiModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    ReactiveFormsModule,
    SecurityModule,
    MatTableModule,
    MatIconModule,
  ],
  providers: [
    RequestService,
    RequestBuilderService,
    RequestFormBuilderService,
    { provide: APP_ENVIRONMENT, useValue: environment },
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: {
        fontSet: 'material-symbols-outlined',
      } as MatIconDefaultOptions,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
