import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSlabTariffSettingsComponent } from '../edit-slab-tariff-settings/edit-slab-tariff-settings.component';

describe('EditTariffSettingsComponent', () => {
  let component: EditSlabTariffSettingsComponent;
  let fixture: ComponentFixture<EditSlabTariffSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSlabTariffSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSlabTariffSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
