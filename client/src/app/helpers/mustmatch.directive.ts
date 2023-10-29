import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
  selector: '[matchValue]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MustmatchDirective, multi: true }]
})
export class MustmatchDirective implements Validator {

  @Input('matchValue') matchValue: string[] = [];

  constructor() { }

  validate(control: AbstractControl): { [key: string]: any } | null {

    const controlToCmpare = control.parent.get(this.matchValue);
    if (controlToCmpare && controlToCmpare.value !== control.value) {
      return { 'notEqual': true }
    }
    return null
  }

}
