import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAccordion } from '@angular/material/expansion';
import { QtisTestSuiteService } from '@eustrosoft-front/qtis-test-suite-lib';
import { BreakpointsService } from '@eustrosoft-front/common-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TestDataFormComponent } from './components/test-data-form/test-data-form.component';
import { FsTestsComponent } from './components/fs-tests/fs-tests.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'eustrosoft-front-test-suite',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    TestDataFormComponent,
    FsTestsComponent,
    MatButtonModule,
  ],
  templateUrl: './test-suite.component.html',
  styleUrl: './test-suite.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSuiteComponent {
  private readonly qtisTestSuiteService = inject(QtisTestSuiteService);
  private readonly breakpointsService = inject(BreakpointsService);
  protected readonly isSm = this.breakpointsService.isSm();
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  runFsTests(): void {
    this.qtisTestSuiteService.runFsTests();
  }
}
