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
import { MatAccordion } from '@angular/material/expansion';
import { QtisSubsystemTestsService } from '@eustrosoft-front/qtis-test-suite-lib';
import { BreakpointsService } from '@eustrosoft-front/common-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TestDataFormComponent } from './components/test-data-form/test-data-form.component';
import { FsTestsComponent } from './components/fs-tests/fs-tests.component';
import { MatButtonModule } from '@angular/material/button';
import { switchMap } from 'rxjs';

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
  private readonly qtisTestSuiteService = inject(QtisSubsystemTestsService);
  private readonly breakpointsService = inject(BreakpointsService);
  protected readonly isSm = this.breakpointsService.isSm();
  protected readonly allTests$ = this.qtisTestSuiteService
    .runAllTests$()
    .pipe(switchMap(() => this.qtisTestSuiteService.executeAllTests$()));

  @ViewChild(MatAccordion) accordion!: MatAccordion;

  runAllTests(): void {
    this.qtisTestSuiteService.runAllTests();
  }

  runFsTests(): void {
    this.qtisTestSuiteService.runFsTests();
  }
}
