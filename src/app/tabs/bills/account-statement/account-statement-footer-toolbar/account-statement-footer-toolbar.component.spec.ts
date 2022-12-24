import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatementFooterToolbarComponent } from './account-statement-footer-toolbar.component';

describe('AccountStatementFooterToolbarComponent', () => {
  let component: AccountStatementFooterToolbarComponent;
  let fixture: ComponentFixture<AccountStatementFooterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountStatementFooterToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountStatementFooterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
