import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVoucherUpdateComponent } from './create-voucher-update.component';

describe('CreateVoucherUpdateComponent', () => {
  let component: CreateVoucherUpdateComponent;
  let fixture: ComponentFixture<CreateVoucherUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateVoucherUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateVoucherUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
