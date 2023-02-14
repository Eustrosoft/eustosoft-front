import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'eustrosoft-front-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsComponent {}
