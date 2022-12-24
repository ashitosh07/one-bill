import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUserMasterComponent } from './create-user-master.component';

describe('CreateUserMasterComponent', () => {
  let component: CreateUserMasterComponent;
  let fixture: ComponentFixture<CreateUserMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUserMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUserMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
