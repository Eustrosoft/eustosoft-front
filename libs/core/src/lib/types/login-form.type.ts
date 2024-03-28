/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { FormControl } from '@angular/forms';

export type LoginForm = {
  login: FormControl<string>;
  password: FormControl<string>;
  submit: FormControl<boolean>;
};
