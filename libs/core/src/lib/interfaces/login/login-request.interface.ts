import { Subsystems } from '../../constants/enums/subsystems.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';

export interface LoginRequestInterface<T> {
  r: T[];
  t: number;
}

export interface PingRequest {
  s: Subsystems.PING;
  l: SupportedLanguages;
}
