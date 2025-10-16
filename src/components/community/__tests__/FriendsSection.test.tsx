import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import FriendsSection from '../FriendsSection';
import type { FriendRequest } from '@/types/community';

const respondMock = vi.fn().mockResolvedValue(undefined);
const cancelMock = vi.fn().mockResolvedValue(undefined);

const incomingRequest: FriendRequest = {
  id: 'incoming-1',
  requester_id: 'user-123',
  recipient_id: 'viewer-1',
  status: 'pending',
  message: "Let's keep each other accountable!",
  responded_at: null,
  created_at: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  updated_at: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  requester: {
    id: 'profile-req',
    user_id: 'user-123',
    username: 'habitbuddy',
    display_name: 'Habit Buddy',
    avatar_url: '',
    bio: '',
    location: '',
    latitude: null,
    longitude: null,
    privacy_location: false,
    privacy_profile: false,
    points: 42,
    level: 5,
    created_at: new Date('2023-12-15T00:00:00.000Z').toISOString(),
    updated_at: new Date('2023-12-15T00:00:00.000Z').toISOString(),
  },
};

const outgoingRequest: FriendRequest = {
  id: 'outgoing-1',
  requester_id: 'viewer-1',
  recipient_id: 'user-456',
  status: 'pending',
  message: null,
  responded_at: null,
  created_at: new Date('2024-01-05T00:00:00.000Z').toISOString(),
  updated_at: new Date('2024-01-05T00:00:00.000Z').toISOString(),
  recipient: {
    id: 'profile-rec',
    user_id: 'user-456',
    username: 'coachcarla',
    display_name: 'Coach Carla',
    avatar_url: '',
    bio: '',
    location: '',
    latitude: null,
    longitude: null,
    privacy_location: false,
    privacy_profile: false,
    points: 58,
    level: 6,
    created_at: new Date('2023-11-10T00:00:00.000Z').toISOString(),
    updated_at: new Date('2023-11-10T00:00:00.000Z').toISOString(),
  },
};

vi.mock('@/hooks/useCommunity', () => ({
  useCommunity: () => ({
    friends: [],
    incomingFriendRequests: [incomingRequest],
    outgoingFriendRequests: [outgoingRequest],
    sendFriendRequest: vi.fn(),
    respondToFriendRequest: respondMock,
    cancelFriendRequest: cancelMock,
    loading: false,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/components/community/FindFriendsModal', () => ({
  FindFriendsModal: () => null,
}));

describe('FriendsSection', () => {
  beforeEach(() => {
    respondMock.mockClear();
    cancelMock.mockClear();
  });

  it('handles accepting and declining incoming friend requests', async () => {
    const user = userEvent.setup();
    render(<FriendsSection />);

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    const declineButton = screen.getByRole('button', { name: /decline/i });

    await user.click(acceptButton);
    expect(respondMock).toHaveBeenCalledWith('incoming-1', 'accepted');

    await user.click(declineButton);
    expect(respondMock).toHaveBeenLastCalledWith('incoming-1', 'declined');
  });

  it('handles cancelling outgoing friend requests', async () => {
    const user = userEvent.setup();
    render(<FriendsSection />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(cancelMock).toHaveBeenCalledWith('outgoing-1');
  });

  it('expands find friends controls for discovery', () => {
    render(<FriendsSection />);

    const triggers = screen.getAllByRole('button', { name: /find friends/i });
    expect(triggers.length).toBeGreaterThan(0);
  });
});
