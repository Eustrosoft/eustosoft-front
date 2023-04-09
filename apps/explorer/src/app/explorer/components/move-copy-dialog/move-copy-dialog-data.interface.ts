import { FileSystemObject } from '@eustrosoft-front/core';

export interface MoveCopyDialogDataInterface {
  title: string;
  submitButtonText: string;
  cancelButtonText: string;
  fsObjects: FileSystemObject[];
}
