import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractEndDetailsComponent } from './contract-end-details.component';

describe('ContractEndDetailsComponent', () => {
  let component: ContractEndDetailsComponent;
  let fixture: ComponentFixture<ContractEndDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractEndDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractEndDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
