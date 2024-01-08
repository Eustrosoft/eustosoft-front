/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'eustrosoft-front-preloader',
    templateUrl: './preloader.component.html',
    styleUrls: ['./preloader.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatProgressSpinnerModule],
})
export class PreloaderComponent {
  @Input() color: ThemePalette = 'primary';
  @Input() diameter = 50;
  @Input() strokeWidth = 5;
  @Input() mode: ProgressSpinnerMode = 'indeterminate';
  @Input() additionalClasses = '';
}
