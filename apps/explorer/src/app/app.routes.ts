import {
  Route,
  UrlMatchResult,
  UrlSegment,
  UrlSegmentGroup,
} from '@angular/router';
import { ExplorerComponent } from './explorer/explorer.component';
import { RedirectGuard } from '@eustrosoft-front/security';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [RedirectGuard],
    component: AppComponent,
    data: {
      externalUrl: environment.loginUrl,
    },
  },
  {
    matcher: (
      segments: UrlSegment[],
      group: UrlSegmentGroup,
      route: Route
    ): UrlMatchResult | null => {
      if (group.segments.length > 0) {
        return {
          consumed: segments,
          posParams: {
            path: new UrlSegment(segments.slice().join('/'), {}),
          },
        };
      }
      return {
        consumed: segments,
        posParams: {
          path: new UrlSegment('', {}),
        },
      };
    },
    title: 'TIS | Explorer',
    component: ExplorerComponent,
  },
];
