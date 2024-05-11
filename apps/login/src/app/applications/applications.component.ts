/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { HoverShadowDirective } from '@eustrosoft-front/common-ui';
import { WINDOW } from '@eustrosoft-front/core';

@Component({
  selector: 'eustrosoft-front-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatIconModule,
    AsyncPipe,
    TranslateModule,
    HoverShadowDirective,
  ],
})
export class ApplicationsComponent {
  private readonly window = inject(WINDOW);
  protected readonly config = inject(APP_CONFIG);

  toApp(url: string): void {
    this.window.open(url, '_blank');
  }
}
