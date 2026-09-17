import { Component, inject } from '@angular/core';
import { SearchInput } from '../../../shared/components/search-input/search-input';
import { UsersList } from '../../components/users-list/users-list';
import { UsersForm } from '../../components/users-form/users-form';
import { UsersService } from '../../services/users.service';
import { DestroyRef } from '@angular/core';



@Component({
  selector: 'users-page',
  imports: [UsersList, SearchInput, UsersForm],
  templateUrl: './users-page.html',
})
export class UsersPage {

  usersService = inject(UsersService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.usersService.usersResource.reload();

    this.destroyRef.onDestroy(() => {
      this.usersService.resetState();
    });

  }


}


