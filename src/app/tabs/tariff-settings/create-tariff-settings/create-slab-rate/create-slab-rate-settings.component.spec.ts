import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateSlabRateSettingsComponent } from './create-slab-rate-settings.component';

describe('CreateSeasonalTariffSettingsComponent', () => {
  let component: CreateSlabRateSettingsComponent;
  let fixture: ComponentFixture<CreateSlabRateSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSlabRateSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSlabRateSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
