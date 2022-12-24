import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterReadingComponent } from './meter-reading.component';

describe('MeterReadingComponent', () => {
  let component: MeterReadingComponent;
  let fixture: ComponentFixture<MeterReadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeterReadingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeterReadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
