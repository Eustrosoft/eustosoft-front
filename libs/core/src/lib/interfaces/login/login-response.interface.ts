import { SubsystemsResponseMessages } from '../../constants/enums/subsystems-response-messages.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';
import { Subsystems } from '../../constants/enums/subsystems.enum';

export interface LoginResponseInterface<T> {
  r: T[];
  t: number;
}

export interface PingResponse {
  s: Subsystems;
  e: number;
  m: SubsystemsResponseMessages;
  l: SupportedLanguages;
  userId: string;
  fullName: string;
  username: string;
}
