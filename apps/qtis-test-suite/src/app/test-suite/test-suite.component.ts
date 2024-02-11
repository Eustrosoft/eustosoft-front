import {
  ChangeDetectionStrategy,
  Component,
  inject,
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
  CompareResult,
  QtisApiService,
} from '@eustrosoft-front/qtis-test-suite-lib';
import { MatChipsModule } from '@angular/material/chips';

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
  ],
  templateUrl: './test-suite.component.html',
  styleUrl: './test-suite.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSuiteComponent {
  protected readonly qtisApiService = inject(QtisApiService);
  protected readonly CompareResult = CompareResult;
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  // TODO Сделать форму для ввода тестовых данных
  protected apiTests = this.qtisApiService.makeTestList({
    login: '',
    password: '',
  });

  runTestCasesSequentially(): void {
    for (const test of this.apiTests) {
      // TODO
      //  Так себе решение. По хорошему надо как-то организовывать через concatMap
      //  Когда закончился предыдущий тест - запускать следующий
      // await sleep(1000);
      test.start.next();
      this.accordion.openAll();
    }
  }
}
