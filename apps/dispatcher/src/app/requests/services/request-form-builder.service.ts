/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DispatcherQueryTypes } from '@eustrosoft-front/dispatcher-lib';
import { RequestsForm, SingleRequestForm } from '../interfaces/request.types';

@Injectable({ providedIn: 'root' })
export class RequestFormBuilderService {
  private readonly fb = inject(FormBuilder);

  makeRequestForm(): FormGroup<RequestsForm> {
    return this.fb.group<RequestsForm>({
      forms: this.fb.array<FormGroup<SingleRequestForm>>([
        this.fb.group<SingleRequestForm>({
          request: this.fb.nonNullable.control(
            'select current_database(), version();',
          ),
          file: this.fb.nonNullable.control([]),
          queryType: this.fb.nonNullable.control(DispatcherQueryTypes.SQL),
        }),
        this.fb.group<SingleRequestForm>({
          request: this.fb.nonNullable.control(
            'select * from pg_views;select * from pg_user;',
          ),
          file: this.fb.nonNullable.control([]),
          queryType: this.fb.nonNullable.control(DispatcherQueryTypes.SQL),
        }),
      ]),
      submit: this.fb.nonNullable.control(false),
    });
  }

  makeNewRequestForm(): FormGroup<SingleRequestForm> {
    return this.fb.group<SingleRequestForm>({
      request: this.fb.nonNullable.control(''),
      file: this.fb.nonNullable.control([]),
      queryType: this.fb.nonNullable.control(DispatcherQueryTypes.SQL),
    });
  }
}
