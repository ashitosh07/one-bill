import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsettingsComponent } from './clientsettings.component';

describe('ClientsettingssComponent', () => {
  let component: ClientsettingsComponent;
  let fixture: ComponentFixture<ClientsettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientsettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
