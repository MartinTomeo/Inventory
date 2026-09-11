import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ROLE_ACCESS } from '../../../auth/guards/role.guard';
import { UserNamePipe } from '../../utils/user-name.pipe';

@Component({
  selector: 'top-menu',
  imports: [RouterLink, RouterLinkActive, UserNamePipe],
  templateUrl: './top-menu.html',
})
export class TopMenu {
  protected authService = inject(AuthService);
  private router = inject(Router);
  protected readonly roleAccess = ROLE_ACCESS;

  protected hasAnyRole(allowedRoles: readonly number[]): boolean {
    const role = this.authService.currentUser()?.role;
    return role !== undefined && allowedRoles.includes(role);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
}
