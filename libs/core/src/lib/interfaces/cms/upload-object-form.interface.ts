import { FormControl } from '@angular/forms';
import { UploadObject } from './upload-object.interface';

export interface UploadObjectForm {
  uploadItem: FormControl<UploadObject['uploadItem']>;
  note: FormControl<UploadObject['note']>;
  accessLevel: FormControl<UploadObject['accessLevel']>;
}
