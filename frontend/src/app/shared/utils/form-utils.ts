import { FormGroup } from '@angular/forms';

export class FormUtils {


  static isValidField(form: FormGroup, fieldName: string, isSubmitted: boolean): boolean {
    const control = form.get(fieldName);
    return !!control && control.invalid && isSubmitted;
  }


  static getFieldError(form: FormGroup, fieldName: string): string | null {

    if(!form.controls[fieldName]) return null;

    const errors = form.controls[fieldName].errors ?? {};

    for(const key of Object.keys(errors)) {
      switch(key) {
        case 'required':
          return 'This field is required';
        case 'email':
          return 'Invalid email format';
        case 'minlength':
          return `Minimum length is ${errors['minlength'].requiredLength}`;
        case 'maxlength':
          return `Maximum length is ${errors['maxlength'].requiredLength}`;
        case 'min':
          return `Minimum value is ${errors['min'].min}`;
        case 'max':
          return `Maximum value is ${errors['max'].max}`;
        case 'pattern':
          return 'Invalid characters used';
      }
    }

    return null;

  }



  }
