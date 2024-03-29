/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ExplorerObjectResponse } from './explorer-object-response.interface';
import { Option } from '@eustrosoft-front/common-ui';

export type FileSystemObject = Omit<ExplorerObjectResponse, 'securityLevel'> & {
  securityLevel: Pick<Option, 'displayText' | 'value'>;
  showPreviewButton: boolean;
  previewRoute: string | undefined;
};
