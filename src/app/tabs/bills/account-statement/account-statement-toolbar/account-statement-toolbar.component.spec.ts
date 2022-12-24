import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatementToolbarComponent } from './account-statement-toolbar.component';

describe('AccountStatementToolbarComponent', () => {
  let component: AccountStatementToolbarComponent;
  let fixture: ComponentFixture<AccountStatementToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountStatementToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountStatementToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
