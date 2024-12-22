import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDatasetDownloadButtonComponent } from './custom-dataset-download-button.component';

describe('CustomDatasetDownloadButtonComponent', () => {
  let component: CustomDatasetDownloadButtonComponent;
  let fixture: ComponentFixture<CustomDatasetDownloadButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomDatasetDownloadButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomDatasetDownloadButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
