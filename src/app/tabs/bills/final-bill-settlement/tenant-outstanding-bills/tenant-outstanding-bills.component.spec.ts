import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantOutstandingBillsComponent } from './tenant-outstanding-bills.component';

describe('TenantOutstandingBillsComponent', () => {
  let component: TenantOutstandingBillsComponent;
  let fixture: ComponentFixture<TenantOutstandingBillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenantOutstandingBillsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantOutstandingBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
