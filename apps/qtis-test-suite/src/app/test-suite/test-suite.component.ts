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
import { QtisApiService } from '@eustrosoft-front/qtis-test-suite-lib';

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
  ],
  templateUrl: './test-suite.component.html',
  styleUrl: './test-suite.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSuiteComponent {
  protected readonly qtisApiService = inject(QtisApiService);
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  performTest(event: MouseEvent, index: number): void {
    event.stopPropagation();
    console.log(index);
    // let { request$, response$, expectedResponse, comparator } =
    //   this.qtisApiService.apiTests[index];
    // response$ = from(request$.makeRequest()).pipe(map((res) => res.data.r[0]));
  }
}
