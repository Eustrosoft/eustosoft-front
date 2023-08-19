/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

export interface ChatMessage {
  id: number;
  chat_id: number;
  user_id: number;
  user_name: string;
  text: string;
  content: any;
  time_created: string;
  time_changed: string;
}
