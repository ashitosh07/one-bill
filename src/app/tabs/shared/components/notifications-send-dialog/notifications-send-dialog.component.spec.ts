import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsSendDialogComponent } from './notifications-send-dialog.component';

describe('NotificationsSendDialogComponent', () => {
  let component: NotificationsSendDialogComponent;
  let fixture: ComponentFixture<NotificationsSendDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationsSendDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsSendDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
