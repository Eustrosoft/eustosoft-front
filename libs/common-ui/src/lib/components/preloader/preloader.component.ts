import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'eustrosoft-front-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreloaderComponent {
  @Input() color: ThemePalette = 'primary';
  @Input() diameter = 50;
  @Input() strokeWidth = 5;
  @Input() mode: ProgressSpinnerMode = 'indeterminate';
  @Input() additionalClasses = '';
}
