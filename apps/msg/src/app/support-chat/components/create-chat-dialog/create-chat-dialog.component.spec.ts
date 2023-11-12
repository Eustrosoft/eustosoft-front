/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChatDialogComponent } from './create-chat-dialog.component';

describe('CreateChatDialogComponent', () => {
  let component: CreateChatDialogComponent;
  let fixture: ComponentFixture<CreateChatDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateChatDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateChatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
