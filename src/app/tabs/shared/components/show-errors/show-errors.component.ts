import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-show-errors',
  templateUrl: './show-errors.component.html',
  styleUrls: ['./show-errors.component.scss']
})
export class ShowErrorsComponent implements OnInit {

  @Input() ctrl: FormControl;

  PATTERN_ERROR_MESSAGE = {
      "/^[a-zA-Z ]*$/": "Accepts only alphabets with spaces",
      "/^[a-zA-Z0-9]*$/": "Accepts only alphanumeric values with no spaces",
      "/^[a-zA-Z0-9 ]*$/": "Accepts only alphanumeric values with spaces",
      "/^[0-9]*$/": "Accepts only numbers",
      "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{3,4}$" : "Enter valid email address of format test@mail.com"
  }

  ERROR_MESSAGE = {
    required: () => `This field is required`,
    minlength: (error) => `Min ${error.requiredLength} chars is required but got only ${error.actualLength}`,
    maxlength: (error) => `Max chars allowed is ${error.requiredLength} but got ${error.actualLength}`,
    pattern: (error) => `${this.PATTERN_ERROR_MESSAGE[error.requiredPattern]}`,
    email: () => `Enter valid email address of format test@mail.com`
  };

  constructor() { }

  ngOnInit() { }

  shouldShowErrors(): boolean {
    return this.ctrl && this.ctrl.errors && this.ctrl.touched;
  }

  listOfErrors(): string[] {
    return Object.keys(this.ctrl.errors).map(
      err => this.ERROR_MESSAGE[err](this.ctrl.getError(err))
    );
  }

}
