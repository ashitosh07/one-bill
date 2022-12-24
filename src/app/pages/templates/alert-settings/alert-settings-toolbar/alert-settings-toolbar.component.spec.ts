import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertSettingsToolbarComponent } from './alert-settings-toolbar.component';

describe('AlertSettingsToolbarComponent', () => {
  let component: AlertSettingsToolbarComponent;
  let fixture: ComponentFixture<AlertSettingsToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertSettingsToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertSettingsToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
