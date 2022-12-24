import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateConsolidatedComponent } from './create-consolidated.component';

describe('CreateConsolidatedComponent', () => {
  let component: CreateConsolidatedComponent;
  let fixture: ComponentFixture<CreateConsolidatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateConsolidatedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateConsolidatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
