import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstidamaChartComponent } from './estidama-chart.component';

describe('EstidamaChartComponent', () => {
  let component: EstidamaChartComponent;
  let fixture: ComponentFixture<EstidamaChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstidamaChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EstidamaChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
