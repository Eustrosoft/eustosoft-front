/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { PRECONFIGURED_TRANSLATE_SERVICE } from '@eustrosoft-front/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'eustrosoft-front-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, MatButtonModule, MatIconModule],
})
export class BreadcrumbsComponent implements OnInit {
  private readonly translateService = inject(PRECONFIGURED_TRANSLATE_SERVICE);

  @Input() path$!: Observable<string>;
  @Output() breadcrumbClicked = new EventEmitter<string>();

  protected breadcrumbs$!: Observable<{ href: string; text: string }[]>;

  ngOnInit(): void {
    this.breadcrumbs$ = combineLatest([
      this.path$,
      this.translateService.get(
        'EXPLORER.ROOT_BREADCRUMB_TEXT',
      ) as Observable<string>,
    ]).pipe(
      map(([path, rootText]) => {
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
      }),
    );
  }

  breadcrumbClick(path: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.breadcrumbClicked.emit(path);
  }
}
