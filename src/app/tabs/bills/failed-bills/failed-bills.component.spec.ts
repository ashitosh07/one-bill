import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedBillsComponent } from './failed-bills.component';

describe('FailedBillsComponent', () => {
  let component: FailedBillsComponent;
  let fixture: ComponentFixture<FailedBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FailedBillsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FailedBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
