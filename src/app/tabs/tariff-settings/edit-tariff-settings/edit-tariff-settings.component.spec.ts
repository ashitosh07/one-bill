import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTariffSettingsComponent } from './edit-tariff-settings.component';

describe('EditTariffSettingsComponent', () => {
  let component: EditTariffSettingsComponent;
  let fixture: ComponentFixture<EditTariffSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTariffSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTariffSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
