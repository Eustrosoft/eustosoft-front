/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export interface CreateChatDialogReturnData {
  subject: string;
  message: string;
  securityLevel: string | undefined;
  scope: number | undefined;
}
