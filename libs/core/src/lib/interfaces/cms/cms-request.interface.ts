import { CmsRequestActions } from '../../constants/enums/cms-actions.enum';
import { Subsystems } from '../../constants/enums/subsystems.enum';
import { FileSystemObjectTypes } from '../../constants/enums/file-system-object-types.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';

interface BaseCmsRequest {
  s: Subsystems;
  r: CmsRequestActions;
  l: SupportedLanguages;
}

export interface ViewRequest extends BaseCmsRequest {
  path: string;
}

export interface CreateRequest extends BaseCmsRequest {
  path: string;
  type: FileSystemObjectTypes;
  fileName: string;
}

export interface UploadRequest extends BaseCmsRequest {
  parameters: {
    data: {
      file: string;
      name: string;
      ext: string;
      chunk: number;
      all_chunks: number;
    };
  };
  request: string;
  subsystem: string;
}

export interface MoveCopyRequest extends BaseCmsRequest {
  from: string;
  to: string;
}

export interface DeleteRequest extends BaseCmsRequest {
  path: string;
}
