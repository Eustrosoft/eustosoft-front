import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveCopyDialogComponent } from './move-copy-dialog.component';

describe('MoveFolderDialogComponent', () => {
  let component: MoveCopyDialogComponent;
  let fixture: ComponentFixture<MoveCopyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveCopyDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoveCopyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
