import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillConsumptionComponent } from './bill-consumption.component';

describe('BillConsumptionComponent', () => {
  let component: BillConsumptionComponent;
  let fixture: ComponentFixture<BillConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillConsumptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
