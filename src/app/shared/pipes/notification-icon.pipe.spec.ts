import { NotificationIconPipe } from './notification-icon.pipe';

describe('NotificationIconPipe', () => {
  let pipe: NotificationIconPipe;

  beforeEach(() => {
    pipe = new NotificationIconPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "chat" for NEW_CHAT', () => {
    expect(pipe.transform('NEW_CHAT')).toBe('chat');
  });

  it('should return "event" for LESSON_REQUEST', () => {
    expect(pipe.transform('LESSON_REQUEST')).toBe('event');
  });

  it('should return "cancel" for LESSON_CANCEL', () => {
    expect(pipe.transform('LESSON_CANCEL')).toBe('cancel');
  });

  it('should return "payment" for PAYMENT_OVERDUE', () => {
    expect(pipe.transform('PAYMENT_OVERDUE')).toBe('payment');
  });

  it('should return "check_circle" for PAYMENT_MADE', () => {
    expect(pipe.transform('PAYMENT_MADE')).toBe('check_circle');
  });

  it('should return "thumb_up" for REQUEST_ACCEPTED', () => {
    expect(pipe.transform('REQUEST_ACCEPTED')).toBe('thumb_up');
  });

  it('should return "thumb_down" for REQUEST_REJECTED', () => {
    expect(pipe.transform('REQUEST_REJECTED')).toBe('thumb_down');
  });

  it('should return "notifications" for unknown type', () => {
    expect(pipe.transform('SOMETHING_ELSE')).toBe('notifications');
  });

  it('should return "notifications" for undefined input', () => {
    expect(pipe.transform(undefined as any)).toBe('notifications');
  });
});
