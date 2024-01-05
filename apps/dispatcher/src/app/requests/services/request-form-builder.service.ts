/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DispatcherQueryTypes } from '@eustrosoft-front/core';
import { RequestsForm, SingleRequestForm } from '../interfaces/request.types';

@Injectable()
export class RequestFormBuilderService {
  constructor(private fb: FormBuilder) {}

  makeRequestForm(): FormGroup<RequestsForm> {
    return this.fb.group<RequestsForm>({
      forms: this.fb.array<FormGroup<SingleRequestForm>>([
        this.fb.group<SingleRequestForm>({
          request: this.fb.control('select current_database(), version();'),
          file: this.fb.control([]),
          queryType: this.fb.control(DispatcherQueryTypes.SQL),
        }),
        this.fb.group<SingleRequestForm>({
          request: this.fb.control(
            'select * from pg_views;select * from pg_user;',
          ),
          file: this.fb.control([]),
          queryType: this.fb.control(DispatcherQueryTypes.SQL),
        }),
      ]),
      submit: this.fb.control(false),
    });
  }

  makeNewRequestForm(): FormGroup<SingleRequestForm> {
    return this.fb.group<SingleRequestForm>({
      request: this.fb.control(''),
      file: this.fb.control([]),
      queryType: this.fb.control(DispatcherQueryTypes.SQL),
    });
  }
}
