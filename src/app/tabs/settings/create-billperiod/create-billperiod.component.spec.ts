import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBillperiodComponent } from './create-billperiod.component';

describe('CreateBillperiodComponent', () => {
  let component: CreateBillperiodComponent;
  let fixture: ComponentFixture<CreateBillperiodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBillperiodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBillperiodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
