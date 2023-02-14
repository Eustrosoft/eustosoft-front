import { FileSystemObjectTypes } from '../constants/enums/file-system-object-types.enum';

export interface FileSystemObject {
  id: string;
  title: string;
  type: FileSystemObjectTypes;
  children: FileSystemObject[];
  info: {
    created: string;
    modified: string;
    owner: string;
  };
}
