import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageWorkflowRulesComponent } from './manage-workflow-rules.component';

describe('ManageWorkflowRulesComponent', () => {
  let component: ManageWorkflowRulesComponent;
  let fixture: ComponentFixture<ManageWorkflowRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageWorkflowRulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageWorkflowRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
