import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceInHandComponent } from './advance-in-hand.component';

describe('AdvanceInHandComponent', () => {
  let component: AdvanceInHandComponent;
  let fixture: ComponentFixture<AdvanceInHandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvanceInHandComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvanceInHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
