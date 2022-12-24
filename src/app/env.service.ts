import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class EnvService {
  public production = false
  public googleMapsApiKey = ''
  public backend = 'https://rs-worx.com/api'
  public backendForFiles = 'https://rs-worx.com/api'
  public fakeUrl = 'http://localhost:3000'
  public jsonServerUrl = 'https://rs-worx.com/api'
  public dateFormat = 'mediumDate'
  public currencyFormat = 'AED'
  public roundOffFormat = '1.2-2'
  public consumptionRoundOffFormat = '1.2-2'
  public MaxBytes = 3145728
  public externalRoles = {
    ownerExternal: 101,
    tenantExternal: 102,
  }
  public idle = 45
  public timeout = 900
  public confirmationTimeout = 60000 //1 minute
  public cookieDomain = 'https://rs-worx.com/api'
  constructor() {}
}
