import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenTicketsDashboardComponent } from './open-tickets-dashboard.component';

describe('OpenTicketsDashboardComponent', () => {
  let component: OpenTicketsDashboardComponent;
  let fixture: ComponentFixture<OpenTicketsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenTicketsDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenTicketsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
