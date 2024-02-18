import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TestDataFormInterface } from '../interfaces/test-data-form.interface';
import { SecurityLevels } from '@eustrosoft-front/security';

@Injectable({
  providedIn: 'root',
})
export class QtisTestFormService {
  private readonly fb = inject(FormBuilder);

  form: FormGroup<TestDataFormInterface> = this.fb.group<TestDataFormInterface>(
    {
      showResponses: this.fb.nonNullable.control(true),
      login: this.fb.nonNullable.control(''),
      password: this.fb.nonNullable.control(''),
      folderForTests: this.fb.nonNullable.control('/LOCAL/pub'),
      folderSecurityLevel: this.fb.nonNullable.control(+SecurityLevels.PUBLIC),
      folderDescription: this.fb.nonNullable.control('Test description'),
      fileName: this.fb.nonNullable.control('FilenameForUpload.txt'),
      fileSecurityLevel: this.fb.nonNullable.control(+SecurityLevels.PUBLIC),
      fileDescription: this.fb.nonNullable.control('Test file description'),
      files: this.fb.nonNullable.control<File[]>([]),
    },
  );
}
