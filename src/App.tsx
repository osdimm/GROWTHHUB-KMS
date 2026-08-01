import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import {
  NavigationTab,
  User,
  CategoryItem,
  KnowledgeArticle,
  HandoverDoc,
  ForumTopic,
  ForumComment,
  ActivityLog,
  PopularTopic,
  UserRole,
  PendingDoc,
  AppNotification
} from './types';
import {
  initialUsers,
  initialCategories,
  initialArticles,
  initialHandoverDocs,
  initialForumTopics,
  initialActivities,
  popularTopicsList,
  initialPendingDocs,
  initialNotifications
} from './data/mockData';

import {
  getProfilesFromSupabase,
  saveProfileToSupabase,
  deleteProfileFromSupabase,
  getCategoriesFromSupabase,
  saveCategoryToSupabase,
  deleteCategoryFromSupabase,
  getArticlesFromSupabase,
  saveArticleToSupabase,
  deleteArticleFromSupabase,
  getHandoverDocsFromSupabase,
  saveHandoverDocToSupabase,
  deleteHandoverDocFromSupabase,
  getForumTopicsFromSupabase,
  saveForumTopicToSupabase,
  saveForumCommentToSupabase,
  deleteForumTopicFromSupabase,
  deleteForumCommentFromSupabase,
  getPendingDocsFromSupabase,
  savePendingDocToSupabase,
  getActivitiesFromSupabase,
  saveActivityToSupabase
} from './services/supabaseService';

import { Sidebar } from './components/Sidebar';
import { Header, ThemeMode } from './components/Header';
import { LogoutModal } from './components/LogoutModal';

