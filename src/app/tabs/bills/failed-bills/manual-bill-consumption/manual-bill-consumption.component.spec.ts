import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualBillConsumptionComponent } from './manual-bill-consumption.component';

describe('ManualBillConsumptionComponent', () => {
  let component: ManualBillConsumptionComponent;
  let fixture: ComponentFixture<ManualBillConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualBillConsumptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualBillConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
