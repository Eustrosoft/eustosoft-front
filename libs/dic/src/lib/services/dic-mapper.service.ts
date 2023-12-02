/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { DicValue } from '@eustrosoft-front/core';
import { Option } from '@eustrosoft-front/common-ui';

@Injectable()
export class DicMapperService {
  toOption(value: DicValue): Option {
    return {
      value: value.code,
      displayText: value.value,
      disabled: false,
    };
  }
}
