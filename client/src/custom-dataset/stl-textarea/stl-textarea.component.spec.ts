import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StlTextareaComponent } from './stl-textarea.component';

describe('StlTextareaComponent', () => {
  let component: StlTextareaComponent;
  let fixture: ComponentFixture<StlTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StlTextareaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StlTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
