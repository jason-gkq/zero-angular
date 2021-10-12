import { Component } from '@angular/core';
import { UserService } from '../../../core/user/user.service';

@Component({
   template: ''
})
export class UserLogoutComponent {
    constructor(
        private user: UserService
    ) {
        user.logout();
    }
}
