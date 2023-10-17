/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MsgSubjects } from '../contants/enums/msg-subjects.enum';

@Injectable()
export class MsgSubjectsService {
  private subjects = new Map<MsgSubjects, Subject<any>>();

  createSubject<T>(notifier: MsgSubjects): void {
    this.subjects.set(notifier, new Subject<T>());
  }

  performNext<T>(notifier: MsgSubjects, payload: T): void {
    const subject = this.subjects.get(notifier);
    if (subject) {
      subject.next(payload);
    }
  }

  getSubjectObservable<T>(notifier: MsgSubjects): Observable<T> {
    const subject = this.subjects.get(notifier);
    if (subject) {
      return subject.asObservable();
    }
    return new Observable();
  }

  completeSingle(notifier: MsgSubjects): void {
    const subject = this.subjects.get(notifier);
    if (subject) {
      return subject.complete();
    } else {
      console.error('No such subject');
    }
  }

  completeAll(): void {
    const subjects = Array.from(this.subjects.values());
    for (const subject of subjects) {
      subject.complete();
    }
    this.subjects.clear();
  }
}
