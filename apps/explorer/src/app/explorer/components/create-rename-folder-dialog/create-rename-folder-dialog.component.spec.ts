/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRenameFolderDialogComponent } from './create-rename-folder-dialog.component';

describe('CreateFsObjectDialogComponent', () => {
  let component: CreateRenameFolderDialogComponent;
  let fixture: ComponentFixture<CreateRenameFolderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateRenameFolderDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRenameFolderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
