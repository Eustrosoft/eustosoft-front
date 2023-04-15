import { CmsRequestActions } from '../../constants/enums/cms-actions.enum';
import { FileSystemObject } from './file-system-object.interface';
import { Subsystems } from '../../constants/enums/subsystems.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';

interface BaseCmsResponse {
  s: Subsystems;
  r: CmsRequestActions;
  l: SupportedLanguages;
}

export interface ViewResponse extends BaseCmsResponse {
  content: FileSystemObject[];
}

export interface CreateResponse extends BaseCmsResponse {
  e: number;
  m: string;
}

export interface MoveCopyResponse extends BaseCmsResponse {
  e: number;
  m: string;
}

export interface DeleteResponse extends BaseCmsResponse {
  e: number;
  m: string;
}

export interface DownloadTicketResponse extends BaseCmsResponse {
  e: number;
  m: string;
}

export interface UploadResponse extends BaseCmsResponse {
  e: number;
  m: string;
}
