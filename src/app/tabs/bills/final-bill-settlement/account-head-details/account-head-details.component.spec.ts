import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountHeadDetailsComponent } from './account-head-details.component';

describe('AccountHeadDetailsComponent', () => {
  let component: AccountHeadDetailsComponent;
  let fixture: ComponentFixture<AccountHeadDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountHeadDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountHeadDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
