import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerRegisteredCreateUpdateComponent } from './owner-registered-create-update.component';

describe('OwnerRegisteredCreateUpdateComponent', () => {
  let component: OwnerRegisteredCreateUpdateComponent;
  let fixture: ComponentFixture<OwnerRegisteredCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OwnerRegisteredCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnerRegisteredCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
