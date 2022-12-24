import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTaxSettingsComponent } from './create-tax-settings.component';

describe('CreateTaxSettingsComponent', () => {
  let component: CreateTaxSettingsComponent;
  let fixture: ComponentFixture<CreateTaxSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTaxSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTaxSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
