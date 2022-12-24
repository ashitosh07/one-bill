import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelephoneCallsListComponent } from './telephone-calls-list.component';

describe('TelephoneCallsListComponent', () => {
  let component: TelephoneCallsListComponent;
  let fixture: ComponentFixture<TelephoneCallsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TelephoneCallsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelephoneCallsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
