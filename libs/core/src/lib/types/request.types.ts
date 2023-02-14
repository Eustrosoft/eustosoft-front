import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { QueryTypes } from '../constants/enums/query-types.enum';

export type RequestsForm = {
  forms: FormArray<FormGroup<SingleRequestForm>>;
  submit: FormControl<boolean | null>;
};

export type SingleRequestForm = {
  request: FormControl<string | null>;
  file: FormControl<File[] | null>;
  queryType: FormControl<QueryTypes | null>;
};
