import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBillFooterToolbarComponent } from './create-bill-footer-toolbar.component';

describe('CreateBillFooterToolbarComponent', () => {
  let component: CreateBillFooterToolbarComponent;
  let fixture: ComponentFixture<CreateBillFooterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBillFooterToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBillFooterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
