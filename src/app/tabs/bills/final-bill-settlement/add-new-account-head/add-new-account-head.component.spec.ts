import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewAccountHeadComponent } from './add-new-account-head.component';

describe('AddNewAccountHeadComponent', () => {
  let component: AddNewAccountHeadComponent;
  let fixture: ComponentFixture<AddNewAccountHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewAccountHeadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewAccountHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
