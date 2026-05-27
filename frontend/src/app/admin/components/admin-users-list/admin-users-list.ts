import { Component, input } from '@angular/core';
import { User } from '../../../shared/interfaces/users.interface';
@Component({
  selector: 'admin-users-list',
  imports: [],
  templateUrl: './admin-users-list.html',
})
export class AdminUsersList {

  users =input.required<User[]>();

}
