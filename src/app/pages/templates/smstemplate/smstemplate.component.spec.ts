import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmstemplateComponent } from './smstemplate.component';

describe('SmstemplateComponent', () => {
  let component: SmstemplateComponent;
  let fixture: ComponentFixture<SmstemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmstemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmstemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
