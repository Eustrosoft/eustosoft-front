/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FileSystemObjectResponse } from '@eustrosoft-front/core';
import { Option } from '@eustrosoft-front/common-ui';

export type FileSystemObject = Omit<
  FileSystemObjectResponse,
  'securityLevel'
> & {
  securityLevel: Pick<Option, 'displayText' | 'value'>;
};
