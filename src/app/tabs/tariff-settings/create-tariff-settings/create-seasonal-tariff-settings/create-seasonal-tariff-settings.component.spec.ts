import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateSeasonalTariffSettingsComponent } from './create-seasonal-tariff-settings.component';

describe('CreateSeasonalTariffSettingsComponent', () => {
  let component: CreateSeasonalTariffSettingsComponent;
  let fixture: ComponentFixture<CreateSeasonalTariffSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSeasonalTariffSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSeasonalTariffSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
