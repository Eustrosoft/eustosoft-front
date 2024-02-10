/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  mergeMap,
  Observable,
  of,
  tap,
} from 'rxjs';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestBuilderService } from './services/request-builder.service';
import { RequestFormBuilderService } from './services/request-form-builder.service';
import { Option, PreloaderComponent } from '@eustrosoft-front/common-ui';
import { HttpErrorResponse } from '@angular/common/http';
import { RequestsForm } from './interfaces/request.types';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RequestComponent } from './components/request/request.component';
import { AsyncPipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import {
  DispatcherQueryTypes,
  DispatcherTableResult,
  DisplayTypes,
  FileRequest,
  SqlRequest,
  SqlResponse,
  Table,
} from '@eustrosoft-front/dispatcher-lib';
import { DispatchService, QtisRequestResponse } from '@eustrosoft-front/core';

@Component({
  selector: 'eustrosoft-front-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgFor,
    RequestComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    NgIf,
    PreloaderComponent,
    MatTableModule,
    AsyncPipe,
    JsonPipe,
  ],
})
export class RequestsComponent implements OnInit {
  public form!: FormGroup<RequestsForm>;
  public DisplayTypes = DisplayTypes;
  public displayType = new FormControl<DisplayTypes>(DisplayTypes.TEXT);
  public queryTypeOptions: Option[] = Object.values(DispatcherQueryTypes).map(
    (queryType) =>
      ({
        value: queryType,
        displayText: queryType,
        disabled: false,
      }) as Option,
  );
  public displayTypeOptions: Option[] = Object.values(DisplayTypes).map(
    (queryType) =>
      ({
        value: queryType,
        displayText: queryType,
        disabled: false,
      }) as Option,
  );

  public displayTypeLabelText = 'Display as';
  public addFormButtonTitle = 'Add request form';
  public removeFormButtonTitle = 'Remove last request form';
  public submitButtonText = 'Run';

  tables: Table[][] = [];

  requestResult$!: Observable<QtisRequestResponse<SqlResponse> | null>;
  isResultLoading = new BehaviorSubject<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private requestBuilderService: RequestBuilderService,
    private requestFormBuilderService: RequestFormBuilderService,
    private dispatchService: DispatchService,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.form = this.requestFormBuilderService.makeRequestForm();
  }

  submit(): void {
    this.form.controls.submit.disable();
    this.isResultLoading.next(true);
    this.requestResult$ = this.requestBuilderService
      .buildQuery(this.form.controls.forms)
      .pipe(
        mergeMap((query) =>
          this.dispatchService.dispatch<SqlRequest | FileRequest, SqlResponse>(
            query,
          ),
        ),
        map((response: QtisRequestResponse<SqlResponse>) => {
          this.tables = response.r.map((res: SqlResponse) =>
            res.r.map((result: DispatcherTableResult) => {
              return {
                dataSource: result.rows.map((row) => {
                  return Object.fromEntries(
                    result.columns.map((_, i) => [result.columns[i], row[i]]),
                  );
                }),
                columnsToDisplay: result.columns,
                displayedColumns: result.columns,
                data_types: result.data_types,
              };
            }),
          );
          return response;
        }),
        tap(() => {
          this.form.controls.submit.enable();
          this.isResultLoading.next(false);
        }),
        catchError((err: HttpErrorResponse) => {
          this.form.controls.submit.enable();
          this.isResultLoading.next(false);
          this.snackBar.open(err.error, 'close');
          this.cd.detectChanges();
          return of(null);
        }),
      );
  }

  addForm(): void {
    this.form.controls.forms.push(
      this.requestFormBuilderService.makeNewRequestForm(),
    );
  }

  removeLastForm(): void {
    const index = this.form.controls.forms.length - 1;
    this.form.controls.forms.removeAt(index);
  }
}
