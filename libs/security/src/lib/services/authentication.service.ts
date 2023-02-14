import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AuthenticationService {
  isAuthenticated = new BehaviorSubject<boolean>(
    localStorage.getItem('isAuthenticated') === 'true'
  );
}
