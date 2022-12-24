import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillperiodCreateUpdateComponent } from './billperiod-create-update.component';

describe('BillperiodCreateUpdateComponent', () => {
  let component: BillperiodCreateUpdateComponent;
  let fixture: ComponentFixture<BillperiodCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillperiodCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillperiodCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
