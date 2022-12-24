import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreatePeakSettingsComponent } from './create-peak-settings.component';

describe('CreatePeakSettingsComponent', () => {
  let component: CreatePeakSettingsComponent;
  let fixture: ComponentFixture<CreatePeakSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatePeakSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePeakSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
