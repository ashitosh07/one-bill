import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBillToolbarComponent } from './create-bill-toolbar.component';

describe('CreateBillToolbarComponent', () => {
  let component: CreateBillToolbarComponent;
  let fixture: ComponentFixture<CreateBillToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBillToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBillToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
