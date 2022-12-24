import { Address } from './address.model';
import { BankDetails } from './bank-details.model';
import { Documents } from './documents.model';

export class Tenant {
  id: number;
  clientId: number;
  tenantNumber: string;
  ownerName: string;
  titleId: number;
  title: string;
  photo: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  phoneNo: string;
  email: string;
  companyName: string;
  isCompany: boolean;
  buildingName: string;
  role?: string;
  addresses: Address[];
  bankDetails: BankDetails[];
  documents: Documents[];

  constructor(tenant) {
    this.id = tenant.id || 0;
    this.clientId = tenant.clientId || 0;
    this.tenantNumber = tenant.tenantNumber || '';
    this.ownerName = tenant.ownerName || '';
    this.titleId = tenant.titleId || '';
    this.title = tenant.title || '';
    this.firstName = tenant.firstName || '';
    this.lastName = tenant.lastName || '';
    this.accountNumber = tenant.accountNumber || '';
    this.phoneNo = tenant.phoneNo || '';
    this.email = tenant.email || '';
    this.companyName = tenant.companyName || '';
    this.photo = tenant.photo || '';
    this.role = tenant.role || '';
    this.addresses = (tenant.addresses || []).map(address => new Address(address));
    this.bankDetails = (tenant.bankDetails || []).map(bankDetail => new BankDetails(bankDetail));
    this.documents = (tenant.documents || []).map(document => new Documents(document));
  }

  get fullName() {
    let fullName = '';

    if (this.title && this.title !== '') {
      fullName += this.title + ' ';
    }

    if (this.firstName && this.firstName !== '') {
      fullName += this.firstName + ' ';
    }

    if (this.lastName && this.lastName !== '') {
      fullName += this.lastName;
    }

    return fullName;
  }

}
