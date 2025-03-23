import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'notificationIcon'
})
export class NotificationIconPipe implements PipeTransform {

  transform(notificationType: string): string {
    switch(notificationType) {
      case 'NEW_CHAT':
        return 'chat';
      case 'LESSON_REQUEST':
        return 'event';
      case 'LESSON_CANCEL':
        return 'cancel';
      case 'PAYMENT_OVERDUE':
        return 'payment';
      case 'PAYMENT_MADE':
        return 'check_circle';
      case 'REQUEST_ACCEPTED':
        return 'thumb_up';
      case 'REQUEST_REJECTED':
        return 'thumb_down';
      default:
        return 'notifications';
    }
  }

}

