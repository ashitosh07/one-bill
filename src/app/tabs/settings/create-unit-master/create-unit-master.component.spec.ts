import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUnitMasterComponent } from './create-unit-master.component';

describe('ListUnitComponent', () => {
  let component: CreateUnitMasterComponent;
  let fixture: ComponentFixture<CreateUnitMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUnitMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUnitMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
