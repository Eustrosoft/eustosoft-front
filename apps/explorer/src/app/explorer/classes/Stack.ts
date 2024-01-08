/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Stack<T> {
  private stack$ = new BehaviorSubject<T[]>([]);

  push(value: T): void {
    this.stack$.next([...this.stack$.value, value]);
  }

  pop(returnLastElementAfterPop: boolean = false): T | undefined {
    const stack = this.stack$.value;
    const value = stack.pop();
    this.stack$.next(stack);
    if (returnLastElementAfterPop) {
      return stack[stack.length - 1];
    }
    return value;
  }
}
