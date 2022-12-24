import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListemailsComponent } from './listemails.component';

describe('ListemailsComponent', () => {
  let component: ListemailsComponent;
  let fixture: ComponentFixture<ListemailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListemailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListemailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
