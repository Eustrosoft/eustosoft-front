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
  QtisTestFormService,
  QtisTestSuiteService,
  TestResult,
} from '@eustrosoft-front/qtis-test-suite-lib';
import { PreloaderComponent } from '@eustrosoft-front/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { startWith, switchMap } from 'rxjs';
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
  private readonly qtisTestSuiteService = inject(QtisTestSuiteService);
  private readonly qtisTestFormService = inject(QtisTestFormService);
  protected readonly TestResult = TestResult;
  protected readonly tests$ = this.qtisTestSuiteService
    .runFsTests$()
    .pipe(switchMap(() => this.qtisTestSuiteService.executeFsTests()));
  protected readonly showResponses$ =
    this.qtisTestFormService.form.controls.showResponses.valueChanges.pipe(
      startWith(true),
    );
  protected readonly loadingThatWeDeserved$ =
    this.qtisTestSuiteService.getPhraseObservable();

  @ViewChild(MatAccordion) accordion!: MatAccordion;
}
