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
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HoverShadowDirective } from './directives/hover-shadow.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FilesDragAndDropDirective } from './directives/files-drag-and-drop.directive';
import { RippleHoverDirective } from './directives/ripple-hover.directive';

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
    FilesDragAndDropDirective,
    RippleHoverDirective,
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
    FilesDragAndDropDirective,
    RippleHoverDirective,
  ],
})
export class CommonUiModule {}
