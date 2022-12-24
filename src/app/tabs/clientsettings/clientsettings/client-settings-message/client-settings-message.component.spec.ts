import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSettingsMessageComponent } from './client-settings-message.component';

describe('ClientSettingsMessageComponent', () => {
  let component: ClientSettingsMessageComponent;
  let fixture: ComponentFixture<ClientSettingsMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientSettingsMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientSettingsMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
