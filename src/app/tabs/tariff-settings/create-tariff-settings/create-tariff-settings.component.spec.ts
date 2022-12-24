import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTariffSettingsComponent } from './create-tariff-settings.component';

describe('CreateTariffSettingsComponent', () => {
  let component: CreateTariffSettingsComponent;
  let fixture: ComponentFixture<CreateTariffSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTariffSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTariffSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
