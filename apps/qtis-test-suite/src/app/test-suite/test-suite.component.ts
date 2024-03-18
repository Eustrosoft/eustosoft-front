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
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { TestDataFormComponent } from './components/test-data-form/test-data-form.component';
import { MatButtonModule } from '@angular/material/button';
import { TestResultsComponent } from './components/test-results/test-results.component';

@Component({
  selector: 'eustrosoft-front-test-suite',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTabsModule,
    TestDataFormComponent,
    MatButtonModule,
    TestResultsComponent,
  ],
  templateUrl: './test-suite.component.html',
  styleUrl: './test-suite.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSuiteComponent {
  private readonly qtisTestSuiteService = inject(QtisSubsystemTestsService);
  private readonly breakpointsService = inject(BreakpointsService);
  protected readonly isSm = this.breakpointsService.isSm();
  protected readonly fsTests$ = this.qtisTestSuiteService.fsTests$;
  protected readonly msgTests$ = this.qtisTestSuiteService.msgTests$;

  @ViewChild(MatAccordion) accordion!: MatAccordion;
  @ViewChild(MatTabGroup) matTabGroup!: MatTabGroup;

  runAllTests(): void {
    this.qtisTestSuiteService.runAllTests();
  }

  runFsTests(): void {
    this.matTabGroup.selectedIndex = 1;
    this.qtisTestSuiteService.runFsTests();
  }

  runMsgTests(): void {
    this.matTabGroup.selectedIndex = 2;
    this.qtisTestSuiteService.runMsgTests();
  }
}
