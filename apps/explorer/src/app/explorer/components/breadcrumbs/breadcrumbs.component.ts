import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'eustrosoft-front-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent implements OnInit {
  @Input() path$!: Observable<string>;
  @Output() breadcrumbClicked = new EventEmitter<string>();
  breadcrumbs$!: Observable<{ href: string; text: string }[]>;

  ngOnInit(): void {
    this.breadcrumbs$ = this.path$.pipe(
      map((path: string) => {
        if (path === '/') {
          return [{ href: '/', text: 'Home' }];
        }
        const segments = path.split('/');
        return segments.map((segment: string, index: number) => {
          if (segment === '') {
            return { href: '/', text: 'Home' };
          }
          const href = segments.slice(0, index + 1).join('/');
          const text = segment || 'Home';
          return { href, text };
        });
      })
    );
  }

  breadcrumbClick(path: string): void {
    this.breadcrumbClicked.emit(path);
  }
}
