import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'userName', standalone: true})
export class UserNamePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/_/g, ' ').trim().split(/\s+/).map(word => word.charAt(0).toLocaleUpperCase('es') + word.slice(1)).join(' ');
  }
}
