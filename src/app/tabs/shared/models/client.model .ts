import { Address } from './address.model';
import { BankDetails } from './bank-details.model';
import { Documents } from './documents.model';
import { Utility } from './utility.model';
import { ImageProperty } from './imageProperty.model';
import { TermsCondition } from './terms-condition.model';

export class Client {
  id: number;
  clientNumber: string;
  clientName: string;
  titleId: number;
  title: string;
  photo: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  phoneNo: string;
  email: string;
  companyName: string;
  buildingName: string;
  businessStartDate: Date;
  businessEndDate: Date;
  trnNo: string;
  statusId: number;
  status: string;
  workingHours?: string;
  website?: string;
  addresses: Address[];
  bankDetails: BankDetails[];
  documents: Documents[];
  utilities: Utility[];
  imageProperties: ImageProperty[];
  termsConditions: TermsCondition[];
  constructor(tenant) {
    this.id = tenant.id || 0;
    this.clientNumber = tenant.clientNumber || '';
    this.clientName = tenant.clientName || '';
    this.titleId = tenant.titleId || '';
    this.title = tenant.title || '';
    this.firstName = tenant.firstName || '';
    this.lastName = tenant.lastName || '';
    this.accountNumber = tenant.accountNumber || '';
    this.phoneNo = tenant.phoneNo || '';
    this.email = tenant.email || '';
    this.companyName = tenant.companyName || '';
    this.photo = tenant.photo || '';
    this.businessStartDate = tenant.businessStartDate || '';
    this.businessEndDate = tenant.businessEndDate || '';
    this.trnNo = tenant.trnNo || '';
    this.statusId = tenant.statusId || '';
    this.status = tenant.status || '';
    this.website = tenant.website || '';
    this.workingHours = tenant.workingHours || '';
    this.addresses = (tenant.addresses || []).map(address => new Address(address));
    this.bankDetails = (tenant.bankDetails || []).map(bankDetail => new BankDetails(bankDetail));
    this.documents = (tenant.documents || []).map(document => new Documents(document));
    this.utilities = (tenant.utilities || []).map(utility => new Utility(utility));
    this.imageProperties = (tenant.imageProperties || [])
    this.termsConditions = (tenant.TermsConditions || [])
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
