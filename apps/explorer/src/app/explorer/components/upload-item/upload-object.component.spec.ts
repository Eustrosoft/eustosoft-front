/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadObjectComponent } from './upload-object.component';

describe('UploadItemComponent', () => {
  let component: UploadObjectComponent;
  let fixture: ComponentFixture<UploadObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadObjectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
