import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationLogsToolbarComponent } from './notification-logs-toolbar.component';

describe('NotificationLogsToolbarComponent', () => {
  let component: NotificationLogsToolbarComponent;
  let fixture: ComponentFixture<NotificationLogsToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationLogsToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationLogsToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
