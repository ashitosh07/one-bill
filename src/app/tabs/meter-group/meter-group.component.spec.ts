import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterGroupComponent } from './meter-group.component';

describe('MeterGroupComponent', () => {
  let component: MeterGroupComponent;
  let fixture: ComponentFixture<MeterGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeterGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeterGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
