import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillheadCreateUpdateComponent } from './billhead-create-update.component';

describe('BillheadCreateUpdateComponent', () => {
  let component: BillheadCreateUpdateComponent;
  let fixture: ComponentFixture<BillheadCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillheadCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillheadCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
