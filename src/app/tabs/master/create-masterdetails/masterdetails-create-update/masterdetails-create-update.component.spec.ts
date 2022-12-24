import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterdetailsCreateUpdateComponent } from './masterdetails-create-update.component';

describe('MasterdetailsCreateUpdateComponent', () => {
  let component: MasterdetailsCreateUpdateComponent;
  let fixture: ComponentFixture<MasterdetailsCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterdetailsCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterdetailsCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
