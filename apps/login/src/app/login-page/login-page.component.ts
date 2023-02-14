import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoginService } from '@eustrosoft-front/security';
import { InputTypes } from '@eustrosoft-front/core';

type LoginForm = {
  login: FormControl<string>;
  password: FormControl<string>;
  submit: FormControl<boolean>;
};

@Component({
  selector: 'eustrosoft-front-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  InputTypes = InputTypes;
  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group<LoginForm>({
      login: this.fb.nonNullable.control('', Validators.required),
      password: this.fb.nonNullable.control('', Validators.required),
      submit: this.fb.nonNullable.control(false),
    });
  }

  submit(): void {
    this.form.get('submit')?.disable();
    this.loginService
      .login(this.form.value.login, this.form.value.password)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => this.router.navigate(['apps']),
        error: () => {
          this.form.get('submit')?.enable();
          this.cd.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
