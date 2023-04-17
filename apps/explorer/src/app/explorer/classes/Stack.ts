import { BehaviorSubject, Observable } from 'rxjs';

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
    } else {
      return value;
    }
  }

  clear(): void {
    this.stack$.next([]);
  }

  getStack(): Observable<T[]> {
    return this.stack$.asObservable();
    // return this.stack$.pipe(scan((acc, curr) => curr));
  }
}
