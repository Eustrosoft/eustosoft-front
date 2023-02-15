import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileLoadingProgressComponent } from './file-loading-progress.component';

describe('FileLoadingProgressComponent', () => {
  let component: FileLoadingProgressComponent;
  let fixture: ComponentFixture<FileLoadingProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileLoadingProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileLoadingProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
