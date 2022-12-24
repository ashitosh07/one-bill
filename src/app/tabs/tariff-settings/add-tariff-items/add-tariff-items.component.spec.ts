import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTariffItemsComponent } from './add-tariff-items.component';

describe('AddTariffItemsComponent', () => {
  let component: AddTariffItemsComponent;
  let fixture: ComponentFixture<AddTariffItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTariffItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTariffItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
