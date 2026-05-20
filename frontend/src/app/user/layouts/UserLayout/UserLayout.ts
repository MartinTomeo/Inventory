import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopMenu } from '../../../shared/components/top-menu/top-menu';

@Component({
  selector: 'user-layout',
  imports: [RouterOutlet, TopMenu],
  templateUrl: './UserLayout.html',
})
export class UserLayout {}
