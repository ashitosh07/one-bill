import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenchmarkSettingsCreateUpdateComponent } from './benchmark-settings-create-update.component';

describe('BenchmarkSettingsCreateUpdateComponent', () => {
  let component: BenchmarkSettingsCreateUpdateComponent;
  let fixture: ComponentFixture<BenchmarkSettingsCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BenchmarkSettingsCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BenchmarkSettingsCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
