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
