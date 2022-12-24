import { Component, OnInit } from '@angular/core';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { WorkflowRule } from "../../shared/models/workflow-rule.model";
import { WorkflowRuleService } from "../../shared/services/workflow-rule.service";
import { CookieService } from 'ngx-cookie-service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientSelectionService } from '../../shared/services/client-selection.service';

@Component({
  selector: 'app-manage-workflow-rules',
  templateUrl: './manage-workflow-rules.component.html',
  styleUrls: ['./manage-workflow-rules.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation]
})
export class ManageWorkflowRulesComponent implements OnInit {
  form: FormGroup;
  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;
  clientId: number;
  workflowRules: WorkflowRule[] = [];
  workflowRuleFormArray: FormArray = null;

  constructor(
    private workflowRuleService: WorkflowRuleService,
    private cookieService: CookieService,
    private formBuilder: FormBuilder,
    private clientSelectionService: ClientSelectionService,
    private snackbar: MatSnackBar) {
    this.clientId = parseInt(this.cookieService.get('globalClientId'));
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(true);
    this.form = this.formBuilder.group({
      workflowRules: new FormArray([])
    });
    this.getWorkflowRules();
  }

  getWorkflowRules() {
    this.workflowRuleService.getWorkflowRules(this.clientId).subscribe({
      next: (workflowRules) => {
        if (workflowRules && workflowRules.length) {
          this.workflowRuleFormArray = this.form.controls.workflowRules as FormArray;
          workflowRules.forEach(x => {
            if (!x.clientId) {
              x.clientId = this.clientId;
            }
            this.workflowRuleFormArray.push(new FormControl(x.value));
          });
          this.workflowRules = workflowRules;
        }
      },
      error: (err) => {
        this.notificationMessage('Workflow rules not found.', 'red-snackbar');
      }
    })
  }

  toggleValueChange(workflowRule: WorkflowRule, value: any) {
    workflowRule.value = value.checked;
  }

  submit() {
    if (this.workflowRules && this.workflowRules.length) {
      this.workflowRuleService.updateWorkflowRules(this.workflowRules).subscribe({
        next: (response) => {
          if (response) {
            this.notificationMessage('Workflow rules updated successfully.', 'green-snackbar');
          } else {
            this.notificationMessage('Workflow rules update failed.', 'red-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('Workflow rules update failed.', 'red-snackbar');
        }
      });
    }
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }


}
