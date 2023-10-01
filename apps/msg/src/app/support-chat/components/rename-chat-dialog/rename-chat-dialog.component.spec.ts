/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameChatDialogComponent } from './rename-chat-dialog.component';

describe('RenameChatDialogComponent', () => {
  let component: RenameChatDialogComponent;
  let fixture: ComponentFixture<RenameChatDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RenameChatDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RenameChatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
