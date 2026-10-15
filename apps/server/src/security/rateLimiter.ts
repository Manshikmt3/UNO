interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class SimpleRateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 120) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic cleanup of expired entries every 2 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.records.entries()) {
        if (now > record.resetAt) {
          this.records.delete(key);
        }
      }
    }, 120000);
  }

  public check(key: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const existing = this.records.get(key);

    if (!existing || now > existing.resetAt) {
      this.records.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }

    if (existing.count >= this.maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    existing.count++;
    return { allowed: true, remaining: this.maxRequests - existing.count };
  }
}
