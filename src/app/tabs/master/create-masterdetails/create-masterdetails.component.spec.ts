import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMasterdetailsComponent } from './create-masterdetails.component';

describe('CreateMasterdetailsComponent', () => {
  let component: CreateMasterdetailsComponent;
  let fixture: ComponentFixture<CreateMasterdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMasterdetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMasterdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
