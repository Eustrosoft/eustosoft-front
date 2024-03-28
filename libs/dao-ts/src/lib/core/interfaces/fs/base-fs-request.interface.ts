/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FsActionsEnum } from '../../../constants/enums/fs-actions.enum';
import { SubsystemsEnum } from '../../../constants/enums/subsystems.enum';
import { SupportedLanguagesEnum } from '../../../constants/enums/supported-languages.enum';

export interface BaseFsRequest {
  s: SubsystemsEnum;
  r: FsActionsEnum;
  l: SupportedLanguagesEnum;
}
