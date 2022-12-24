import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTableStructureComponent } from './dynamic-table-structure.component';

describe('DynamicTableStructureComponent', () => {
  let component: DynamicTableStructureComponent;
  let fixture: ComponentFixture<DynamicTableStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicTableStructureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicTableStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
