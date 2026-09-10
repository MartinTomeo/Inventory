import { Component, inject, signal } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { User } from '../../interfaces/users.interface';

@Component({
  selector: 'users-list',
  imports: [],
  templateUrl: './users-list.html',
})
export class UsersList {
  usersService = inject(UsersService);

  userToDelete = signal<User | null>(null);
  isDeleting = signal(false);
  deleteError = signal<string | null>(null);

  selectUser(id: number) {
    this.usersService.selectUser(id);
  }

  openDeleteModal(event: MouseEvent, user: User) {
    event.stopPropagation();

    this.deleteError.set(null);
    this.userToDelete.set(user);
  }

  closeDeleteModal() {
    if (this.isDeleting()) {
      return;
    }

    this.userToDelete.set(null);
    this.deleteError.set(null);
  }

  confirmDelete() {
    const user = this.userToDelete();

    if (!user || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.usersService.deleteUsers([user.id]).subscribe({
      next: () => {
        if (this.usersService.selectedUserId() === user.id) {
          this.usersService.newUser();
        }

        this.usersService.usersResource.reload();
        this.isDeleting.set(false);
        this.userToDelete.set(null);
      },

      error: () => {
        this.isDeleting.set(false);
        this.deleteError.set(
          'Could not delete the user. Please try again.'
        );
      },
    });
  }
}
