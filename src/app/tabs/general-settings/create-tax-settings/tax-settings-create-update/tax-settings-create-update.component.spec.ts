import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxSettingsCreateUpdateComponent } from './tax-settings-create-update.component';

describe('TaxSettingsCreateUpdateComponent', () => {
  let component: TaxSettingsCreateUpdateComponent;
  let fixture: ComponentFixture<TaxSettingsCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxSettingsCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxSettingsCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
