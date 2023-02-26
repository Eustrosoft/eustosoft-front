import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveFolderDialogComponent } from './move-folder-dialog.component';

describe('MoveFolderDialogComponent', () => {
  let component: MoveFolderDialogComponent;
  let fixture: ComponentFixture<MoveFolderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveFolderDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoveFolderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
