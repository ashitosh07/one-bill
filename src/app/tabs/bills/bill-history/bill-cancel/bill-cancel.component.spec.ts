import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillCancelComponent } from './bill-cancel.component';

describe('BillCancelComponent', () => {
  let component: BillCancelComponent;
  let fixture: ComponentFixture<BillCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillCancelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
