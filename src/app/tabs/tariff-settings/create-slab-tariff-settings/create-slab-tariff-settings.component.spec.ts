import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSlabTariffSettingsComponent } from './create-slab-tariff-settings.component';

describe('CreateTariffSettingsComponent', () => {
  let component: CreateSlabTariffSettingsComponent;
  let fixture: ComponentFixture<CreateSlabTariffSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSlabTariffSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSlabTariffSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
