export class BulkImportResponse {
  insertSuccessCount: Number
  insertFailedCount: Number
  errorMessage: String[]
  infoMessage: String[]

}

export class AccountHeadResponse {
  id: Number
  accountHeadName: string
}

export class ImportEntityTypes {
  id: Number
  description: string
}

// export enum OwnerDetail {
//   UnitNumber = 'UnitNumber*',
//   AccountNumber = 'AccountNumber*',
//   OwnerName = 'OwnerName*',
//   TRN = 'TRN',
//   IsPortalLogin = 'IsPortalLogin(Yes/No)*',
//   Title = 'Title(Mr/Mrs)',
//   FirstName = 'FirstName',
//   LastName = 'LastName',
//   DOB = 'DOB(mm/dd/yyyy)',
//   MobileNo = 'MobileNo(987654321012)*',
//   Email = 'Email*'
// }

export enum OwnerDetail {
  UnitNumber = 'UnitNumber*',
  AccountNumber = 'AccountNumber*',
  TenantName = 'TenantName*',
  TRN = 'TRN',
  IsPortalLogin = 'IsPortalLogin(Yes/No)*',
  Title = 'Title(Mr/Mrs)',
  FirstName = 'FirstName',
  LastName = 'LastName',
  ContractType = 'ContractType*',
  ContractStartDate = 'ContractStartDate(mm/dd/yyyy)*',
  ContractEndDate = 'ContractEndDate(mm/dd/yyyy)*',
  DOB = 'DOB(mm/dd/yyyy)',
  MobileNo = 'MobileNo(987654321012)*',
  Email = 'Email*',
  SecurityDeposit = 'SecurityDeposit',
  IsSecurityDepositPaid = 'IsSecurityDepositPaid(Yes/No)*'
}

export enum TenantAndContractDetail {
  UnitNumber = 'UnitNumber*',
  AccountNumber = 'AccountNumber*',
  TenantName = 'TenantName*',
  TRN = 'TRN',
  IsPortalLogin = 'IsPortalLogin(Yes/No)*',
  Title = 'Title(Mr/Mrs)',
  FirstName = 'FirstName',
  LastName = 'LastName',
  ContractType = 'ContractType*',
  ContractStartDate = 'ContractStartDate(mm/dd/yyyy)*',
  ContractEndDate = 'ContractEndDate(mm/dd/yyyy)*',
  DOB = 'DOB(mm/dd/yyyy)',
  MobileNo = 'MobileNo(987654321012)*',
  Email = 'Email*',
  SecurityDeposit = 'SecurityDeposit',
  IsSecurityDepositPaid = 'IsSecurityDepositPaid(Yes/No)*'
}


// export enum UnitDetail {
//   UnitNumber = 'UnitNumber*',
//   UnitType = 'UnitType*',
//   MeterName = 'MeterName*',
//   UtilityType = 'UtilityType*',
//   DefaultSecurityDeposit = 'DefaultSecurityDeposit'
// }

export enum UnitDetail {
  ClientName = 'ClientName*',
  UnitNumber = 'UnitNumber*',
  AliasName = 'AliasName*',
  UnitType = 'UnitType*',
  UtilityType = 'UtilityType*',
  MeterName = 'MeterName*',
  MeterReading = 'MeterReading*',
  DefaultSecurityDeposit = 'DefaultSecurityDeposit',
  AreaSqFt = 'AreaSqFt',
  CapacityTon = 'CapacityTon',
  AccountNumber = 'AccountNumber'
}

export enum UnitChargeDetail {
  UnitNumber = 'UnitNumber*',
  Amount = 'Amount',
  Deduction = 'Deduction(Yes/No)*'

}

export enum AdvancePaymentDetail {
  MeterID = 'MeterID*',
  TenantName = 'UnitNumber*',
  MeterName = 'MeterName*',
  TenantId = 'AccountNumber*',
  Date = 'Date(mm/dd/yyyy)*',
  Value = 'Value'

}

export enum PaymentDueDetail {
  MeterID = 'MeterID*',
  TenantName = 'UnitNumber*',
  MeterName = 'MeterName*',
  TenantId = 'AccountNumber*',
  Date = 'Date(mm/dd/yyyy)*',
  Value = 'Value'
}

export enum MeterReading {
  MeterID = 'MeterID*',
  TenantName = 'UnitNumber*',
  MeterName = 'MeterName*',
  Date = 'Date(mm/dd/yyyy)*',
  Value = 'Value'
}

export enum VariablePayDetails {
  AccountNumber = 'AccountNumber',
  Amount = 'Amount',
  Deduction = 'Deduction(Yes/No)*',
  UnitNumber = 'UnitNumber'
}

export enum PaymentDetails {
  AccountNumber = 'AccountNumber',
  Date = 'Date',
  PaymentAmount = 'PaymentAmount',
  PaymentMode = 'PaymentMode',
  Bank = 'Bank',
  Reference = 'Reference',
  Remarks = 'Remarks'
}

export enum EntityTemplateNames {
  OwnerDetails = 1,
  TenantAndContractDetails = 2,
  UnitDetails = 3,
  UnitChargeDetails = 4,
  OpeningAdvance = 5,
  OpeningPaymentDues = 6,
  MeterReadings = 7,
  VariablePayDetails = 8,
  PaymentDetails = 9
}
