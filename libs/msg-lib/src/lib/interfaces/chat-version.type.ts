/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Chat } from './chat.interface';

export type ChatVersion = Pick<Chat, 'zoid' | 'zver'>;
