import { Address } from '../../../shared/models/address.model';
import { BankDetails } from '../../../shared/models/bank-details.model';
import { Documents } from '../../../shared/models/documents.model';
import { UserDetails } from 'src/app/tabs/shared/models/user-details';
import { Ownership } from "./ownership.model";
export class Owner {
  id: number;
  clientId: number;
  ownerName: string;
  //startDate: Date;
  dob: Date;
  title: string;
  titleId: number;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  photo: string;
  isCompany: boolean;
  entityType: string;
  isOwner: boolean;
  accountNumber: string;
  companyName: string;
  trn: string;
  userId?: string;
  isContractExists?: boolean;
  addresses: Address[];
  bankDetails: BankDetails[];
  documents: Documents[];
  userDetails?: UserDetails;
  ownerships: Ownership[];

  constructor(owner) {
    this.id = owner.id || 0;
    this.clientId = owner.clientId || '';
    this.ownerName = owner.ownerName || '';
    //this.startDate = owner.startDate || '';
    this.dob = owner.dob || null;
    this.title = owner.title || '';
    this.titleId = owner.titleId || 0;
    this.firstName = owner.firstName || '';
    this.lastName = owner.lastName || '';
    this.mobile = owner.mobile || '';
    this.email = owner.email || '';
    this.entityType = owner.entityType || 'Tenant';
    this.accountNumber = owner.accountNumber || '';
    this.companyName = owner.companyName || '';
    this.photo = owner.photo || '';
    this.isCompany = owner.isCompany || false;
    this.isOwner = owner.isOwner;
    this.userId = owner.userId || '';
    this.trn = owner.trn || '';
    this.isContractExists = owner.isContractExists || false;
    this.addresses = (owner.addresses || []).map(address => new Address(address));
    this.bankDetails = (owner.bankDetails || []).map(bankDetail => new BankDetails(bankDetail));
    this.documents = (owner.documents || []).map(document => new Documents(document));
    this.userDetails = (owner.userDetails || {});
    this.ownerships = (owner.ownerships || []).map(ownership => new Ownership(ownership));
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
