import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientSettingsLedgerRelationComponent } from './client-settings-ledger-relation.component';

describe('ClientSettingsLedgerRelationComponent', () => {
  let component: ClientSettingsLedgerRelationComponent;
  let fixture: ComponentFixture<ClientSettingsLedgerRelationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientSettingsLedgerRelationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientSettingsLedgerRelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
