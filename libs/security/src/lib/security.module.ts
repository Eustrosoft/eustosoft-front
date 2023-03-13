import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from './services/login.service';
import { AuthenticationService } from './services/authentication.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationGuard } from './guards/authentication.guard';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RedirectGuard } from './guards/redirect.guard';
import { UnauthenticatedInterceptor } from './interceptors/unauthenticated.interceptor';
import { WithCredentialsInterceptor } from './interceptors/with-credentials.interceptor';

@NgModule({
  imports: [CommonModule, HttpClientModule, MatSnackBarModule],
  providers: [
    LoginService,
    AuthenticationService,
    AuthenticationGuard,
    RedirectGuard,
    UnauthenticatedInterceptor,
    WithCredentialsInterceptor,
  ],
})
export class SecurityModule {}
