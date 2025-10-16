// Throttle notifications - max 1 per 5 seconds per type
class NotificationManager {
  private lastNotificationTime: Map<string, number> = new Map();
  private readonly THROTTLE_MS = 5000;

  canShow(type: string): boolean {
    const lastTime = this.lastNotificationTime.get(type);
    const now = Date.now();

    if (!lastTime || now - lastTime >= this.THROTTLE_MS) {
      this.lastNotificationTime.set(type, now);
      return true;
    }
    return false;
  }

  reset(type?: string) {
    if (type) {
      this.lastNotificationTime.delete(type);
    } else {
      this.lastNotificationTime.clear();
    }
  }
}

export const notificationManager = new NotificationManager();
