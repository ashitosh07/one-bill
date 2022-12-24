import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleLineDiagramComponent } from './single-line-diagram.component';

describe('SimpleLineDiagramComponent', () => {
  let component: SingleLineDiagramComponent;
  let fixture: ComponentFixture<SingleLineDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SingleLineDiagramComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleLineDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
