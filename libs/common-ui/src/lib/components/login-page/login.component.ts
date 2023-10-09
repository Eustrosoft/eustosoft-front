/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, take } from 'rxjs';
import { LoginService } from '@eustrosoft-front/security';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { InputErrorInterface } from '../input/input-error.interface';
import { InputErrors } from '../../constants/enums/input-errors.enum';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { LoginDialogDataInterface } from '../login-dialog/login-dialog-data.interface';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InputTypes, LoginForm } from '@eustrosoft-front/core';

@Component({
  selector: 'eustrosoft-front-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  form!: FormGroup;
  // TODO i18n для сообщений о ошибках
  loginErrors: InputErrorInterface[] = [
    {
      errorCode: InputErrors.REQUIRED,
      message: 'Required',
    },
  ];
  passwordErrors: InputErrorInterface[] = [
    {
      errorCode: InputErrors.REQUIRED,
      message: 'Required',
    },
  ];
  InputTypes = InputTypes;
  loginDialogRef!: MatDialogRef<LoginDialogComponent>;
  @Input() pathAfterLogin!: any[];
  @Input() texts!: {
    heading: string;
    loginLabel: string;
    passwordLabel: string;
    submitButtonText: string;
  };
  @ViewChild('loginTemplate') loginTemplate!: TemplateRef<any>;
  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group<LoginForm>({
      login: this.fb.nonNullable.control('', [Validators.required]),
      password: this.fb.nonNullable.control('', Validators.required),
      submit: this.fb.nonNullable.control(false),
    });
  }

  ngAfterViewInit(): void {
    this.loginDialogRef = this.dialog.open<
      LoginDialogComponent,
      LoginDialogDataInterface,
      void
    >(LoginDialogComponent, {
      data: {
        template: this.loginTemplate,
      },
      disableClose: true,
      width: '50em',
      height: '20em',
    });
  }

  submit(): void {
    this.form.get('submit')?.disable();
    this.loginService
      .login(this.form.value.login, this.form.value.password)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loginDialogRef.close();
          this.router.navigate(this.pathAfterLogin);
        },
        error: (err: HttpErrorResponse) => {
          this.form.get('submit')?.enable();
          this.snackBar.open(err.error, '🞩');
          this.cd.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
