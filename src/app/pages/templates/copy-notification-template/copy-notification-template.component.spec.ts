import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyNotificationTemplateComponent } from './copy-notification-template.component';

describe('CopyNotificationTemplateComponent', () => {
  let component: CopyNotificationTemplateComponent;
  let fixture: ComponentFixture<CopyNotificationTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyNotificationTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyNotificationTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
