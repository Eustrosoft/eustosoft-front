/*
 * Copyright (c) 2023-2024. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MsgSubjects } from '../contants/enums/msg-subjects.enum';

@Injectable()
export class MsgSubjectsService {
  private readonly subjects = new Map<MsgSubjects, Subject<never>>();

  createSubject<T extends never>(notifier: MsgSubjects): void {
    this.subjects.set(notifier, new Subject<T>());
  }

  performNext<T extends never>(
    notifier: MsgSubjects,
    payload: T = {} as never,
  ): void {
    const subject = this.subjects.get(notifier);
    if (subject) {
      subject.next(payload);
    }
  }

  getSubjectObservable<T extends never>(notifier: MsgSubjects): Observable<T> {
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
    }
    console.error('No such subject');
  }

  completeAll(): void {
    const subjects = Array.from(this.subjects.values());
    for (const subject of subjects) {
      subject.complete();
    }
    this.subjects.clear();
  }
}
