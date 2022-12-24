import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstidamadashboardComponent } from './estidamadashboard.component';

describe('EstidamadashboardComponent', () => {
  let component: EstidamadashboardComponent;
  let fixture: ComponentFixture<EstidamadashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstidamadashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstidamadashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
