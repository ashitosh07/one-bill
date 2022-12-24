import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationLogsFooterToolbarComponent } from './notification-logs-footer-toolbar.component';

describe('BillHistoryFooterToolbarComponent', () => {
  let component: NotificationLogsFooterToolbarComponent;
  let fixture: ComponentFixture<NotificationLogsFooterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationLogsFooterToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationLogsFooterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
