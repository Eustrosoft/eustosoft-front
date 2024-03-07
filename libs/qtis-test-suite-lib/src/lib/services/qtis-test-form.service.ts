import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TestDataFormInterface } from '../interfaces/test-data-form.interface';
import { SecurityLevels } from '@eustrosoft-front/security';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testData } from '../../../../../coverage/test-data';

@Injectable({
  providedIn: 'root',
})
export class QtisTestFormService {
  private readonly fb = inject(FormBuilder);

  form: FormGroup<TestDataFormInterface> = this.fb.group<TestDataFormInterface>(
    {
      showResponses: this.fb.nonNullable.control(true),
      login: this.fb.nonNullable.control(testData.login),
      password: this.fb.nonNullable.control(testData.password),
      folderForTests: this.fb.nonNullable.control('/s/LOCAL/priv/tests'),
      folderSecurityLevel: this.fb.nonNullable.control(
        +SecurityLevels.CORPORATE,
      ),
      folderDescription: this.fb.nonNullable.control('Test description'),
      fileName: this.fb.nonNullable.control('FilenameForUpload.txt'),
      fileSecurityLevel: this.fb.nonNullable.control(+SecurityLevels.CORPORATE),
      fileDescription: this.fb.nonNullable.control('Test file description'),
      files: this.fb.nonNullable.control<File[]>([]),
    },
  );
}
