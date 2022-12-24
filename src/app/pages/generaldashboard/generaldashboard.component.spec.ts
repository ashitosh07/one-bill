import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneraldashboardComponent } from './generaldashboard.component';

describe('GeneraldashboardComponent', () => {
  let component: GeneraldashboardComponent;
  let fixture: ComponentFixture<GeneraldashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneraldashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneraldashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
