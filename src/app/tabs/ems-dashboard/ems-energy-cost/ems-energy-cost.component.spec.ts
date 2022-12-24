import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsEnergyCostComponent } from './ems-energy-cost.component';

describe('EmsEnergyCostComponent', () => {
  let component: EmsEnergyCostComponent;
  let fixture: ComponentFixture<EmsEnergyCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsEnergyCostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsEnergyCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
