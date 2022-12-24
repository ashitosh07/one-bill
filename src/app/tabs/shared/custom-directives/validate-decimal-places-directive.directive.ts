import { Directive, ElementRef, HostListener } from '@angular/core';
import { getClientDataFormat } from '../utilities/utility';

@Directive({
  selector: '[furyValidateDecimalPlacesDirective]'
})
export class ValidateDecimalPlacesDirective {

  roundOffFormat: string='';
  decimalPlaces: number = 0;  
  keyString = 'Decimal';
  
  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g); 

  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  constructor(private el: ElementRef) {
    this.roundOffFormat = getClientDataFormat('RoundOff');
    this.decimalPlaces = parseInt(this.roundOffFormat.substring(this.roundOffFormat.indexOf('-')+1,this.roundOffFormat.length));
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    let pattern = '^\\d*\\.?\\d{0,' + `${ this.decimalPlaces}` + '}$';
    this.regex = new RegExp(pattern);

    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = [current.slice(0, position), event.key === this.keyString || event.key === this.keyString.toLowerCase() ? '.' : event.key, current.slice(position)].join('');
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
