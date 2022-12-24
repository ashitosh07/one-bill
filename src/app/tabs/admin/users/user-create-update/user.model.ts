export class Tenant {
  id: number;
  firstName: string;
  lastName: string;
  street: string;
  zipcode: number;
  city: string;
  phoneNumber: string;
  mail: string;

  constructor(tenant) {
    this.id = tenant.id;
    this.firstName = tenant.firstName;
    this.lastName = tenant.lastName;
    this.street = tenant.street;
    this.zipcode = tenant.zipcode;
    this.city = tenant.city;
    this.phoneNumber = tenant.phoneNumber;
    this.mail = tenant.mail;
  }

  get name() {
    let name = '';

    if (this.firstName && this.lastName) {
      name = this.firstName + ' ' + this.lastName;
    } else if (this.firstName) {
      name = this.firstName;
    } else if (this.lastName) {
      name = this.lastName;
    }

    return name;
  }

  set name(value) {
  }

  get address() {
    return `${this.street}, ${this.zipcode} ${this.city}`;
  }

  set address(value) {
  }
}
