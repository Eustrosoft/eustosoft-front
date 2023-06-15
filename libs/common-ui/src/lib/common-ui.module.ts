/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { ButtonComponent } from './components/button/button.component';
import { InputComponent } from './components/input/input.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { InputFileComponent } from './components/input-file/input-file.component';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { SelectComponent } from './components/select/select.component';
import { TextareaComponent } from './components/textarea/textarea.component';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_ICON_DEFAULT_OPTIONS,
  MatIconDefaultOptions,
  MatIconModule,
} from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HoverShadowDirective } from './directives/hover-shadow.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FilesDropZoneDirective } from './directives/files-drop-zone.directive';
import { RippleHoverDirective } from './directives/ripple-hover.directive';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { HoverCursorDirective } from './directives/hover-cursor.directive';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfigModule } from '@eustrosoft-front/config';
import { A11yModule } from '@angular/cdk/a11y';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { LoginComponent } from './components/login-page/login.component';
import { CoreModule } from '@eustrosoft-front/core';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatProgressBarModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule,
    ConfigModule,
    A11yModule,
    CoreModule,
  ],
  declarations: [
    HeaderComponent,
    ButtonComponent,
    InputComponent,
    FileListComponent,
    InputFileComponent,
    PreloaderComponent,
    SelectComponent,
    TextareaComponent,
    HoverShadowDirective,
    FilesDropZoneDirective,
    RippleHoverDirective,
    ProgressBarComponent,
    HoverCursorDirective,
    PromptDialogComponent,
    LoginDialogComponent,
    LoginComponent,
  ],
  exports: [
    HeaderComponent,
    ButtonComponent,
    InputComponent,
    FileListComponent,
    InputFileComponent,
    PreloaderComponent,
    SelectComponent,
    TextareaComponent,
    HoverShadowDirective,
    FilesDropZoneDirective,
    RippleHoverDirective,
    ProgressBarComponent,
    HoverCursorDirective,
    LoginComponent,
  ],
  providers: [
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: {
        fontSet: 'material-symbols-outlined',
      } as MatIconDefaultOptions,
    },
  ],
})
export class CommonUiModule {}
