import { CmsRequestActions } from '../../constants/enums/cms-request-actions.enum';
import { Subsystems } from '../../constants/enums/subsystems.enum';
import { FileSystemObjectTypes } from '../../constants/enums/file-system-object-types.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';

export interface CmsRequestInterface<T> {
  r: T[];
  t: number;
}

interface BaseCmsRequest {
  s: Subsystems.CMS;
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

export interface MoveCopyRequest extends BaseCmsRequest {
  from: string;
  to: string;
}

export interface DeleteRequest extends BaseCmsRequest {
  path: string;
}