// Views
import { LoginPage } from './components/views/LoginPage';
import { DashboardView } from './components/views/DashboardView';
import { DataPenggunaView } from './components/views/DataPenggunaView';
import { HakAksesView } from './components/views/HakAksesView';
import { KnowledgeBaseView } from './components/views/KnowledgeBaseView';
import { VerifikasiKontenView } from './components/views/VerifikasiKontenView';
import { HandoverRotasiView } from './components/views/HandoverRotasiView';
import { ForumDiskusiView } from './components/views/ForumDiskusiView';
import { LaporanPenggunaanView } from './components/views/LaporanPenggunaanView';
import { ProfilPenggunaView } from './components/views/ProfilPenggunaView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('kms_is_logged_in') === 'true';
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>(() => {
    const savedLoggedIn = sessionStorage.getItem('kms_is_logged_in') === 'true';
    if (!savedLoggedIn) return 'login';
    const savedTab = localStorage.getItem('kms_active_tab');
    return (savedTab as NavigationTab) || 'dashboard';
  });

  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Active Role & Current User State (Persisted in localStorage)
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('kms_active_role');
    return (saved as UserRole) || 'Admin';
  });
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('kms_current_user_id') || 'u-admin';
  });
  const [showForcePasswordModal, setShowForcePasswordModal] = useState<boolean>(true);

  // Theme Mode State (light | dark | system)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('kms_theme');
    return (saved as ThemeMode) || 'system';
  });

  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      const root = document.documentElement;
      let isDark = false;
      if (mode === 'dark') {
        isDark = true;
      } else if (mode === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('kms_theme', mode);
    };

    applyTheme(themeMode);

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  // Save session state to sessionStorage & localStorage
  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem('kms_is_logged_in', 'true');
      localStorage.setItem('kms_active_tab', activeTab);
    } else {
      sessionStorage.removeItem('kms_is_logged_in');
      localStorage.removeItem('kms_active_tab');
    }
  }, [isLoggedIn, activeTab]);

  useEffect(() => {
    localStorage.setItem('kms_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('kms_current_user_id', currentUserId);
  }, [currentUserId]);

  // App Centralized State (with localStorage persistence for views & downloads)
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  const [articles, setArticles] = useState<KnowledgeArticle[]>(() => {
    try {
      const saved = localStorage.getItem('kms_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading kms_articles from localStorage', e);
    }
    return [];
  });

  const [handoverDocs, setHandoverDocs] = useState<HandoverDoc[]>(() => {
    try {
      const saved = localStorage.getItem('kms_handover_docs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading kms_handover_docs from localStorage', e);
    }
    return [];
  });

  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [popularTopics] = useState<PopularTopic[]>(popularTopicsList);
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(true);

  // Sync articles & handoverDocs to localStorage
  useEffect(() => {
    if (articles && articles.length > 0) {
      localStorage.setItem('kms_articles', JSON.stringify(articles));
    }
  }, [articles]);

  useEffect(() => {
    if (handoverDocs && handoverDocs.length > 0) {
      localStorage.setItem('kms_handover_docs', JSON.stringify(handoverDocs));
    }
  }, [handoverDocs]);

  // Fetch Live Data from Supabase on Mount & Smart Merge with localStorage
  useEffect(() => {
    const loadSupabaseData = async () => {
      setIsLoadingSupabase(true);
      try {
        const [
          dbUsers,
          dbCategories,
          dbArticles,
          dbHandovers,
          dbTopics,
          dbPending,
          dbActivities
        ] = await Promise.all([
          getProfilesFromSupabase(),
          getCategoriesFromSupabase(),
          getArticlesFromSupabase(),
          getHandoverDocsFromSupabase(),
          getForumTopicsFromSupabase(),
          getPendingDocsFromSupabase(),
          getActivitiesFromSupabase()
        ]);

        if (dbUsers && dbUsers.length > 0) setUsers(dbUsers);
        if (dbCategories !== null) setCategories(dbCategories.length > 0 ? dbCategories : initialCategories);

        if (dbArticles !== null && dbArticles.length > 0) {
          setArticles((prev) => {
            const merged = dbArticles.map((dbArt) => {
              const localMatch = prev.find((p) => p.id === dbArt.id || p.title === dbArt.title);
              if (localMatch) {
                return {
                  ...dbArt,
                  views: Math.max(dbArt.views || 0, localMatch.views || 0),
                  downloads: Math.max(dbArt.downloads || 0, localMatch.downloads || 0)
                };
              }
              return dbArt;
            });
            const dbIds = new Set(dbArticles.map((a) => a.id));
            const localOnly = prev.filter((p) => !dbIds.has(p.id));
            return [...merged, ...localOnly];
          });
        }

        if (dbHandovers !== null && dbHandovers.length > 0) {
          setHandoverDocs((prev) => {
            const merged = dbHandovers.map((dbHo) => {
              const localMatch = prev.find((p) => p.id === dbHo.id || p.title === dbHo.title);
              if (localMatch) {
                return {
                  ...dbHo,
                  views: Math.max(dbHo.views || 0, localMatch.views || 0),
                  downloads: Math.max(dbHo.downloads || 0, localMatch.downloads || 0)
                };
              }
              return dbHo;
            });
            const dbIds = new Set(dbHandovers.map((h) => h.id));
            const localOnly = prev.filter((p) => !dbIds.has(p.id));
            return [...merged, ...localOnly];
          });
        }

        if (dbTopics || []) setForumTopics(dbTopics || []);
        if (dbPending || []) setPendingDocs(dbPending || []);
        if (dbActivities || []) setActivities(dbActivities || []);
      } catch (err) {
        console.error('Failed to sync with Supabase on mount:', err);
      } finally {
        setIsLoadingSupabase(false);
      }
    };
    loadSupabaseData();
  }, []);

  // Supabase Real-time Subscription for Forum Topics & Comments (Live Updates Like WhatsApp!)
  useEffect(() => {
    const handleRealtimeUpdate = async () => {
      try {
        const latestTopics = await getForumTopicsFromSupabase();
        if (latestTopics && latestTopics.length > 0) {
          setForumTopics(latestTopics);
        }
      } catch (e) {
        console.warn('Realtime fetch warning:', e);
      }
    };

    const forumChannel = supabase
      .channel('public_realtime_forum')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_topics' },
        () => {
          handleRealtimeUpdate();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_comments' },
        () => {
          handleRealtimeUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(forumChannel);
    };
  }, []);


  // Verification & Notification Handlers
  const handleRequestVerification = (newDoc: PendingDoc) => {
    setPendingDocs((prev) => [newDoc, ...prev]);
    savePendingDocToSupabase(newDoc).catch(console.error);

    // Rule 1: Notify Manager of the SAME DIVISION only
    const managerNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Pengajuan Verifikasi Konten Baru',
      desc: `${newDoc.author} mengunggah dokumen "${newDoc.title}" untuk divisi ${newDoc.category} yang memerlukan verifikasi Manajer.`,
      time: 'Baru saja',
      createdAt: Date.now(),
      author: newDoc.author,
      targetRoles: ['Manajer'],
      targetDivision: newDoc.category,
      type: 'pending',
      read: false
    };

    // Confirm upload for uploader
    const uploaderConfirmNotif: AppNotification = {
      id: `notif-up-${Date.now()}`,
      title: 'Pengajuan Dalam Tinjauan',
      desc: `Dokumen "${newDoc.title}" berhasil diunggah dan sedang menunggu verifikasi dari Manajer Divisi ${newDoc.category}.`,
      time: 'Baru saja',
      createdAt: Date.now(),
      author: newDoc.author,
      targetUserName: newDoc.author,
      type: 'info',
      read: false
    };

    setNotifications((prev) => [managerNotif, uploaderConfirmNotif, ...prev]);
  };

  const handleApproveDoc = (docId: string, note?: string) => {
    const targetDoc = pendingDocs.find((d) => d.id === docId);
    if (!targetDoc) return;

    const updatedDoc: PendingDoc = { ...targetDoc, status: 'Disetujui', note };

    setPendingDocs((prev) =>
      prev.map((d) => (d.id === docId ? updatedDoc : d))
    );
    savePendingDocToSupabase(updatedDoc).catch(console.error);

    const resolvedFileUrl = targetDoc.fileUrl || targetDoc.articleData?.fileUrl;

    const articleToAdd: KnowledgeArticle = targetDoc.articleData
      ? {
          ...targetDoc.articleData,
          fileBlob: targetDoc.articleData.fileBlob || targetDoc.fileBlob,
          fileUrl: resolvedFileUrl
        }
      : {
          id: `kb-${Date.now()}`,
          title: targetDoc.title,
          category: targetDoc.category,
          summary: targetDoc.description || 'Dokumen terverifikasi.',
          author: targetDoc.author,
          date: targetDoc.submitDate,
          fileType: targetDoc.fileName?.toLowerCase().endsWith('.pdf') ? 'PDF' : targetDoc.fileName?.toLowerCase().endsWith('.docx') ? 'DOCX' : 'LINK',
          views: 1,
          contentType: 'file',
          fileBlob: targetDoc.fileBlob,
          fileUrl: resolvedFileUrl
        };

    // ALWAYS save approved article directly to Supabase
    saveArticleToSupabase(articleToAdd).catch(console.error);

    setArticles((prev) => {
      const filtered = prev.filter((a) => a.id !== articleToAdd.id && a.title !== articleToAdd.title);
      return [articleToAdd, ...filtered];
    });

    setCategories((prev) =>
      prev.map((c) => {
        if (c.name === targetDoc.category) {
          const updatedCat = { ...c, contentCount: c.contentCount + 1 };
          saveCategoryToSupabase(updatedCat).catch(console.error);
          return updatedCat;
        }
        return c;
      })
    );

    // Rule 2: Notify ALL MEMBERS in the SAME DIVISION when approved
    const divisionApprovedNotif: AppNotification = {
      id: `notif-app-${Date.now()}`,
      title: '✅ Dokumen Baru Dipublikasikan',
      desc: `Dokumen "${targetDoc.title}" yang diunggah oleh ${targetDoc.author} telah DISETUJUI oleh Manajer (${currentUser.name}) dan kini resmi diterbitkan untuk divisi ${targetDoc.category}.`,
      time: 'Baru saja',
      createdAt: Date.now(),
      author: targetDoc.author,
      targetDivision: targetDoc.category,
      type: 'approved',
      read: false
    };

    setNotifications((prev) => [divisionApprovedNotif, ...prev]);
  };

  const handleRejectDoc = (docId: string, note?: string) => {
    const targetDoc = pendingDocs.find((d) => d.id === docId);
    if (!targetDoc) return;

    const updatedDoc: PendingDoc = { ...targetDoc, status: 'Ditolak', note };

    setPendingDocs((prev) =>
      prev.map((d) => (d.id === docId ? updatedDoc : d))
    );
    savePendingDocToSupabase(updatedDoc).catch(console.error);

    // Rule 3: Notify ONLY UPLOADER when document is rejected
    const uploaderRejectionNotif: AppNotification = {
      id: `notif-rej-${Date.now()}`,
      title: '❌ Pengajuan Konten Ditolak',
      desc: `Dokumen "${targetDoc.title}" yang Anda unggah DITOLAK oleh Manajer (${currentUser.name}).${note ? ` Catatan: "${note}"` : ''}`,
      time: 'Baru saja',
      createdAt: Date.now(),
      author: targetDoc.author,
      targetUserName: targetDoc.author,
      type: 'rejected',
      read: false
    };

    setNotifications((prev) => [uploaderRejectionNotif, ...prev]);
  };

  // Get active currentUser
  const currentUser = users.find((u) => u.id === currentUserId) || users.find((u) => u.role === activeRole) || {
    id: activeRole === 'Admin' ? 'u-admin' : activeRole === 'Manajer' ? 'u-manajer' : activeRole === 'Karyawan' ? 'u-karyawan' : 'u-associate',
    name: activeRole === 'Admin' ? 'Dandi Pangestu' : activeRole === 'Manajer' ? 'Andi Darmawan' : activeRole === 'Karyawan' ? 'Ananda Reva' : 'Rahmawati',
    email: activeRole === 'Admin' ? 'dandi.p@gmail.com' : activeRole === 'Manajer' ? 'andi.darmawan@gmail.com' : activeRole === 'Karyawan' ? 'ananda.reva@gmail.com' : 'rahmawati@gmail.com',
    role: activeRole,
    division: activeRole === 'Admin' ? 'Administration' : activeRole === 'Manajer' ? 'Talent Development' : activeRole === 'Karyawan' ? 'Graphic Design' : 'Public Relation',
    position: activeRole,
    initials: activeRole === 'Admin' ? 'DP' : activeRole === 'Manajer' ? 'AD' : activeRole === 'Karyawan' ? 'AR' : 'RW',
    status: 'Aktif' as const
  };

  // Filter notifications relevant to current active user (with 7-day auto-expiry filter)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const userNotifications = notifications.filter((n) => {
    // 7-day auto-expiry check
    const createdTime = n.createdAt || parseInt(n.id.replace(/\D/g, ''), 10) || Date.now();
    if (Date.now() - createdTime > SEVEN_DAYS_MS) {
      return false;
    }

    // 1. Direct user notification (e.g. Rejection for uploader only, or uploader confirmation)
    if (n.targetUserId && n.targetUserId === currentUser.id) return true;
    if (n.targetUserName && n.targetUserName.toLowerCase() === currentUser.name.toLowerCase()) return true;

    // 2. Division-specific notifications
    if (n.targetDivision) {
      const isSameDivision = currentUser.division && currentUser.division.toLowerCase() === n.targetDivision.toLowerCase();

      // Upload verification: ONLY Manager of the SAME division (or Admin)
      if (n.targetRoles && n.targetRoles.includes('Manajer')) {
        return isSameDivision && (currentUser.role === 'Manajer' || currentUser.role === 'Admin');
      }

      // Approved doc notification: ALL MEMBERS in the SAME division (or Admin)
      if (n.type === 'approved') {
        return isSameDivision || currentUser.role === 'Admin';
      }

      return isSameDivision;
    }

    // 3. Role-based notification fallback
    if (n.targetRoles && n.targetRoles.length > 0) {
      return n.targetRoles.includes(currentUser.role);
    }

    return false;
  });

  const handleClearNotifications = () => {
    const userNotifIds = new Set(userNotifications.map((u) => u.id));
    setNotifications((prev) => prev.map((n) => userNotifIds.has(n.id) ? { ...n, read: true } : n));
  };

  const handleUpdateCurrentUser = (updated: Partial<User>) => {
    const newUser = { ...currentUser, ...updated };
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? newUser : u))
    );
    saveProfileToSupabase(newUser).catch(console.error);
  };

  const handleSwitchUserRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    const targetUser = users.find((u) => u.role === newRole);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
      setShowForcePasswordModal(!!targetUser.mustChangePassword);
    } else {
      setShowForcePasswordModal(false);
    }
    if (newRole === 'Karyawan' || newRole === 'Associate') {
      if (activeTab === 'dashboard' || activeTab === 'data-pengguna' || activeTab === 'hak-akses' || activeTab === 'laporan-penggunaan' || activeTab === 'verifikasi-konten') {
        setActiveTab('knowledge-base');
      }
    } else if (newRole === 'Manajer') {
      if (activeTab === 'dashboard' || activeTab === 'data-pengguna' || activeTab === 'hak-akses' || activeTab === 'laporan-penggunaan') {
        setActiveTab('knowledge-base');
      }
    } else if (newRole === 'Admin') {
      if (activeTab === 'verifikasi-konten') {
        setActiveTab('dashboard');
      }
    }
  };

  // User Handlers
  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    saveProfileToSupabase(newUser).catch(console.error);
  };

  const handleUpdateUser = (id: string, updated: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updatedUser = { ...u, ...updated, mustChangePassword: false };
          saveProfileToSupabase(updatedUser).catch(console.error);
          return updatedUser;
        }
        return u;
      })
    );
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedUser: User = { ...u, role: newRole, mustChangePassword: false };
          saveProfileToSupabase(updatedUser).catch(console.error);
          return updatedUser;
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    deleteProfileFromSupabase(id).catch(console.error);
  };

  // Category Handlers
  const handleEditHandoverDoc = (id: string, updated: Partial<HandoverDoc>) => {
    setHandoverDocs((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, ...updated } : h));
      const target = next.find((h) => h.id === id);
      if (target) {
        saveHandoverDocToSupabase(target).catch(console.error);
      }
      return next;
    });
  };

  const handleAddCategory = (newCat: CategoryItem) => {
    setCategories((prev) => [newCat, ...prev]);
    saveCategoryToSupabase(newCat).catch(console.error);
  };

  const handleEditCategory = (id: string, updated: Partial<CategoryItem>, oldName?: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updatedCat = { ...c, ...updated };
          saveCategoryToSupabase(updatedCat).catch(console.error);
          return updatedCat;
        }
        return c;
      })
    );
    if (oldName && updated.name && oldName !== updated.name) {
      setArticles((prev) =>
        prev.map((a) => {
          if (a.category === oldName) {
            const updatedArt = { ...a, category: updated.name! };
            saveArticleToSupabase(updatedArt).catch(console.error);
            return updatedArt;
          }
          return a;
        })
      );
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    deleteCategoryFromSupabase(id).catch(console.error);
  };

  // Article Handlers
  const handleAddArticle = (newArt: KnowledgeArticle) => {
    setArticles((prev) => [newArt, ...prev]);
    saveArticleToSupabase(newArt).catch(console.error);
    // update category count
    setCategories((prev) =>
      prev.map((c) => {
        if (c.name === newArt.category) {
          const updatedCat = { ...c, contentCount: c.contentCount + 1 };
          saveCategoryToSupabase(updatedCat).catch(console.error);
          return updatedCat;
        }
        return c;
      })
    );
  };

  const handleEditArticle = (id: string, updated: Partial<KnowledgeArticle>) => {
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updatedArt = { ...a, ...updated };
          saveArticleToSupabase(updatedArt).catch(console.error);
          return updatedArt;
        }
        return a;
      })
    );
  };

  const handleDeleteArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    deleteArticleFromSupabase(id).catch(console.error);
  };

  // Handover Handlers
  const handleAddHandover = (newDoc: HandoverDoc) => {
    setHandoverDocs((prev) => [newDoc, ...prev]);
    saveHandoverDocToSupabase(newDoc).catch(console.error);
  };

  const handleDeleteHandover = (id: string) => {
    setHandoverDocs((prev) => prev.filter((d) => d.id !== id));
    deleteHandoverDocFromSupabase(id).catch(console.error);
  };

  // Forum Handlers
  const handleAddTopic = (newTopic: ForumTopic) => {
    setForumTopics((prev) => [newTopic, ...prev]);
    saveForumTopicToSupabase(newTopic).catch(console.error);

    // Rule: Send notification to ALL members in the SAME DIVISION when a new forum topic is created
    const forumNotif: AppNotification = {
      id: `notif-forum-${Date.now()}`,
      title: '💬 Topik Forum Diskusi Baru',
      desc: `${newTopic.author} membuat topik diskusi baru "${newTopic.title}" di divisi ${newTopic.category}.`,
      time: 'Baru saja',
      createdAt: Date.now(),
      author: newTopic.author,
      targetDivision: newTopic.category,
      type: 'info',
      read: false
    };

    setNotifications((prev) => [forumNotif, ...prev]);
  };

  const handleDeleteTopic = (topicId: string) => {
    setForumTopics((prev) => prev.filter((t) => t.id !== topicId));
    deleteForumTopicFromSupabase(topicId).catch(console.error);
  };

  const handleDeleteComment = (topicId: string, commentId: string) => {
    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const hasChildren = t.comments.some((c) => c.parentId === commentId);
          let updatedComments: ForumComment[];

          if (hasChildren) {
            updatedComments = t.comments.map((c) => {
              if (c.id === commentId) {
                const softDeleted: ForumComment = {
                  ...c,
                  author: '[Dihapus]',
                  content: '[Komentar telah dihapus]'
                };
                saveForumCommentToSupabase(topicId, softDeleted).catch(console.error);
                return softDeleted;
              }
              return c;
            });
          } else {
            updatedComments = t.comments.filter((c) => c.id !== commentId);
            deleteForumCommentFromSupabase(commentId).catch(console.error);
          }

          const updatedTopic = {
            ...t,
            comments: updatedComments,
            commentCount: updatedComments.length
          };
          saveForumTopicToSupabase(updatedTopic).catch(console.error);
          return updatedTopic;
        }
        return t;
      })
    );
  };

  const handleAddComment = (topicId: string, newComment: ForumComment) => {
    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const updatedTopic = {
            ...t,
            comments: [...t.comments, newComment],
            commentCount: t.comments.length + 1
          };
          saveForumTopicToSupabase(updatedTopic).catch(console.error);
          saveForumCommentToSupabase(topicId, newComment).catch(console.error);
          return updatedTopic;
        }
        return t;
      })
    );
  };

  const handleTogglePinComment = (topicId: string, commentId: string) => {
    setForumTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const updatedComments = t.comments.map((c) => {
            if (c.id === commentId) {
              const updatedComment = { ...c, isPinned: !c.isPinned };
              saveForumCommentToSupabase(topicId, updatedComment).catch(console.error);
              return updatedComment;
            }
            return c;
          });
          return { ...t, comments: updatedComments };
        }
        return t;
      })
    );
  };


  // If user is not logged in or activeTab is 'login', render full-screen login page
  if (!isLoggedIn || activeTab === 'login') {
    return (
      <LoginPage
        users={users}
        onLoginSuccess={(user) => {
          setIsLoggedIn(true);
          sessionStorage.setItem('kms_is_logged_in', 'true');
          setCurrentUserId(user.id);
          setActiveRole(user.role);
          setShowForcePasswordModal(!!user.mustChangePassword);
          if (user.role === 'Karyawan' || user.role === 'Associate') {
            setActiveTab('knowledge-base');
          } else if (user.role === 'Manajer') {
            setActiveTab('verifikasi-konten');
          } else {
            setActiveTab('dashboard');
          }
        }}
        onRegisterAssociate={(newUser) => {
          setUsers((prev) => [newUser, ...prev]);
          setIsLoggedIn(true);
          sessionStorage.setItem('kms_is_logged_in', 'true');
          setCurrentUserId(newUser.id);
          setActiveRole('Associate');
          setActiveTab('knowledge-base');
        }}
      />
    );
  }

  const getPageTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard System';
      case 'data-pengguna':
        return 'Manajemen Pengguna';
      case 'hak-akses':
        return 'Matriks Hak Akses';
      case 'knowledge-base':
        return 'Knowledge Base';
      case 'verifikasi-konten':
        return 'Verifikasi Konten';
      case 'handover-rotasi':
        return 'Handover Rotasi';
      case 'forum-diskusi':
        return 'Forum Diskusi';
      case 'laporan-penggunaan':
        return 'Laporan Penggunaan';
      case 'profil-pengguna':
        return 'Profil Pengguna';
      default:
        return 'Growth Hub KMS';
    }
  };

  const handleNavigateTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setGlobalSearch('');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased overflow-x-hidden">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onLogoutClick={() => setShowLogoutModal(true)}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        currentUser={currentUser}
      />

      {/* Top Header */}
      <Header
        title={getPageTitle(activeTab)}
        searchQuery={globalSearch}
        setSearchQuery={setGlobalSearch}
        setActiveTab={handleNavigateTab}
        onLogoutClick={() => setShowLogoutModal(true)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        currentUser={currentUser}
        onSwitchUserRole={handleSwitchUserRole}
        notifications={userNotifications}
        onClearNotifications={handleClearNotifications}
        activeTab={activeTab}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />

      {/* Main App Container */}
      <main className="pt-20 pb-12 lg:pl-[280px] w-full transition-all">
        <div className="px-4 sm:px-6 lg:px-8 w-full">
        {/* Force Password Change Sticky Alert Banner */}
        {currentUser.mustChangePassword && activeTab !== 'profil-pengguna' && (
          <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-lg border border-amber-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mb-6 font-medium animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl shrink-0 text-amber-100 animate-bounce">
                lock_reset
              </span>
              <div>
                <strong className="block text-sm font-bold text-white">⚠️ PERINGATAN UBAH PASSWORD PAKSA</strong>
                <span className="text-amber-50">
                  Akun Anda ditambahkan oleh Admin dengan password default (<strong>password123</strong>). Demi keamanan akun Anda, silakan ubah kata sandi sekarang.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('profil-pengguna')}
              className="px-4 py-2.5 bg-white text-amber-950 rounded-xl font-bold hover:bg-amber-100 transition-all shrink-0 shadow-sm flex items-center gap-1.5 self-end sm:self-auto hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">person</span>
              <span>Arahkan ke Profil Pengguna</span>
            </button>
          </div>
        )}
        {isLoadingSupabase ? (
          <div className="flex-1 flex items-center justify-center p-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 min-h-[420px] shadow-sm">
            <div className="text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#006194] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#006194]/20 animate-pulse">
                <span className="material-symbols-outlined text-3xl">cloud_sync</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Buffering...</h3>
                <p className="text-xs text-slate-400 mt-1">Memuat repositori real-time KMS Growth Hub</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                activities={activities}
                popularTopics={popularTopics}
                forumTopics={forumTopics}
                setActiveTab={setActiveTab}
                users={users}
                articles={articles}
                handoverDocs={handoverDocs}
              />
            )}

            {activeTab === 'data-pengguna' && (
              <DataPenggunaView
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                globalSearch={globalSearch}
              />
            )}

            {activeTab === 'hak-akses' && (
              <HakAksesView
                users={users}
                onUpdateUserRole={handleUpdateUserRole}
                globalSearch={globalSearch}
              />
            )}

            {activeTab === 'knowledge-base' && (
              <KnowledgeBaseView
                categories={categories}
                articles={articles}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddArticle={handleAddArticle}
                onRequestVerification={handleRequestVerification}
                onEditArticle={handleEditArticle}
                onDeleteArticle={handleDeleteArticle}
                globalSearch={globalSearch}
                currentUserRole={currentUser.role}
                currentUserName={currentUser.name}
                currentUserDivision={currentUser.division}
              />
            )}

            {activeTab === 'verifikasi-konten' && (
              <VerifikasiKontenView
                pendingDocs={pendingDocs}
                onApproveDoc={handleApproveDoc}
                onRejectDoc={handleRejectDoc}
                globalSearch={globalSearch}
                currentUserRole={currentUser.role}
                currentUserName={currentUser.name}
                currentUserDivision={currentUser.division}
              />
            )}

            {activeTab === 'handover-rotasi' && (
              <HandoverRotasiView
                handoverDocs={handoverDocs}
                onAddHandover={handleAddHandover}
                onEditHandoverDoc={handleEditHandoverDoc}
                onDeleteHandover={handleDeleteHandover}
                globalSearch={globalSearch}
                currentUserRole={currentUser.role}
                currentUserName={currentUser.name}
                currentUserDivision={currentUser.division}
              />
            )}

            {activeTab === 'forum-diskusi' && (
              <ForumDiskusiView
                topics={forumTopics}
                categories={categories}
                onAddTopic={handleAddTopic}
                onAddComment={handleAddComment}
                onTogglePinComment={handleTogglePinComment}
                onDeleteComment={handleDeleteComment}
                onDeleteTopic={handleDeleteTopic}
                globalSearch={globalSearch}
                currentUserRole={currentUser.role}
                currentUserName={currentUser.name}
                currentUserId={currentUser.id}
              />
            )}

            {activeTab === 'laporan-penggunaan' && (
              <LaporanPenggunaanView
                globalSearch={globalSearch}
                users={users}
                articles={articles}
                handoverDocs={handoverDocs}
                categories={categories}
              />
            )}

            {activeTab === 'profil-pengguna' && (
              <ProfilPenggunaView
                currentUser={currentUser}
                onUpdateUser={handleUpdateCurrentUser}
              />
            )}
          </>
        )}
        </div>
      </main>

      {/* Forced Password Change Modal */}
      {showForcePasswordModal && currentUser.mustChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 text-slate-800">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 shadow-sm">
                <span className="material-symbols-outlined text-2xl">lock_reset</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Notifikasi Wajib Pengguna Baru
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Ganti Password Bawaan Admin</h3>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
              <p>
                Halo <strong>{currentUser.name}</strong>, akun Anda telah ditambahkan oleh Admin dengan kata sandi default (<code className="bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded font-mono font-bold">password123</code>).
              </p>
              <p className="text-slate-600">
                Demi menjaga kerahasiaan & keamanan data internal KMS Growth Hub, Anda <strong>diwajibkan untuk mengganti kata sandi bawaan ini</strong> dengan kata sandi pribadi Anda di menu <strong>Profil Pengguna</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForcePasswordModal(false)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Nanti Saja
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForcePasswordModal(false);
                  setActiveTab('profil-pengguna');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#006194] text-white hover:bg-[#004b73] transition-colors flex items-center gap-2 shadow-md shadow-[#006194]/20"
              >
                <span className="material-symbols-outlined text-base">person</span>
                <span>Arahkan ke Profil Pengguna</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          setIsLoggedIn(false);
          sessionStorage.removeItem('kms_is_logged_in');
          localStorage.removeItem('kms_active_tab');
          setActiveTab('login');
        }}
      />
    </div>
  );
}
