import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnbilledConsumptionComponent } from './unbilled-consumption.component';

describe('UnbilledConsumptionComponent', () => {
  let component: UnbilledConsumptionComponent;
  let fixture: ComponentFixture<UnbilledConsumptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnbilledConsumptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnbilledConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
