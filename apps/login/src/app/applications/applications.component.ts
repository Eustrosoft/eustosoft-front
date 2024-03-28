/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, DOCUMENT, NgFor, NgIf } from '@angular/common';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { HoverShadowDirective } from '@eustrosoft-front/common-ui';

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
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  protected readonly config = inject(APP_CONFIG);

  toApp(url: string): void {
    if (!this.window) {
      return;
    }
    this.window.open(url, '_blank');
  }
}
