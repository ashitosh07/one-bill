import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeterReplacementCreateUpdateComponent } from './meter-replacement-create-update.component';

describe('MeterreplacementCreateComponent', () => {
  let component: MeterReplacementCreateUpdateComponent;
  let fixture: ComponentFixture<MeterReplacementCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeterReplacementCreateUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeterReplacementCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
