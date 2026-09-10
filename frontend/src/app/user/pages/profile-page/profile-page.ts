import { Component, inject } from '@angular/core';
import { ProfileService } from '../../services/profile.service'

@Component({
  selector: 'app-profile-page',
  imports: [],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  profileService = inject(ProfileService);
}
