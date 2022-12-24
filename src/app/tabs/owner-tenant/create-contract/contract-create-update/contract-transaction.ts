export interface ContractTransaction {
    id: number;
    contractId: number;
    contractSuspendDate: string;
    contractReActivatedDate?: string;
    reasonForContractSuspend?: string;
}