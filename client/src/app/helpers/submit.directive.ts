import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

@Directive({
  selector: '[tsSubmitIfValid]'
})
export class SubmitDirective {

  @Output('tsSubmitIfValid') valid = new EventEmitter<void>();

  constructor(private formRef: NgForm) { }

  @HostListener('click')
  handleClick() {
    this.markFieldsAsTouched();
    this.emitIfValid();
  }

  private markFieldsAsTouched() {
    Object.keys(this.formRef.controls)
      .forEach(fieldName =>
        this.formRef.controls[fieldName].markAsTouched()
      );
  }

  private emitIfValid() {
    if (this.formRef.valid) {
      this.valid.emit();
    }
  }

}
