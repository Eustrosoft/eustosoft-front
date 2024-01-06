/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { CoreModule, CustomLocationStrategy } from '@eustrosoft-front/core';
import { ExplorerService } from './explorer/services/explorer.service';
import { ExplorerRequestBuilderService } from './explorer/services/explorer-request-builder.service';
import { SecurityModule } from '@eustrosoft-front/security';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { PortalModule } from '@angular/cdk/portal';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateDialogComponent } from './explorer/components/create-dialog/create-dialog.component';
import { MoveCopyDialogComponent } from './explorer/components/move-copy-dialog/move-copy-dialog.component';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { MatListModule } from '@angular/material/list';
import { BreadcrumbsComponent } from './explorer/components/breadcrumbs/breadcrumbs.component';
import { Stack } from './explorer/classes/Stack';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExplorerPathService } from './explorer/services/explorer-path.service';
import { FilesystemTableComponent } from './explorer/components/filesystem-table/filesystem-table.component';
import { ExplorerUploadService } from './explorer/services/explorer-upload.service';
import { UploadOverlayComponent } from './explorer/components/upload-overlay/upload-overlay.component';
import { ExplorerUploadItemsService } from './explorer/services/explorer-upload-items.service';
import { A11yModule } from '@angular/cdk/a11y';
import { LoginPageComponent } from './login-page/login-page.component';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { ExplorerUploadItemFormFactoryService } from './explorer/services/explorer-upload-item-form-factory.service';
import { LocationStrategy } from '@angular/common';
import { ExplorerDictionaryService } from './explorer/services/explorer-dictionary.service';
import { DicModule } from '@eustrosoft-front/dic';
import { MatExpansionModule } from '@angular/material/expansion';
import { UploadDialogComponent } from './explorer/components/upload-dialog/upload-dialog.component';
import { ShareDialogComponent } from './explorer/components/share-dialog/share-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RenameDialogComponent } from './explorer/components/rename-dialog/rename-dialog.component';
import { FilesystemTableService } from './explorer/services/filesystem-table.service';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    AppComponent,
    ExplorerComponent,
    CreateDialogComponent,
    RenameDialogComponent,
    MoveCopyDialogComponent,
    BreadcrumbsComponent,
    FilesystemTableComponent,
    UploadOverlayComponent,
    LoginPageComponent,
    UploadDialogComponent,
    ShareDialogComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    CoreModule,
    CommonUiModule,
    SecurityModule,
    MatIconModule,
    MatProgressBarModule,
    MatMenuModule,
    MatBottomSheetModule,
    PortalModule,
    MatDialogModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    MatListModule,
    MatTooltipModule,
    A11yModule,
    MatCardModule,
    DicModule,
    MatExpansionModule,
    MatSidenavModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
  ],
  providers: [
    ExplorerService,
    ExplorerPathService,
    ExplorerRequestBuilderService,
    ExplorerUploadService,
    ExplorerUploadItemsService,
    ExplorerUploadItemFormFactoryService,
    ExplorerDictionaryService,
    FilesystemTableService,
    Stack,
    { provide: LocationStrategy, useClass: CustomLocationStrategy },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 7000 } },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
