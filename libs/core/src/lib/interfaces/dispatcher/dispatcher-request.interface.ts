import { DispatcherActions } from '../../constants/enums/dispatcher-actions.enum';
import { Subsystems } from '../../constants/enums/subsystems.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';

interface BaseDispatcherRequest {
  s: Subsystems;
  r: DispatcherActions;
  l: SupportedLanguages;
}

export interface SqlRequest extends BaseDispatcherRequest {
  query: string;
}
