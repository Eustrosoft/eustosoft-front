import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { QueryTypes, SingleRequestForm } from '@eustrosoft-front/core';
import { InputFileComponent } from '@eustrosoft-front/common-ui';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'eustrosoft-front-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestComponent {
  @Input() form!: FormGroup<SingleRequestForm>;
  @Input() formNumber!: number;
  @Input() queryTypeOptions: string[] = [...Object.values(QueryTypes)];

  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;
  QueryTypes = QueryTypes;

  deleteFile(index: number): void {
    const control = this.form.get('file');
    control?.value?.splice(index, 1);
    control?.patchValue(control?.value);
  }
}
