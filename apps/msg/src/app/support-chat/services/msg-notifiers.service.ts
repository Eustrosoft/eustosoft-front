/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MsgNotifiers } from '../contants/enums/msg-actions.enum';

@Injectable()
export class MsgNotifiersService {
  private notifySubjects = new Map<MsgNotifiers, Subject<any>>();

  createNotifier<T>(notifier: MsgNotifiers): void {
    this.notifySubjects.set(notifier, new Subject<T>());
  }

  performNotification<T>(notifier: MsgNotifiers, payload: T): void {
    const subject = this.notifySubjects.get(notifier);
    if (subject) {
      subject.next(payload);
    }
  }

  getNotifierObservable<T>(notifier: MsgNotifiers): Observable<T> {
    const subject = this.notifySubjects.get(notifier);
    if (subject) {
      return subject.asObservable();
    }
    return new Observable();
  }

  completeSingle(notifier: MsgNotifiers): void {
    const subject = this.notifySubjects.get(notifier);
    if (subject) {
      return subject.complete();
    } else {
      console.error('No such subject');
    }
  }

  completeAll(): void {
    const subjects = Array.from(this.notifySubjects.values());
    for (const subject of subjects) {
      subject.complete();
    }
  }
}
