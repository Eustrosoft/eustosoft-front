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
      login: this.fb.nonNullable.control(''),
      password: this.fb.nonNullable.control(''),
      folderForTests: this.fb.nonNullable.control('/LOCAL/pub'),
      fileUploadPath: this.fb.nonNullable.control('/LOCAL/pub/test-2024-02-05'),
      filename: this.fb.nonNullable.control('FilenameForUpload.txt'),
      folderSecurityLevel: this.fb.nonNullable.control(+SecurityLevels.PUBLIC),
      folderDescription: this.fb.nonNullable.control('Test description'),
      files: this.fb.nonNullable.control<File[]>([]),
      showResponses: this.fb.nonNullable.control(true),
    },
  );
}
