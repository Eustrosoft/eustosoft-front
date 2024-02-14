import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
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
  QtisTestFormService,
  QtisTestSuiteService,
  TestCasesTuple,
  TestResult,
} from '@eustrosoft-front/qtis-test-suite-lib';
import { MatChipsModule } from '@angular/material/chips';
import {
  BreakpointsService,
  PreloaderComponent,
} from '@eustrosoft-front/common-ui';
import { MatDialog } from '@angular/material/dialog';
import { TestDataFormDialogComponent } from './components/test-data-form-dialog/test-data-form-dialog.component';
import { take, tap } from 'rxjs';

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
  ],
  templateUrl: './test-suite.component.html',
  styleUrl: './test-suite.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSuiteComponent implements OnInit {
  private readonly qtisTestSuiteService = inject(QtisTestSuiteService);
  private readonly qtisTestFormService = inject(QtisTestFormService);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointsService = inject(BreakpointsService);
  protected readonly isSm = this.breakpointsService.isSm();
  protected readonly TestResult = TestResult;
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  protected apiTests = signal<TestCasesTuple | undefined>(undefined);

  ngOnInit(): void {
    this.apiTests.set(
      this.qtisTestSuiteService.makeTestList(
        this.qtisTestFormService.form.getRawValue(),
      ),
    );
  }

  runAllTestCasesSimultaneously(): void {
    if (this.apiTests() === undefined) {
      return;
    }
    for (const test of this.apiTests()!) {
      test.start.next();
    }
  }

  openTestDataFormDialog(): void {
    const dialogRef = this.dialog.open<TestDataFormDialogComponent>(
      TestDataFormDialogComponent,
      {
        minWidth: this.isSm ? '90vw' : '50vw',
      },
    );

    dialogRef
      .afterClosed()
      .pipe(
        tap(() => {
          this.apiTests.set(
            this.qtisTestSuiteService.makeTestList(
              this.qtisTestFormService.form.getRawValue(),
            ),
          );
        }),
        take(1),
      )
      .subscribe();
  }
}
