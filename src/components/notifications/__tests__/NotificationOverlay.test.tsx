import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Notification } from "@/types/notifications";
import { NotificationOverlay } from "../NotificationOverlay";

vi.mock("@/assets/habifyy-logo.png", () => ({ default: "logo.png" }), {
  virtual: true,
});

vi.mock("@/hooks/useCommunity", () => ({
  useCommunity: () => ({
    refetch: {
      friendRequests: () => Promise.resolve(),
      friends: () => Promise.resolve(),
      profile: () => Promise.resolve(),
      communityInvites: () => Promise.resolve(),
    },
  }),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock("@/hooks/useNotifications", () => {
  const buildNotification = (): Notification => ({
    id: "notification-1",
    user_id: "user-1",
    notification_type: "system_update",
    title: "System Update",
    message: "Test notification",
    action_data: null,
    priority: "medium",
    is_read: false,
    is_delivered: true,
    is_archived: false,
    scheduled_time: undefined,
    expires_at: undefined,
    friend_request_id: null,
    community_invite_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return {
    useNotifications: () => {
      const [notifications, setNotifications] = React.useState<Notification[]>([
        buildNotification(),
      ]);

      const archiveNotification = async (id: string) => {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, is_archived: true, is_read: true }
              : notification
          )
        );
        return true;
      };

      const unarchiveNotification = async (id: string) => {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, is_archived: false }
              : notification
          )
        );
        return true;
      };

      return {
        notifications,
        loading: false,
        stats: { total: 1, unread: 1, high_priority: 0 },
        fetchNotifications: async () => undefined,
        markAsRead: async () => undefined,
        markAllAsRead: async () => undefined,
        deleteNotification: async () => undefined,
        createNotification: async () => undefined,
        archiveNotification,
        unarchiveNotification,
        respondToFriendRequestNotification: async () => undefined,
        respondToCommunityInviteNotification: async () => undefined,
      };
    },
  };
});

describe("NotificationOverlay", () => {
  it("moves a notification to the archived tab after archiving", async () => {
    const user = userEvent.setup();

    render(<NotificationOverlay isOpen onClose={() => undefined} />);

    const archiveButton = screen.getByLabelText("Archive notification");
    await user.click(archiveButton);

    await waitFor(() =>
      expect(
        screen.getByRole("tab", { name: /archived/i })
      ).toHaveAttribute("data-state", "active")
    );

    expect(
      screen.getByLabelText("Move notification to inbox")
    ).toBeInTheDocument();
  });
});
