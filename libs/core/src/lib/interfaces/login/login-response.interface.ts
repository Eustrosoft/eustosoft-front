import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';
import { Subsystems } from '../../constants/enums/subsystems.enum';

export interface PingResponse {
  s: Subsystems;
  e: number;
  m: string;
  l: SupportedLanguages;
  userId: string;
  fullName: string;
  username: string;
}

export interface LoginLogoutResponse {
  s: Subsystems;
  e: number;
  m: string;
  l: SupportedLanguages;
}
