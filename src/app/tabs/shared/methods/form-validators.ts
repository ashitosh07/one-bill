import { Validators } from '@angular/forms';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class FormValidators {
    emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{3,4}$";
    nameValidators =  Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(256)
        
      ]);

    optionalNameValidators = Validators.compose([
        Validators.minLength(1),
        Validators.maxLength(256),
        Validators.pattern(/^[a-zA-Z ]*$/)
    ])

    emailValidators = Validators.compose([
        Validators.required,
        Validators.pattern(this.emailPattern)
        //Validators.email
    ]);

    mobileNumberValidators = Validators.compose([
        Validators.required,
        Validators.pattern(/^[0-9]*$/)
    ])

    addressValidators = Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(256),
        Validators.pattern(/^[a-zA-Z0-9 ]*$/)
    ])

    subjectValidator = Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(1000),
        Validators.pattern(/^[a-zA-Z0-9 ]*$/)
    ])

    optionsAddressValidators = Validators.compose([
        Validators.minLength(1),
        Validators.maxLength(256),
        Validators.pattern(/^[a-zA-Z0-9 ]*$/)
    ])

    postalCodeValidators = Validators.compose([
        Validators.pattern(/^[a-zA-Z0-9]*$/)
    ])

    requiredAlphanumericNoSpaces = Validators.compose([
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(256),
        Validators.pattern(/^[a-zA-Z0-9]*$/),
    ])

    passwordValidators = Validators.compose([
        Validators.required,
        Validators.minLength(8),
    ])
}