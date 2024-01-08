/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProgressBarMode, MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'eustrosoft-front-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatProgressBarModule],
})
export class ProgressBarComponent {
  @Input() mode: ProgressBarMode = 'determinate';
  @Input() value = 0;
}
