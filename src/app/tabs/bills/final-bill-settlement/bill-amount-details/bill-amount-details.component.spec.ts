import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillAmountDetailsComponent } from './bill-amount-details.component';

describe('BillAmountDetailsComponent', () => {
  let component: BillAmountDetailsComponent;
  let fixture: ComponentFixture<BillAmountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillAmountDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillAmountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
