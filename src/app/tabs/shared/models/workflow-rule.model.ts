export class WorkflowRule {
    id?: boolean;
    description?: string;
    workflowRuleId?: number;
    clientId?: number;
    value?: boolean;
    constraint?: string;
    constructor(workflowRule) {
        this.id = workflowRule.id || 0;
        this.description = workflowRule.description || '';
        this.workflowRuleId = workflowRule.workflowRuleId || 0;
        this.value = workflowRule.value || false;
        this.clientId = workflowRule.clientId || 0;
        this.constraint = workflowRule.constraint || '';
    }
}