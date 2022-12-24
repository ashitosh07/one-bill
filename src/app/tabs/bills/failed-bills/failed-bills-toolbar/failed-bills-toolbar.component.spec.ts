import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedBillsToolbarComponent } from './failed-bills-toolbar.component';

describe('FailedBillsToolbarComponent', () => {
  let component: FailedBillsToolbarComponent;
  let fixture: ComponentFixture<FailedBillsToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FailedBillsToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FailedBillsToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
