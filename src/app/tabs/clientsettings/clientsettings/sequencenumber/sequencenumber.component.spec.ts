import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SequencenumberComponent } from './sequencenumber.component';

describe('SequencenumberComponent', () => {
  let component: SequencenumberComponent;
  let fixture: ComponentFixture<SequencenumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SequencenumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SequencenumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
