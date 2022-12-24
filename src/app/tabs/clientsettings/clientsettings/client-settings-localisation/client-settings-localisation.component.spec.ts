import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSettingsLocalisationComponent } from './client-settings-localisation.component';

describe('ClientSettingsLocalisationComponent', () => {
  let component: ClientSettingsLocalisationComponent;
  let fixture: ComponentFixture<ClientSettingsLocalisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientSettingsLocalisationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientSettingsLocalisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
