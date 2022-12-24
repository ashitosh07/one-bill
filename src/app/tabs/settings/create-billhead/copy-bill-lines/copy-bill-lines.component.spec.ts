import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyBillLinesComponent } from './copy-bill-lines.component';

describe('CopyBillLinesComponent', () => {
  let component: CopyBillLinesComponent;
  let fixture: ComponentFixture<CopyBillLinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyBillLinesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyBillLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
