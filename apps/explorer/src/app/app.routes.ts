import {
  Route,
  UrlMatchResult,
  UrlSegment,
  UrlSegmentGroup,
} from '@angular/router';
import { ExplorerComponent } from './explorer/explorer.component';

export const appRoutes: Route[] = [
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
