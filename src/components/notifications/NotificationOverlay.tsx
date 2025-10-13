import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Archive,
  Check,
  CheckCheck,
  Inbox,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";
import { useCommunity } from "@/hooks/useCommunity";
import type { Notification } from "@/types/notifications";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "@/assets/habifyy-logo.png";

interface NotificationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    loading,
    markAllAsRead,
    markAsRead,
    archiveNotification,
    unarchiveNotification,
    respondToFriendRequestNotification,
  } = useNotifications();
  const { refetch } = useCommunity();
  const [activeTab, setActiveTab] = useState<"inbox" | "archived">("inbox");
  const isMobile = useIsMobile();

  const handleFriendRequestAction = async (
    notificationId: string,
    action: 'accept' | 'decline' | 'block'
  ) => {
    try {
      await respondToFriendRequestNotification(notificationId, action);
      await refetch.friendRequests?.();
      if (action === 'accept') {
        await refetch.friends?.();
      }
    } catch {
      // errors surfaced via hook toast; no-op here
    }
  };

  const { inboxNotifications, archivedNotifications } = useMemo(() => {
    const inbox: Notification[] = [];
    const archived: Notification[] = [];

    notifications.forEach((notification) => {
      if (notification.is_archived) {
        archived.push(notification);
      } else {
        inbox.push(notification);
      }
    });

    return { inboxNotifications: inbox, archivedNotifications: archived };
  }, [notifications]);

  if (!isOpen) return null;

  const tabs = (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
      <TabsList
        className={`${
          isMobile ? "mx-4" : "mx-4 sm:mx-6"
        } mt-4 grid grid-cols-2 h-10 bg-muted/40`}
      >
        <TabsTrigger value="inbox" className="gap-2 text-sm">
          Inbox
          {inboxNotifications.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-0">
              {inboxNotifications.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="archived" className="gap-2 text-sm">
          Archived
          {archivedNotifications.length > 0 && (
            <Badge variant="outline" className="text-xs px-2 py-0">
              {archivedNotifications.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inbox" className="mt-0">
      <NotificationList
        notifications={inboxNotifications}
        loading={loading}
        emptyLabel="No notifications yet"
        onMarkRead={markAsRead}
        onArchive={archiveNotification}
        onFriendRequestAction={handleFriendRequestAction}
        className={
          isMobile
            ? "h-full px-4 pb-24"
            : "max-h-[60vh] px-4 sm:px-6 pb-6"
        }
        />
      </TabsContent>
      <TabsContent value="archived" className="mt-0">
        <NotificationList
        notifications={archivedNotifications}
        loading={loading}
        emptyLabel="No archived notifications"
        onUnarchive={unarchiveNotification}
        onFriendRequestAction={handleFriendRequestAction}
        className={
          isMobile
            ? "h-full px-4 pb-24"
            : "max-h-[60vh] px-4 sm:px-6 pb-6"
          }
        />
      </TabsContent>
    </Tabs>
  );

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex justify-center"
      style={{
        background:
          "linear-gradient(to bottom, hsl(0 0% 100% / 1) 0%, hsl(0 0% 100% / 0.98) 35%, hsl(0 0% 100% / 0.92) 55%, hsl(0 0% 100% / 0.7) 75%, hsl(0 0% 100% / 0.35) 90%, hsl(0 0% 100% / 0) 100%)",
      }}
      role="dialog"
      aria-modal="true"
    >
      {isMobile ? (
        <div className="pointer-events-none w-full px-4">
          <div className="pointer-events-auto mt-4 rounded-3xl border border-border/40 bg-white/95 backdrop-blur-sm shadow-strong flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-4 py-4 border-b border-border/40 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2"
                aria-label="Back to home"
              >
                <img src={logo} alt="Habifyy" className="h-8 w-8 rounded-xl" />
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={onClose}
                aria-label="Close notifications"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <Inbox className="w-4 h-4" />
                    Notifications
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={markAllAsRead}
                    disabled={loading}
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Mark all read
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden pb-4">
                {tabs}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pointer-events-auto w-full px-3 sm:px-6">
          <Card className="mx-auto mt-6 sm:mt-10 w-full max-w-3xl border border-border/40 shadow-strong bg-white/95 backdrop-blur-sm">
            <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border/60">
              <div className="flex items-center gap-2 font-semibold text-base sm:text-lg">
                <Inbox className="w-4 h-4" />
                Notifications
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={markAllAsRead}
                  disabled={loading}
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </header>
            {tabs}
          </Card>
        </div>
      )}
    </div>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  emptyLabel: string;
  className?: string;
  onArchive?: (id: string) => Promise<void> | void;
  onUnarchive?: (id: string) => Promise<void> | void;
  onMarkRead?: (id: string) => Promise<void> | void;
  onFriendRequestAction?: (id: string, action: 'accept' | 'decline' | 'block') => Promise<void> | void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  emptyLabel,
  className,
  onArchive,
  onUnarchive,
  onMarkRead,
  onFriendRequestAction,
}) => {
  return (
    <ScrollArea className={className}>
      {loading ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
          <Archive className="w-6 h-6 mb-3 opacity-60" />
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onArchive={onArchive}
              onUnarchive={onUnarchive}
              onMarkRead={onMarkRead}
              onFriendRequestAction={onFriendRequestAction}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
};

interface NotificationCardProps {
  notification: Notification;
  onArchive?: (id: string) => Promise<void> | void;
  onUnarchive?: (id: string) => Promise<void> | void;
  onMarkRead?: (id: string) => Promise<void> | void;
  onFriendRequestAction?: (id: string, action: 'accept' | 'decline' | 'block') => Promise<void> | void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onArchive,
  onUnarchive,
  onMarkRead,
  onFriendRequestAction,
}) => {
  const timestamp = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });
  const isFriendRequest = notification.notification_type === 'friend_request_received';

  return (
    <div className="rounded-2xl border border-border/40 bg-white/90 backdrop-blur-sm shadow-soft p-4 transition hover:shadow-medium">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              {notification.title}
            </span>
            {!notification.is_read && (
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {notification.message}
          </p>
          {isFriendRequest && onFriendRequestAction && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                size="sm"
                onClick={() => void onFriendRequestAction(notification.id, 'accept')}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void onFriendRequestAction(notification.id, 'decline')}
              >
                Decline
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => void onFriendRequestAction(notification.id, 'block')}
              >
                Block
              </Button>
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{timestamp}</span>
            <span className="uppercase tracking-wide text-[10px] bg-muted/60 px-1.5 py-0.5 rounded-full">
              {notification.priority}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {!notification.is_read && !notification.is_archived && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => void onMarkRead?.(notification.id)}
              aria-label="Mark notification as read"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          {notification.is_archived ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => void onUnarchive?.(notification.id)}
              aria-label="Move notification to inbox"
            >
              <Inbox className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => void onArchive?.(notification.id)}
              aria-label="Archive notification"
            >
              <Archive className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
