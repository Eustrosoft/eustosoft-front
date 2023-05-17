import { FormControl } from '@angular/forms';

export type LoginForm = {
  login: FormControl<string>;
  password: FormControl<string>;
  submit: FormControl<boolean>;
};
