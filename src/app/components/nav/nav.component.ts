import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import { AuthenticatedUser } from '../../authentication/authenticated-user.class';
import { WebsocketService } from '../../services/websocket.service';
import {HttpClient} from "@angular/common/http";

interface Notification {
  id: number;
  type: string;
  message: string;
  read:boolean;
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
  notificationSubscription!: Subscription;
  protected readonly AuthenticatedUser = AuthenticatedUser;

  constructor(
    private router: Router,
    private websocketService: WebsocketService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (AuthenticatedUser.userLoggedIn()) {
      const userId = AuthenticatedUser.getAuthUserId();

      this.getUnreadNotifications(userId)
        .subscribe((dbNotifications: Notification[]) => {
          this.notifications = this.mergeNotifications(this.notifications, dbNotifications);
          this.updateUnreadCount();
        });

      this.notificationSubscription = this.websocketService
        .subscribeToNotifications()
        .subscribe((notification: Notification) => {
          // Merge new notifications (avoiding duplicates)
          this.notifications = this.mergeNotifications(this.notifications, [notification]);
          this.updateUnreadCount();
        });
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  toggleMenu(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    AuthenticatedUser.deleteObj();
    this.router.navigate(['/login']);
  }

  markNotificationAsRead(notification: Notification): void {
    if (!notification.read) {
      this.updateNotificationAsRead(notification.id).subscribe(() => {
        // Update local state for this notification
        notification.read = true;
        this.updateUnreadCount();
      });
    }
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  // Merge notifications from different sources, filtering duplicates by unique id.
  mergeNotifications(existing: Notification[], incoming: Notification[]): Notification[] {
    const mergedMap = new Map<number, Notification>();
    existing.forEach(n => mergedMap.set(n.id, n));
    incoming.forEach(n => mergedMap.set(n.id, n));
    // Sort by id descending (or sort by timestamp if available)
    return Array.from(mergedMap.values()).sort((a, b) => b.id - a.id);
  }


getUnreadNotifications(userId: string | number): Observable<Notification[]> {
    console.log('fetching db notifications')
    return this.http.get<Notification[]>(`http://localhost:8080/api/notifications/unread/${userId}`);
  }

  updateNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.post(`http://localhost:8080/api/notifications/${notificationId}/mark-read`, {});
  }

}
