/**
 * Socket Emitter Unit Tests
 *
 * Tests for socket event emission utilities.
 */

import { jest } from '@jest/globals';

// Mock socketInstance before importing
const mockIO = {
  to: jest.fn(() => mockIO),
  emit: jest.fn(),
};

jest.unstable_mockModule('../../utils/socketInstance.js', () => ({
  getIO: jest.fn(() => mockIO),
  initializeSocket: jest.fn(),
}));

// Import after mocking
const {
  emitToRooms,
  emitTaskEvent,
  emitUserEvent,
  emitNotificationEvent,
  emitActivityEvent,
  emitCommentEvent,
} = await import('../../utils/socketEmitter.js');

describe('Socket Emitter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('emitToRooms', () => {
    test('should emit event to all specified rooms', () => {
      const rooms = ['room1', 'room2', 'room3'];
      const event = 'test:event';
      const data = { message: 'Hello' };

      emitToRooms(rooms, event, data);

      expect(mockIO.to).toHaveBeenCalledTimes(3);
      expect(mockIO.emit).toHaveBeenCalledTimes(3);
      rooms.forEach((room) => {
        expect(mockIO.to).toHaveBeenCalledWith(room);
      });
    });
  });

  describe('emitTaskEvent', () => {
    test('should emit task event to department and organization rooms', () => {
      const task = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Task',
        department: 'dept123',
        organization: 'org456',
      };

      emitTaskEvent(task, 'created');

      expect(mockIO.to).toHaveBeenCalledWith('department:dept123');
      expect(mockIO.to).toHaveBeenCalledWith('organization:org456');
      expect(mockIO.emit).toHaveBeenCalledWith(
        'task:created',
        expect.objectContaining({ task })
      );
    });

    test('should include additional data in event', () => {
      const task = {
        _id: '507f1f77bcf86cd799439011',
        department: 'dept123',
        organization: 'org456',
      };
      const additionalData = { changes: { status: 'Completed' } };

      emitTaskEvent(task, 'updated', additionalData);

      expect(mockIO.emit).toHaveBeenCalledWith(
        'task:updated',
        expect.objectContaining({
          task,
          changes: { status: 'Completed' },
        })
      );
    });
  });

  describe('emitUserEvent', () => {
    test('should emit user event to user, department, and organization rooms', () => {
      const user = {
        _id: 'user123',
        department: 'dept123',
        organization: 'org456',
        status: 'Online',
      };

      emitUserEvent(user, 'online');

      expect(mockIO.to).toHaveBeenCalledWith('user:user123');
      expect(mockIO.to).toHaveBeenCalledWith('department:dept123');
      expect(mockIO.to).toHaveBeenCalledWith('organization:org456');
      expect(mockIO.emit).toHaveBeenCalledWith(
        'user:online',
        expect.objectContaining({
          userId: 'user123',
          status: 'Online',
        })
      );
    });
  });

  describe('emitNotificationEvent', () => {
    test('should emit notification to user room only', () => {
      const notification = {
        _id: 'notif123',
        recipient: 'user456',
        title: 'Test Notification',
      };

      emitNotificationEvent(notification);

      expect(mockIO.to).toHaveBeenCalledWith('user:user456');
      expect(mockIO.to).toHaveBeenCalledTimes(1); // Only user room
      expect(mockIO.emit).toHaveBeenCalledWith(
        'notification:created',
        expect.objectContaining({ notification })
      );
    });
  });

  describe('emitActivityEvent', () => {
    test('should emit activity event to department and organization rooms', () => {
      const activity = {
        _id: 'activity123',
        department: 'dept123',
        organization: 'org456',
      };

      emitActivityEvent(activity, 'created');

      expect(mockIO.to).toHaveBeenCalledWith('department:dept123');
      expect(mockIO.to).toHaveBeenCalledWith('organization:org456');
      expect(mockIO.emit).toHaveBeenCalledWith(
        'activity:created',
        expect.objectContaining({ activity })
      );
    });
  });

  describe('emitCommentEvent', () => {
    test('should emit comment event to department and organization rooms', () => {
      const comment = {
        _id: 'comment123',
        department: 'dept123',
        organization: 'org456',
        content: 'Test comment',
      };

      emitCommentEvent(comment, 'created');

      expect(mockIO.to).toHaveBeenCalledWith('department:dept123');
      expect(mockIO.to).toHaveBeenCalledWith('organization:org456');
      expect(mockIO.emit).toHaveBeenCalledWith(
        'comment:created',
        expect.objectContaining({ comment })
      );
    });
  });
});
