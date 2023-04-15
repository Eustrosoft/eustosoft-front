import { Subsystems } from '../../constants/enums/subsystems.enum';
import { SupportedLanguages } from '../../constants/enums/supported-languages.enum';

interface BaseDispatcherResponse {
  s: Subsystems;
  l: SupportedLanguages;
}

export interface SqlResponse extends BaseDispatcherResponse {
  e: string;
  m: string;
  r: DispatcherTableResult[];
}

export interface DispatcherTableResult {
  columns: string[];
  data_types: string[];
  rows: Array<Array<any>>;
  rows_count: number;
}
