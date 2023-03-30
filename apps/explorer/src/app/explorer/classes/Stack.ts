import { BehaviorSubject, Observable, scan } from 'rxjs';

export class Stack<T> {
  private stack$ = new BehaviorSubject<T[]>([]);

  push(value: T) {
    this.stack$.next([...this.stack$.value, value]);
  }

  pop(returnLastElementAfterPop: boolean = false): T | undefined {
    const stack = this.stack$.value;
    const value = stack.pop();
    this.stack$.next(stack);
    if (returnLastElementAfterPop) {
      return stack[stack.length - 1];
    } else {
      return value;
    }
  }

  getStack(): Observable<T[]> {
    return this.stack$.pipe(scan((acc, curr) => curr));
  }
}
