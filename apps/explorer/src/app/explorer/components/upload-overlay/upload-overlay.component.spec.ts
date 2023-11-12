/*
 * Copyright (c) 2023. IdrisovII & EustroSoft.org
 *
 * This file is part of eustrosoft-front project.
 * See the LICENSE file at the project root for licensing information.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadOverlayComponent } from './upload-overlay.component';

describe('UploadOverlayComponent', () => {
  let component: UploadOverlayComponent;
  let fixture: ComponentFixture<UploadOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
