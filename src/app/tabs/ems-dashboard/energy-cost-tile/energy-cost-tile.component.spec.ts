import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyCostTileComponent } from './energy-cost-tile.component';

describe('EnergyCostTileComponent', () => {
  let component: EnergyCostTileComponent;
  let fixture: ComponentFixture<EnergyCostTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyCostTileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyCostTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
