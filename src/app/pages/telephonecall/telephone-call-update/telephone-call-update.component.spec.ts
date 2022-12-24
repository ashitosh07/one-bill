import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelephoneCallUpdateComponent } from './telephone-call-update.component';

describe('TelephoneCallUpdateComponent', () => {
  let component: TelephoneCallUpdateComponent;
  let fixture: ComponentFixture<TelephoneCallUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TelephoneCallUpdateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelephoneCallUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
