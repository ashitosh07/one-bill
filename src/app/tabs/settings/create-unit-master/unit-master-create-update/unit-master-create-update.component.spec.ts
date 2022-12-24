import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitMasterCreateUpdateComponent } from './unit-master-create-update.component';

describe('CreateUpdateUnitMasterComponent', () => {
  let component: UnitMasterCreateUpdateComponent;
  let fixture: ComponentFixture<UnitMasterCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnitMasterCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitMasterCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
