/*
 * Copyright (c) 2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { config } from 'dotenv';

export = async (): Promise<void> => {
  config({ path: './.env.test' });
};
