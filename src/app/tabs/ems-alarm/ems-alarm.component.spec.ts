import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsAlarmComponent } from './ems-alarm.component';

describe('EmsAlarmComponent', () => {
  let component: EmsAlarmComponent;
  let fixture: ComponentFixture<EmsAlarmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsAlarmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsAlarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
