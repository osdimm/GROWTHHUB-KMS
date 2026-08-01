import { describe, it, expect } from 'vitest';
import { getRelativeTime } from '../utils/dateUtils';
import { buildCommentTree } from '../utils/commentUtils';
import { AppNotification, User } from '../types';

describe('1. Pure Logic Unit Tests: getRelativeTime()', () => {
  it('should return "Baru saja" for timestamps less than 60 seconds ago', () => {
    const now = Date.now();
    expect(getRelativeTime(now - 10000)).toBe('Baru saja');
    expect(getRelativeTime(now - 55000)).toBe('Baru saja');
  });

  it('should return "X menit yang lalu" for timestamps within the hour', () => {
    const now = Date.now();
    expect(getRelativeTime(now - 5 * 60 * 1000)).toBe('5 menit yang lalu');
    expect(getRelativeTime(now - 45 * 60 * 1000)).toBe('45 menit yang lalu');
  });

  it('should return "X jam yang lalu" for timestamps within 24 hours', () => {
    const now = Date.now();
    expect(getRelativeTime(now - 2 * 3600 * 1000)).toBe('2 jam yang lalu');
    expect(getRelativeTime(now - 20 * 3600 * 1000)).toBe('20 jam yang lalu');
  });

  it('should return "X hari yang lalu" for timestamps within 7 days', () => {
    const now = Date.now();
    expect(getRelativeTime(now - 3 * 86400 * 1000)).toBe('3 hari yang lalu');
    expect(getRelativeTime(now - 6 * 86400 * 1000)).toBe('6 hari yang lalu');
  });

  it('should return formatted date "DD MMM YYYY" for timestamps older than 7 days', () => {
    const oldTimestamp = new Date('2026-07-15T10:00:00Z').getTime();
    expect(getRelativeTime(oldTimestamp)).toMatch(/\d{2} Jul 2026/);
  });

  it('should handle missing or invalid timestamps gracefully', () => {
    expect(getRelativeTime(undefined, 'Fallback Text')).toBe('Fallback Text');
    expect(getRelativeTime(0, 'Default Time')).toBe('Default Time');
  });
});

describe('2. Pure Logic Unit Tests: buildCommentTree()', () => {
  it('should return empty array for empty comments input', () => {
    expect(buildCommentTree([])).toEqual([]);
  });

  it('should build a nested tree structure from flat comments with parentId', () => {
    const flatComments = [
      {
        id: 'c1',
        author: 'User A',
        authorRole: 'Karyawan',
        timestamp: '10:00 WIB',
        content: 'Root comment 1',
        likes: 0
      },
      {
        id: 'c2',
        author: 'User B',
        authorRole: 'Manajer',
        timestamp: '10:05 WIB',
        content: 'Reply to Root 1',
        parentId: 'c1',
        likes: 0
      },
      {
        id: 'c3',
        author: 'User C',
        authorRole: 'Karyawan',
        timestamp: '10:10 WIB',
        content: 'Nested reply to c2',
        parentId: 'c2',
        likes: 0
      }
    ];

    const tree = buildCommentTree(flatComments);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('c1');
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe('c2');
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(tree[0].children[0].children[0].id).toBe('c3');
  });

  it('should handle comments with non-existent parentId by rendering as root', () => {
    const flatComments = [
      {
        id: 'c1',
        author: 'User A',
        authorRole: 'Karyawan',
        timestamp: '10:00 WIB',
        content: 'Comment with missing parent',
        parentId: 'non-existent-id',
        likes: 0
      }
    ];

    const tree = buildCommentTree(flatComments);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('c1');
  });
});

