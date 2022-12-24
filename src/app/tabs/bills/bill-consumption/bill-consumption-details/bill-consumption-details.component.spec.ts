import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillConsumptionDetailsComponent } from './bill-consumption-details.component';

describe('BillConsumptionDetailsComponent', () => {
  let component: BillConsumptionDetailsComponent;
  let fixture: ComponentFixture<BillConsumptionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillConsumptionDetailsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillConsumptionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
