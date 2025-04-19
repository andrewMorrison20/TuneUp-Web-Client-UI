import { NotificationLinkPipe } from './notification-link.pipe';

describe('NotificationLinkPipe', () => {
  let pipe: NotificationLinkPipe;

  beforeEach(() => {
    pipe = new NotificationLinkPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return chat link for NEW_CHAT', () => {
    expect(pipe.transform('NEW_CHAT')).toBe('/user-dashboard/chats');
  });

  it('should return tuition link for LESSON_REQUEST', () => {
    expect(pipe.transform('LESSON_REQUEST')).toBe('/user-dashboard/my-tuitions');
  });

  it('should return tuition link for LESSON_CANCEL', () => {
    expect(pipe.transform('LESSON_CANCEL')).toBe('/user-dashboard/my-tuitions');
  });

  it('should return payments link for PAYMENT_OVERDUE', () => {
    expect(pipe.transform('PAYMENT_OVERDUE')).toBe('/user-dashboard/payments');
  });

  it('should return payments link for PAYMENT_MADE', () => {
    expect(pipe.transform('PAYMENT_MADE')).toBe('/user-dashboard/payments');
  });

  it('should return tuition link for REQUEST_ACCEPTED', () => {
    expect(pipe.transform('REQUEST_ACCEPTED')).toBe('/user-dashboard/my-tuitions');
  });

  it('should return tuition link for REQUEST_REJECTED', () => {
    expect(pipe.transform('REQUEST_REJECTED')).toBe('/user-dashboard/my-tuitions');
  });

  it('should return default dashboard link for unknown type', () => {
    expect(pipe.transform('UNKNOWN')).toBe('/user-dashboard');
  });

  it('should return default dashboard link for null/undefined', () => {
    expect(pipe.transform(undefined as any)).toBe('/user-dashboard');
    expect(pipe.transform(null as any)).toBe('/user-dashboard');
  });
});
