import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVoucherEntryComponent } from './create-voucher-entry.component';

describe('CreateVoucherEntryComponent', () => {
  let component: CreateVoucherEntryComponent;
  let fixture: ComponentFixture<CreateVoucherEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateVoucherEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateVoucherEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
