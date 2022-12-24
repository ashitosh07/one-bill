import { CookieService } from 'ngx-cookie-service'
import { EnvService } from 'src/app/env.service'
import { environment } from '../../../../environments/environment'
import { DatePipe } from '@angular/common'

export function deleteCookies(
  cookieService: CookieService,
  envService: EnvService
) {
  // cookieService.delete('userLoginId', '/', envService.cookieDomain)
  // cookieService.delete('ownerId', '/', envService.cookieDomain)
  // cookieService.delete('filterData', '/', envService.cookieDomain)
  // cookieService.delete('access_token', '/', envService.cookieDomain)
  // cookieService.delete('access_profile', '/', envService.cookieDomain)
  // cookieService.delete('userId', '/', envService.cookieDomain)
  // cookieService.delete('globalClientId', '/', envService.cookieDomain)
  // cookieService.delete('external_role', '/', envService.cookieDomain)
  cookieService.deleteAll()
  // cookieService.deleteAll('/', envService.cookieDomain)
  localStorage.removeItem('userClients')
  localStorage.removeItem('logged_in')
}
console.log(deleteCookies)
export function stringIsNullOrEmpty(
  value: string,
  symbol: string = ''
): string {
  let data: string = ''
  if (value) {
    data = value + (symbol ? symbol : '')
  }
  return data.trim()
}

export enum KEY_CODE {
  UP_ARROW = 'ArrowUp',
  DOWN_ARROW = 'ArrowDown',
  RIGHT_ARROW = 'ArrowRight',
  LEFT_ARROW = 'ArrowLeft',
  Enter = 'Enter',
  Tab = 'Tab',
}

export enum BillType {
  NormalBill = 1,
  FinalBill,
  AverageBill,
  ManualBill,
}

export function convertToNumber(value: any) {
  let data = 0
  if (value && !isNaN(value)) {
    data = Number(value.toString().replace(',', ''))
  } else {
    data = 0
  }
  return data
}

export function getClientDataFormat(
  type: string,
  utilityTypeId: number = 0,
  utilityType: string = ''
): string {
  if (utilityType != '') {
    return localStorage.getItem('data_formats')
      ? JSON.parse(localStorage.getItem('data_formats')).find(
          (x) => x.roundOffType === type && x.utilityType == utilityType
        )?.roundOff
      : ''
  } else {
    return localStorage.getItem('data_formats')
      ? JSON.parse(localStorage.getItem('data_formats')).find(
          (x) =>
            x.roundOffType === type &&
            (x.utilityTypeId == utilityTypeId || x.utilityTypeId == 0)
        )?.roundOff
      : ''
  }
}

export function validateDates(startDate: Date, endDate: Date) {
  let isValidDate = true
  let startYear = new Date(startDate).getFullYear()
  let endYear = new Date(endDate).getFullYear()
  if (startYear != 1970 && endYear != 1970) {
    if (startYear < endYear) {
      isValidDate = true
      return isValidDate
    } else if (startYear > endYear) {
      isValidDate = false
      return isValidDate
    } else if (startDate != null && endDate != null) {
      if (endDate < startDate) {
        isValidDate = false
      }
      return isValidDate
    }
  } else {
    return isValidDate
  }
}
