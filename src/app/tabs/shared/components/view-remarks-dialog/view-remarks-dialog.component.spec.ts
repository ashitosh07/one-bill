import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRemarksDialogComponent } from './view-remarks-dialog.component';

describe('ViewRemarksDialogComponent', () => {
  let component: ViewRemarksDialogComponent;
  let fixture: ComponentFixture<ViewRemarksDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRemarksDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRemarksDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
