import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { ExplorerComponent } from './explorer/explorer.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonUiModule } from '@eustrosoft-front/common-ui';
import {
  MAT_ICON_DEFAULT_OPTIONS,
  MatIconDefaultOptions,
  MatIconModule,
} from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { CoreModule } from '@eustrosoft-front/core';
import { ExplorerService } from './explorer/services/explorer.service';
import { ExplorerRequestBuilderService } from './explorer/services/explorer-request-builder.service';
import { SecurityModule } from '@eustrosoft-front/security';
import { APP_ENVIRONMENT } from '@eustrosoft-front/app-config';
import { environment } from '../environments/environment';
import { FileLoadingProgressComponent } from './explorer/components/file-loading-progress/file-loading-progress.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ToNumberPipe } from './explorer/pipes/to-number.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ExplorerComponent,
    FileLoadingProgressComponent,
    ToNumberPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    MatTableModule,
    MatCheckboxModule,
    CoreModule,
    CommonUiModule,
    SecurityModule,
    MatIconModule,
    MatProgressBarModule,
    MatMenuModule,
    MatBottomSheetModule,
  ],
  providers: [
    ExplorerService,
    ExplorerRequestBuilderService,
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
