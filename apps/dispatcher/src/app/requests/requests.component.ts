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
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  DisplayTypes,
  QueryTypes,
  RequestsForm,
  Table,
  TisRequest,
  TisResponse,
  TisResponseBody,
  TisTableResult,
} from '@eustrosoft-front/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestBuilderService } from './services/request-builder.service';
import { RequestFormBuilderService } from './services/request-form-builder.service';
import { RequestService } from './services/request.service';

@Component({
  selector: 'eustrosoft-front-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestsComponent implements OnInit {
  public form!: FormGroup<RequestsForm>;
  public DisplayTypes = DisplayTypes;
  public displayType = new FormControl<DisplayTypes>(DisplayTypes.TEXT);
  public queryTypeOptions: string[] = [...Object.values(QueryTypes)];
  public displayTypeOptions: string[] = [...Object.values(DisplayTypes)];

  public displayTypeLabelText = $localize`Display as`;
  public addFormButtonTitle = $localize`Add request form`;
  public removeFormButtonTitle = $localize`Remove last request form`;
  public submitButtonText = $localize`Run`;

  tables?: Table[][];

  requestResult$!: Observable<TisResponse | null>;
  isResultLoading = new BehaviorSubject<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private requestBuilderService: RequestBuilderService,
    private requestFormBuilderService: RequestFormBuilderService,
    private requestService: RequestService,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.requestFormBuilderService.makeRequestForm();
  }

  submit(): void {
    this.form.get('submit')?.disable();
    this.isResultLoading.next(true);
    this.requestResult$ = this.requestBuilderService
      .buildQuery(this.form.controls.forms)
      .pipe(
        mergeMap((query: TisRequest) => this.requestService.dispatch(query)),
        map((response: TisResponse) => {
          this.tables = response.responses.map((res: TisResponseBody) =>
            res.result.map((result: TisTableResult) => {
              return {
                dataSource: result.rows.map((row) => {
                  return Object.fromEntries(
                    result.columns.map((_, i) => [result.columns[i], row[i]])
                  );
                }),
                columnsToDisplay: result.columns,
                displayedColumns: result.columns,
                data_types: result.data_types,
              };
            })
          );
          return response;
        }),
        tap(() => {
          this.form.get('submit')?.enable();
          this.isResultLoading.next(false);
        }),
        catchError((err: string) => {
          this.form.get('submit')?.enable();
          this.isResultLoading.next(false);
          this.snackBar.open(err, 'Close');
          this.cd.detectChanges();
          return of(null);
        })
      );
  }

  addForm(): void {
    this.form.controls.forms.push(
      this.requestFormBuilderService.makeNewRequestForm()
    );
  }

  removeLastForm(): void {
    const index = this.form.controls.forms.length - 1;
    this.form.controls.forms.removeAt(index);
  }
}
