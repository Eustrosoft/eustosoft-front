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
import { CoreModule } from '@eustrosoft-front/core';
import { ExplorerService } from './explorer/services/explorer.service';
import { ExplorerRequestBuilderService } from './explorer/services/explorer-request-builder.service';
import { SecurityModule } from '@eustrosoft-front/security';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { PortalModule } from '@angular/cdk/portal';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateRenameFolderDialogComponent } from './explorer/components/create-rename-folder-dialog/create-rename-folder-dialog.component';
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

@NgModule({
  declarations: [
    AppComponent,
    ExplorerComponent,
    CreateRenameFolderDialogComponent,
    MoveCopyDialogComponent,
    BreadcrumbsComponent,
    FilesystemTableComponent,
    UploadOverlayComponent,
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
    PortalModule,
    MatDialogModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    MatListModule,
    MatTooltipModule,
  ],
  providers: [
    ExplorerService,
    ExplorerPathService,
    ExplorerRequestBuilderService,
    ExplorerUploadService,
    Stack,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
