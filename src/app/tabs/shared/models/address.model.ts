export class Address {
    id?: string;
    address1?: string;
    address2?: string;
    address3?: string;
    city?: string;
    zipPostalCode?: string;
    stateProvinceCountry?: string;
    countryId?: number;
    country?: string;
    addressTypeId?: number;
    addressType?: string;
    areaId?: number;
    area?: string;
    locationId?: number;
    location?: string;
    email?: string;
    phoneNumber?: string;

    constructor(address) {
        this.id = address.id || 0;
        this.address1 = address.address1 || '';
        this.address2 = address.address2 || '';
        this.address3 = address.address3 || '';
        this.city = address.city || '';
        this.zipPostalCode = address.zipPostalCode || '';
        this.stateProvinceCountry = address.stateProvinceCountry || '';
        this.countryId = address.countryId || 0;
        this.country = address.country || '';
        this.addressTypeId = address.addressTypeId || 0;
        this.addressType = address.addressType || '';
        this.areaId = address.areaId || 0;
        this.area = address.area || '';
        this.locationId = address.locationId || 0;
        this.location = address.location || '';
        this.email = address.email || '';
        this.phoneNumber = address.phoneNumber || '';
    }
}
