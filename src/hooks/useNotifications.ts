import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: Date;
  read: boolean;
}

export interface NotificationPreferences {
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  tasks: boolean;
  milestones: boolean;
  budgets: boolean;
  invoices: boolean;
  deliveryNotes: boolean;
  risks: boolean;
  emailAddress: string;
}

const NOTIFICATIONS_PER_PAGE = 20;
const STORAGE_DEBOUNCE_MS = 1000;

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const loadedNotificationsRef = useRef(new Set<string>());
  const pendingUpdatesRef = useRef<Set<string>>(new Set());
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized storage operations with deduplication
  const saveNotificationsToStorage = useCallback(
    debounce((updatedNotifications: Notification[]) => {
      try {
        // Deduplicate notifications by title and keep only the most recent
        const uniqueNotifications = Array.from(
          new Map(
            updatedNotifications
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(n => [n.title, n])
          ).values()
        );
        const serializedNotifications = JSON.stringify(uniqueNotifications);
        localStorage.setItem('notifications', serializedNotifications);
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    }, STORAGE_DEBOUNCE_MS),
    []
  );

  // Clean and deduplicate notifications
  const deduplicateNotifications = useCallback((notifs: Notification[]) => {
    // Sort by timestamp (newest first) and deduplicate by title
    const seen = new Set<string>();
    return notifs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter(notification => {
        if (seen.has(notification.title)) {
          return false;
        }
        seen.add(notification.title);
        return true;
      });
  }, []);

  // Load notifications with deduplication
  const loadNotificationsFromStorage = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (!storedNotifications) {
        setHasMore(false);
        setNotifications([]);
        return;
      }

      let allNotifications: Notification[] = JSON.parse(storedNotifications);
      
      // Deduplicate notifications
      allNotifications = deduplicateNotifications(allNotifications);
      
      // Save deduplicated notifications back to storage
      saveNotificationsToStorage(allNotifications);
      
      // Calculate pagination
      const start = 0;
      const end = allNotifications.length;
      setNotifications(allNotifications);
      setHasMore(false); // Since we're loading all at once
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [loading, deduplicateNotifications, saveNotificationsToStorage]);

  // Initialize notifications
  useEffect(() => {
    loadNotificationsFromStorage();
  }, [loadNotificationsFromStorage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      loadedNotificationsRef.current.clear();
    };
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, [saveNotificationsToStorage]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({
        ...notification,
        read: true
      }));
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, [saveNotificationsToStorage]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => {
      // Check if a similar notification already exists (by title)
      const existingNotification = prev.find(n => n.title === newNotification.title);
      if (existingNotification) {
        // Update existing notification's timestamp and message if needed
        const updated = prev.map(n => 
          n.title === newNotification.title 
            ? { ...newNotification, id: n.id } 
            : n
        );
        const deduplicated = deduplicateNotifications(updated);
        saveNotificationsToStorage(deduplicated);
        return deduplicated;
      }

      // Add new notification
      const updated = [newNotification, ...prev];
      const deduplicated = deduplicateNotifications(updated);
      saveNotificationsToStorage(deduplicated);
      return deduplicated;
    });
  }, [saveNotificationsToStorage, deduplicateNotifications]);

  return {
    notifications,
    loading,
    hasMore: false, // Since we're loading all at once
    loadMore: () => {}, // Empty function since we load all at once
    markAsRead,
    markAllAsRead,
    addNotification,
  };
};

// Export both as default and named export
export { useNotifications };
export default useNotifications;
