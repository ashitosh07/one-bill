import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandableTableStructureComponent } from './expandable-table-structure.component';

describe('ExpandableTableStructureComponent', () => {
  let component: ExpandableTableStructureComponent;
  let fixture: ComponentFixture<ExpandableTableStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpandableTableStructureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandableTableStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
