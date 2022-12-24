import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillConsumptionToolbarComponent } from './bill-consumption-toolbar.component';

describe('BillConsumptionToolbarComponent', () => {
  let component: BillConsumptionToolbarComponent;
  let fixture: ComponentFixture<BillConsumptionToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillConsumptionToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillConsumptionToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
