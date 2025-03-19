import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';
 // assuming you have this

interface Notification {
  id: number;
  type: string;
  message: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  notifications: Notification[] = [];
  unreadCount = 0;
  private notificationSubscription!: Subscription;

  // Expose AuthenticatedUser for the template
  protected readonly AuthenticatedUser = AuthenticatedUser;

  constructor(
    private router: Router,
   // private notificationService: NotificationService // Inject your notification service
  ) {}

  ngOnInit(): void {
    // Example subscription to notification service observable
    /*this.notificationSubscription = this.notificationService.getNotifications().subscribe(
      (notification: Notification) => {
        this.notifications.unshift(notification);
        this.unreadCount++;
      }
    );
  }*/
  }
  toggleMenu(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    AuthenticatedUser.deleteObj();
    this.router.navigate(['/login']);
  }

  // Called when the user clicks the notification icon
  toggleNotificationMenu(): void {
    this.markNotificationsAsRead();
  }

  markNotificationsAsRead(): void {
    // Reset the unread count; you might also update the backend here.
    this.unreadCount = 0;
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
}
