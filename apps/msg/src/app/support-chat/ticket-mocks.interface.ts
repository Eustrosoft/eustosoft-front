/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export interface TicketMock {
  title: string;
  messages: MessageMock[];
}

export interface MessageMock {
  author: Author;
  message: string;
}

export enum Author {
  ME = 'me',
  SUPPORT = 'support',
}
