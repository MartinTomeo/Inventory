import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'userRole', standalone: true})
export class UserRolePipe implements PipeTransform {

  transform(role: number): string {
    switch (role) {
      case 1:
        return 'Admin';

      case 2:
        return 'Audit';

      case 3:
        return 'Editor';

      default:
        return 'Unknown';
    }
  }
}
