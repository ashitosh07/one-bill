import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBenchmarkSettingsComponent } from './create-benchmark-settings.component';

describe('CreateBenchmarkSettingsComponent', () => {
  let component: CreateBenchmarkSettingsComponent;
  let fixture: ComponentFixture<CreateBenchmarkSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBenchmarkSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBenchmarkSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
