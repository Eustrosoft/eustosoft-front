import { inject, Injectable } from '@angular/core';
import { DicService, Dictionaries } from '@eustrosoft-front/dic';
import { Observable } from 'rxjs';
import { Option } from '@eustrosoft-front/common-ui';

@Injectable()
export class ExplorerDictionaryService {
  private dicService = inject(DicService);

  getSecurityLevelOptions(): Observable<Option[]> {
    return this.dicService.getOptionsFromDictionary<Option>(
      Dictionaries.SLEVEL,
      this.dicService.toOption
    );
  }
}
