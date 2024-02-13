import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TestDataFormInterface } from '../interfaces/test-data-form.interface';

@Injectable({
  providedIn: 'root',
})
export class QtisTestFormService {
  private readonly fb = inject(FormBuilder);

  form: FormGroup<TestDataFormInterface> = this.fb.group<TestDataFormInterface>(
    {
      login: this.fb.nonNullable.control('123'),
      password: this.fb.nonNullable.control('123'),
      fsPath: this.fb.nonNullable.control('/'),
    },
  );
}
