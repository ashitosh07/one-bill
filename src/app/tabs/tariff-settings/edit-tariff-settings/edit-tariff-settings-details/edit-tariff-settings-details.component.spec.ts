import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTariffSettingsDetailsComponent } from './edit-tariff-settings-details.component';

describe('EditTariffSettingsDetailsComponent', () => {
  let component: EditTariffSettingsDetailsComponent;
  let fixture: ComponentFixture<EditTariffSettingsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTariffSettingsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTariffSettingsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
