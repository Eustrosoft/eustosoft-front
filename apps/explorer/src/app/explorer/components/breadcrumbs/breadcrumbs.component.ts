/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { PRECONFIGURED_TRANSLATE_SERVICE } from '@eustrosoft-front/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExplorerPathService } from '@eustrosoft-front/explorer-lib';
import { outputFromObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'eustrosoft-front-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, MatButtonModule, MatIconModule],
})
export class BreadcrumbsComponent {
  private readonly translateService = inject(PRECONFIGURED_TRANSLATE_SERVICE);
  private readonly explorerPathService = inject(ExplorerPathService);

  private readonly breadcrumbClicked$ = new Subject<string>();

  // TODO Lyasrt Определится с debounceTime
  breadcrumbClicked = outputFromObservable(
    this.breadcrumbClicked$.asObservable().pipe(debounceTime(0)),
  );

  protected breadcrumbs = computed((): { href: string; text: string }[] => {
    const pathSignal = this.explorerPathService.getPath();
    const path = pathSignal();
    const rootText =
      (this.translateService.instant(
        'EXPLORER.ROOT_BREADCRUMB_TEXT',
      ) as string) ?? 'Home';
    if (path === '/') {
      return [{ href: '/', text: rootText }];
    }
    const segments = path.split('/');
    return segments.map((segment: string, index: number) => {
      if (segment === '') {
        return { href: '/', text: rootText };
      }
      const href = segments.slice(0, index + 1).join('/');
      const text = segment || rootText;
      return { href, text };
    });
  });

  breadcrumbClick(path: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.breadcrumbClicked$.next(path);
  }
}
