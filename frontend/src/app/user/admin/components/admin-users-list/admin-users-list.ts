import { Component, input, output, ResourceRef} from '@angular/core';
import { User } from '../../../interfaces/users.interface';




@Component({
  selector: 'admin-users-list',
  imports: [],
  templateUrl: './admin-users-list.html',
})
export class AdminUsersList {

  usersResource = input.required<ResourceRef<User[]>>();
  value = output<number>();
}

