import { Component, computed, inject, ResourceRef, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminService } from '../../services/admin.service';
import { AdminSearchInput } from '../../components/admin-search-input/admin-search-input';
import { AdminUsersList } from '../../components/admin-users-list/admin-users-list';
import { catchError } from 'rxjs/operators';
import { EMPTY, throwError } from 'rxjs';
import { AdminUsersForm } from '../../components/admin-users-form/admin-users-form';
import { User } from '../../../interfaces/users.interface';



@Component({
  selector: 'admin-users-page',
  imports: [AdminUsersList, AdminSearchInput, AdminUsersForm],
  templateUrl: './admin-users-page.html',
})
export class AdminUsersPage {

  adminService = inject(AdminService);

  userResourceForForm = computed(() => {
    const user = this.adminService.selectedUserResource.value();
    if (!user) {
      return null;
    }
    return this.adminService.selectedUserResource as ResourceRef<User>;
  });




}



