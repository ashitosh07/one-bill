import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsGroupwiseEnergycostComponent } from './ems-groupwise-energycost.component';

describe('EmsGroupwiseEnergycostComponent', () => {
  let component: EmsGroupwiseEnergycostComponent;
  let fixture: ComponentFixture<EmsGroupwiseEnergycostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsGroupwiseEnergycostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsGroupwiseEnergycostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
