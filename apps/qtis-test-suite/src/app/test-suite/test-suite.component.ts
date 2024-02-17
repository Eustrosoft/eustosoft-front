import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import {
  QtisTestSuiteService,
  TestCasesTuple,
  TestResult,
} from '@eustrosoft-front/qtis-test-suite-lib';
import { MatChipsModule } from '@angular/material/chips';
import {
  BreakpointsService,
  PreloaderComponent,
} from '@eustrosoft-front/common-ui';
import { MatTabsModule } from '@angular/material/tabs';
import { TestDataFormComponent } from './components/test-data-form/test-data-form.component';
import { FsTestsComponent } from './components/fs-tests/fs-tests.component';

@Component({
  selector: 'eustrosoft-front-test-suite',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    TranslateModule,
    MatMenuModule,
    MatChipsModule,
    PreloaderComponent,
    MatTabsModule,
    TestDataFormComponent,
    FsTestsComponent,
  ],
  templateUrl: './test-suite.component.html',
  styleUrl: './test-suite.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSuiteComponent {
  private readonly qtisTestSuiteService = inject(QtisTestSuiteService);
  private readonly breakpointsService = inject(BreakpointsService);
  protected readonly isSm = this.breakpointsService.isSm();
  protected readonly TestResult = TestResult;
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  protected apiTests = signal<TestCasesTuple | undefined>(undefined);

  runFsTests(event: MouseEvent): void {
    event.stopPropagation();
    this.qtisTestSuiteService.runFsTests();
  }

  runAllTestCasesSimultaneously(): void {
    if (this.apiTests() === undefined) {
      return;
    }
    for (const test of this.apiTests()!) {
      test.start.next();
    }
  }
}
