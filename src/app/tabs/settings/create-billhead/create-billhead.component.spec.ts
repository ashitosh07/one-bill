import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBillheadComponent } from './create-billhead.component';

describe('CreateBillheadComponent', () => {
  let component: CreateBillheadComponent;
  let fixture: ComponentFixture<CreateBillheadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateBillheadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBillheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
