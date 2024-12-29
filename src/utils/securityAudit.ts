import { secureStorage } from './secureStorage';

interface SecurityAuditLog {
  timestamp: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
}

class SecurityAudit {
  private readonly LOG_KEY = 'security_audit_logs';
  private readonly MAX_LOGS = 1000;

  constructor() {
    this.initializeAuditLog();
  }

  private initializeAuditLog(): void {
    if (!secureStorage.getItem(this.LOG_KEY)) {
      secureStorage.setItem(this.LOG_KEY, JSON.stringify([]));
    }
  }

  private getLogs(): SecurityAuditLog[] {
    const logs = secureStorage.getItem<string>(this.LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  }

  private saveLogs(logs: SecurityAuditLog[]): void {
    secureStorage.setItem(this.LOG_KEY, JSON.stringify(logs));
  }

  logSecurityEvent(
    event: string,
    severity: SecurityAuditLog['severity'],
    details: any
  ): void {
    const logs = this.getLogs();
    
    const newLog: SecurityAuditLog = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      details,
    };

    logs.unshift(newLog);

    // Keep only the most recent logs
    if (logs.length > this.MAX_LOGS) {
      logs.length = this.MAX_LOGS;
    }

    this.saveLogs(logs);

    // Alert on critical events
    if (severity === 'critical') {
      this.handleCriticalEvent(newLog);
    }
  }

  private handleCriticalEvent(log: SecurityAuditLog): void {
    console.error('CRITICAL SECURITY EVENT:', log);
    // Here you could add additional handling like:
    // - Sending to a monitoring service
    // - Triggering immediate user logout
    // - Sending notifications to administrators
  }

  getRecentEvents(count: number = 10): SecurityAuditLog[] {
    const logs = this.getLogs();
    return logs.slice(0, count);
  }

  getEventsByType(eventType: string): SecurityAuditLog[] {
    const logs = this.getLogs();
    return logs.filter(log => log.event === eventType);
  }

  getEventsBySeverity(severity: SecurityAuditLog['severity']): SecurityAuditLog[] {
    const logs = this.getLogs();
    return logs.filter(log => log.severity === severity);
  }

  getEventsInTimeRange(startDate: Date, endDate: Date): SecurityAuditLog[] {
    const logs = this.getLogs();
    return logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  clearLogs(): void {
    this.saveLogs([]);
  }

  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  // Security health check
  performSecurityCheck(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
  } {
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check for critical events in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCriticalEvents = this.getEventsInTimeRange(oneHourAgo, new Date())
      .filter(log => log.severity === 'critical');

    if (recentCriticalEvents.length > 0) {
      status = 'critical';
      issues.push(`${recentCriticalEvents.length} critical security events in the last hour`);
    }

    // Check for suspicious patterns
    const recentEvents = this.getRecentEvents(100);
    const failedLogins = recentEvents.filter(
      log => log.event === 'failed_login'
    ).length;

    if (failedLogins > 10) {
      status = status === 'critical' ? 'critical' : 'warning';
      issues.push(`High number of failed login attempts: ${failedLogins}`);
    }

    // Add more security checks as needed

    return {
      status,
      issues,
    };
  }
}

export const securityAudit = new SecurityAudit();
