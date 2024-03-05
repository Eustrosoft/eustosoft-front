/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  QtisSubsystemTestsService,
  QtisTestFormService,
  TestResult,
} from '@eustrosoft-front/qtis-test-suite-lib';
import { PreloaderComponent } from '@eustrosoft-front/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { merge, startWith, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'eustrosoft-front-fs-tests',
  standalone: true,
  imports: [
    CommonModule,
    PreloaderComponent,
    TranslateModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatIconModule,
  ],
  templateUrl: './fs-tests.component.html',
  styleUrl: './fs-tests.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FsTestsComponent {
  private readonly qtisTestSuiteService = inject(QtisSubsystemTestsService);
  private readonly qtisTestFormService = inject(QtisTestFormService);
  protected readonly TestResult = TestResult;
  protected readonly tests$ = merge(
    this.qtisTestSuiteService.runFsTests$(),
    this.qtisTestSuiteService.runAllTests$(),
  ).pipe(switchMap(() => this.qtisTestSuiteService.fsTests$));
  protected readonly showResponses$ =
    this.qtisTestFormService.form.controls.showResponses.valueChanges.pipe(
      startWith(true),
    );
  protected readonly loadingThatWeDeserved$ =
    this.qtisTestSuiteService.getPhraseObservable();

  @ViewChild(MatAccordion) accordion!: MatAccordion;
}
