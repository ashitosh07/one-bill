import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentHistoryToolbarComponent } from './payment-history-toolbar.component';

describe('PaymentHistoryToolbarComponent', () => {
  let component: PaymentHistoryToolbarComponent;
  let fixture: ComponentFixture<PaymentHistoryToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentHistoryToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentHistoryToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
