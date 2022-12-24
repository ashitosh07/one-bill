import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingBillsComponent } from './outstanding-bills.component';

describe('OutstandingBillsComponent', () => {
  let component: OutstandingBillsComponent;
  let fixture: ComponentFixture<OutstandingBillsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutstandingBillsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
