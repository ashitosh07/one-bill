import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[furyValidateNumericOnlyDirective]'
})
export class ValidateNumericOnlyDirective {
  
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private navigationKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  constructor(private el: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
    if (
        // Allow: Delete, Backspace, Tab, Escape, Enter, etc
        this.navigationKeys.indexOf(e.key) > -1 || 
        (e.key === 'a' && e.ctrlKey === true) || // Allow: Ctrl+A
        (e.key === 'c' && e.ctrlKey === true) || // Allow: Ctrl+C
        (e.key === 'v' && e.ctrlKey === true) || // Allow: Ctrl+V
        (e.key === 'x' && e.ctrlKey === true) || // Allow: Ctrl+X
        (e.key === 'a' && e.metaKey === true) || // Cmd+A (Mac)
        (e.key === 'c' && e.metaKey === true) || // Cmd+C (Mac)
        (e.key === 'v' && e.metaKey === true) || // Cmd+V (Mac)
        (e.key === 'x' && e.metaKey === true) // Cmd+X (Mac)
    ) {
        return;  // let it happen, don't do anything
    }
    // Ensure that it is a number and stop the keypress
    if (e.key === ' ' || isNaN(Number(e.key)) || (!isNaN(Number(e.key)) && Number(e.key) < 1 && Number(e.key) > 5)) {
        e.preventDefault();
    }
    }
}
