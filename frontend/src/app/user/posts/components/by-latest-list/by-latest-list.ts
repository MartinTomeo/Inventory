import { Component, input } from '@angular/core';
import { User } from '../../interfaces/users.interface';
@Component({
  selector: 'latest-list',
  imports: [],
  templateUrl: './by-latest-list.html',
})
export class ByLatestList {

  users =input.required<User[]>();

}
