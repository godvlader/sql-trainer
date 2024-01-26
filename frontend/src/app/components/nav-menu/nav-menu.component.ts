import { Component, Renderer2 } from '@angular/core';
import { User, Role } from '../../models/user';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-nav-menu',
    templateUrl: './nav-menu.component.html',
    styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
    isExpanded = false;
    isDarkMode = true;

    constructor(
        private router: Router,
        public authenticationService: AuthenticationService,
        private renderer: Renderer2,
        
    ) { 
        this.initializeDarkMode();
    }

    initializeDarkMode() {
        const darkModeFromStorage = localStorage.getItem('isDarkMode');
        this.isDarkMode = darkModeFromStorage === 'true';
        this.updateDarkMode();
    }

    updateDarkMode() {
        if (this.isDarkMode) {
            this.renderer.addClass(document.body, 'dark-mode');
        } else {
            this.renderer.removeClass(document.body, 'dark-mode');
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('isDarkMode', this.isDarkMode.toString());
        this.updateDarkMode();
    }

    getHomeRoute(): string {
        const currentUser = this.authenticationService.currentUser!; // Implement this method in AuthService
        if (!currentUser) {
          return '/';
        }
        if (currentUser.role === Role.Admin || currentUser.role === Role.Teacher) {
          return '/teacher';
        } else if (currentUser.role === Role.Student) {
          return '/quizzes';
        }
        return '/';
      }

    collapse() {
        this.isExpanded = false;
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
    }

    get currentUser() {
        return this.authenticationService.currentUser;
    }

    get isAdmin() {
        return this.currentUser && this.currentUser.role === Role.Admin;
    }

    get isTeacher(){
        return this.currentUser && this.currentUser.role === Role.Teacher;
    }

    get isStudent(){
        return this.currentUser && this.currentUser.role === Role.Student;
    }
      
    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }
}