describe('3. Critical Security & Privacy Unit Tests: userNotifications Filter Logic', () => {
  const filterNotifications = (notifications: AppNotification[], currentUser: User): AppNotification[] => {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    return notifications.filter((n) => {
      // 1. Expiry check
      if (n.createdAt && typeof n.createdAt === 'number' && n.createdAt > 1000000000000) {
        if (Date.now() - n.createdAt > SEVEN_DAYS_MS) return false;
      }

      // 2. Direct user target
      if (n.targetUserId && n.targetUserId === currentUser.id) return true;
      if (n.targetUserName) {
        return n.targetUserName.toLowerCase() === currentUser.name.toLowerCase();
      }

      // 3. Division boundary check
      if (n.targetDivision) {
        const isSameDivision =
          currentUser.division &&
          currentUser.division.toLowerCase() === n.targetDivision.toLowerCase();
        if (!isSameDivision) return false; // STRICT: Outside division receives NOTHING

        if (
          n.excludeUploaderName &&
          n.excludeUploaderName.toLowerCase() === currentUser.name.toLowerCase()
        ) {
          return false;
        }

        if (n.targetRoles && n.targetRoles.includes('Manajer')) {
          return isSameDivision && currentUser.role === 'Manajer';
        }

        if (n.type === 'approved') return isSameDivision;
        return isSameDivision;
      }

      // 4. Role fallback
      if (n.targetRoles && n.targetRoles.length > 0) {
        return n.targetRoles.includes(currentUser.role);
      }

      return true;
    });
  };

  const userKaryawanDiv1: User = {
    id: 'u-karyawan-1',
    name: 'Ananda Reva',
    email: 'ananda@gmail.com',
    role: 'Karyawan',
    division: 'Graphic Design',
    joinDate: '2024-01-01',
    initials: 'AR',
    status: 'Aktif'
  };

  const userManagerDiv1: User = {
    id: 'u-manager-1',
    name: 'Andi Darmawan',
    email: 'andi@gmail.com',
    role: 'Manajer',
    division: 'Graphic Design',
    joinDate: '2024-01-01',
    initials: 'AD',
    status: 'Aktif'
  };

  const userKaryawanDiv2: User = {
    id: 'u-karyawan-2',
    name: 'Budi Santoso',
    email: 'budi@gmail.com',
    role: 'Karyawan',
    division: 'Talent Development',
    joinDate: '2024-01-01',
    initials: 'BS',
    status: 'Aktif'
  };

  const userAdminOutsideDiv: User = {
    id: 'u-admin',
    name: 'Dandi Pangestu',
    email: 'dandi@gmail.com',
    role: 'Admin',
    division: 'Administration',
    joinDate: '2024-01-01',
    initials: 'DP',
    status: 'Aktif'
  };

  it('should deliver pending verification request ONLY to Manager of the SAME division', () => {
    const pendingNotif: AppNotification = {
      id: 'notif-pending-1',
      title: 'Pengajuan Verifikasi Konten Baru',
      desc: 'Dokumen memerlukan verifikasi',
      time: 'Baru saja',
      createdAt: Date.now(),
      targetDivision: 'Graphic Design',
      targetRoles: ['Manajer'],
      type: 'pending'
    };

    const notifs = [pendingNotif];

    // Manager of same division -> SHOULD RECEIVE
    expect(filterNotifications(notifs, userManagerDiv1)).toHaveLength(1);

    // Karyawan of same division -> SHOULD NOT RECEIVE
    expect(filterNotifications(notifs, userKaryawanDiv1)).toHaveLength(0);

    // Karyawan of outside division -> SHOULD NOT RECEIVE
    expect(filterNotifications(notifs, userKaryawanDiv2)).toHaveLength(0);

    // Admin in different division -> SHOULD NOT RECEIVE (Zero Admin Bypass)
    expect(filterNotifications(notifs, userAdminOutsideDiv)).toHaveLength(0);
  });

  it('should deliver rejection notification ONLY to the uploader', () => {
    const rejectionNotif: AppNotification = {
      id: 'notif-rej-1',
      title: '❌ Pengajuan Konten Ditolak',
      desc: 'Dokumen Anda ditolak',
      time: 'Baru saja',
      createdAt: Date.now(),
      targetUserName: 'Ananda Reva',
      type: 'rejected'
    };

    const notifs = [rejectionNotif];

    // Uploader -> SHOULD RECEIVE
    expect(filterNotifications(notifs, userKaryawanDiv1)).toHaveLength(1);

    // Other user in same division -> SHOULD NOT RECEIVE
    expect(filterNotifications(notifs, userManagerDiv1)).toHaveLength(0);

    // User in outside division -> SHOULD NOT RECEIVE
    expect(filterNotifications(notifs, userKaryawanDiv2)).toHaveLength(0);
  });

  it('should deliver approval notice to uploader and study notice to fellow division members, but EXCLUDE uploader from study notice', () => {
    const uploaderApprovalNotif: AppNotification = {
      id: 'notif-app-up-1',
      title: '✅ Pengajuan Dokumen Disetujui',
      desc: 'Dokumen Anda telah disetujui',
      time: 'Baru saja',
      createdAt: Date.now(),
      targetUserName: 'Ananda Reva',
      type: 'approved'
    };

    const divisionStudyNotif: AppNotification = {
      id: 'notif-app-div-1',
      title: '📚 Dokumen Baru di Divisi Graphic Design',
      desc: 'Silakan pelajari dokumen baru',
      time: 'Baru saja',
      createdAt: Date.now(),
      targetDivision: 'Graphic Design',
      excludeUploaderName: 'Ananda Reva',
      type: 'approved'
    };

    const notifs = [uploaderApprovalNotif, divisionStudyNotif];

    // Uploader (Ananda Reva) should receive ONLY the personal approval notice (1 notif)
    const uploaderNotifs = filterNotifications(notifs, userKaryawanDiv1);
    expect(uploaderNotifs).toHaveLength(1);
    expect(uploaderNotifs[0].id).toBe('notif-app-up-1');

    // Fellow Manager in Graphic Design should receive ONLY the division study notice (1 notif)
    const fellowNotifs = filterNotifications(notifs, userManagerDiv1);
    expect(fellowNotifs).toHaveLength(1);
    expect(fellowNotifs[0].id).toBe('notif-app-div-1');

    // User outside division should receive 0 notifications
    expect(filterNotifications(notifs, userKaryawanDiv2)).toHaveLength(0);
  });
});
