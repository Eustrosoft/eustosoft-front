import { FileSystemObjectTypes } from '../../constants/enums/file-system-object-types.enum';

export interface FileSystemObject {
  fileName: string;
  extension?: string;
  hash?: string;
  fullPath: string;
  links: Array<unknown>;
  space: number;
  modified: string;
  created: string;
  type: FileSystemObjectTypes;
}
