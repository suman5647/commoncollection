import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { DirtyCheckComponent } from '../components/dirtycheck.component';

@Injectable({ providedIn: 'root' })
export class DirtyCheckGuard implements CanDeactivate<DirtyCheckComponent> {

  constructor() {
  }

  canDeactivate(component: DirtyCheckComponent) {
    let isdirty = component.isDirty();
    if (isdirty) {
      let res = confirm("Do you want to discard changes?");
      if (res) {
        component.resetForm();
      }

      return res;
    }

    return true;
  }
}
