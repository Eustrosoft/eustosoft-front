/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageInputComponent } from './chat-message-input.component';

describe('ChatMessageInputComponent', () => {
  let component: ChatMessageInputComponent;
  let fixture: ComponentFixture<ChatMessageInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatMessageInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
