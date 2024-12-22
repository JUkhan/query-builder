import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnSelector2Component } from './column-selector.component';

describe('ColumnSelectorComponent', () => {
  let component: ColumnSelector2Component;
  let fixture: ComponentFixture<ColumnSelector2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnSelector2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnSelector2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
