import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { QueryTypes, SingleRequestForm } from '@eustrosoft-front/core';
import { InputFileComponent, Option } from '@eustrosoft-front/common-ui';
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
  @Input() queryTypeOptions: Option[] = Object.values(QueryTypes).map(
    (queryType) =>
      ({
        value: queryType,
        displayText: queryType,
        disabled: false,
      } as Option)
  );

  @ViewChild(InputFileComponent) inputFileComponent!: InputFileComponent;
  public QueryTypes = QueryTypes;

  public queryTypeLabelText = `Query type`;

  deleteFile(index: number): void {
    const control = this.form.get('file');
    control?.value?.splice(index, 1);
    control?.patchValue(control?.value);
  }
}
