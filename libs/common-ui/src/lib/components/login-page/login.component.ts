/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, of, take, tap } from 'rxjs';
import { LoginService } from '@eustrosoft-front/security';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { InputError } from '../../interfaces/input-error.interface';
import { InputErrors } from '../../constants/enums/input-errors.enum';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { LoginDialogData } from '../login-dialog/login-dialog-data.interface';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InputTypes, LoginForm } from '@eustrosoft-front/core';
import { BreakpointsService } from '../../services/breakpoints.service';
import { APP_CONFIG } from '@eustrosoft-front/config';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe, NgFor, NgIf, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'eustrosoft-front-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    NgIf,
    NgFor,
    MatButtonModule,
    NgStyle,
    AsyncPipe,
  ],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('loginTemplate') loginTemplate!: TemplateRef<unknown>;

  @Input() pathAfterLogin!: string[];
  @Input() texts!: {
    title: string;
    heading: string;
    loginLabel: string;
    passwordLabel: string;
    submitButtonText: string;
  };

  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointsService = inject(BreakpointsService);
  protected readonly config = inject(APP_CONFIG);
  private loginDialogRef!: MatDialogRef<LoginDialogComponent>;
  protected form: FormGroup<LoginForm> = this.fb.nonNullable.group<LoginForm>({
    login: this.fb.nonNullable.control('', [Validators.required]),
    password: this.fb.nonNullable.control('', Validators.required),
    submit: this.fb.nonNullable.control(false),
  });
  // TODO i18n для сообщений о ошибках
  protected loginErrors: InputError[] = [
    {
      errorCode: InputErrors.REQUIRED,
      message: 'Required',
    },
  ];
  protected passwordErrors: InputError[] = [
    {
      errorCode: InputErrors.REQUIRED,
      message: 'Required',
    },
  ];
  protected readonly InputTypes = InputTypes;
  protected isSm = this.breakpointsService.isSm();

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.isSm = this.breakpointsService.isSm();
  }

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group<LoginForm>({
      login: this.fb.nonNullable.control<string>('', [Validators.required]),
      password: this.fb.nonNullable.control<string>('', [Validators.required]),
      submit: this.fb.nonNullable.control<boolean>(false),
    });
  }

  ngAfterViewInit(): void {
    this.loginDialogRef = this.dialog.open<
      LoginDialogComponent,
      LoginDialogData,
      void
    >(LoginDialogComponent, {
      data: {
        template: this.loginTemplate,
      },
      disableClose: true,
      minWidth: this.isSm ? '90vw' : '40vw',
    });
  }

  submit(): void {
    this.form.controls.submit.disable();
    const { login, password } = this.form.getRawValue();
    this.loginService
      .login(login, password)
      .pipe(
        tap(() => {
          this.loginDialogRef.close();
          this.router.navigate(this.pathAfterLogin);
        }),
        catchError((err: HttpErrorResponse) => {
          this.form.controls.submit.enable();
          this.snackBar.open(err.error, 'close');
          this.cdRef.markForCheck();
          return of(EMPTY);
        }),
        take(1),
      )
      .subscribe();
  }
}
