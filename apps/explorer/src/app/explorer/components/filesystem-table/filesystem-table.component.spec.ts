/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesystemTableComponent } from './filesystem-table.component';

describe('FilesystemTableComponent', () => {
  let component: FilesystemTableComponent;
  let fixture: ComponentFixture<FilesystemTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilesystemTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesystemTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
