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

  toggleNotificationMenu(): void {
    this.markNotificationsAsRead();
  }

  // Mark notifications as read in the UI and via a backend call.
  markNotificationsAsRead(): void {
    const unreadNotificationIds = this.notifications.filter(n => !n.read).map(n => n.id);
    if (unreadNotificationIds.length > 0) {
      this.markNotificationsAsRead2(unreadNotificationIds)
        .subscribe(() => {
          // Update local notifications to reflect that they are now read.
          this.notifications = this.notifications.map(n => ({ ...n, read: true }));
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

  markNotificationsAsRead2(notificationIds: number[]): Observable<any> {
    // You might need to create a corresponding backend endpoint.
    return this.http.post(`http://localhost:8080/api/notifications/mark-read-batch`, { notificationIds });
  }
}
