import React, { useState, useRef, useEffect } from 'react';
import { NavigationTab, User, UserRole, AppNotification } from '../types';

export type ThemeMode = 'light' | 'dark' | 'system';

interface HeaderProps {
  title?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
  onLogoutClick: () => void;
  onOpenMobileSidebar?: () => void;
  currentUser?: User;
  onSwitchUserRole?: (role: UserRole) => void;
  notifications?: AppNotification[];
  onClearNotifications?: () => void;
  activeTab?: NavigationTab;
  themeMode?: ThemeMode;
  setThemeMode?: (mode: ThemeMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  searchQuery,
  setSearchQuery,
  setActiveTab,
  onLogoutClick,
  onOpenMobileSidebar,
  currentUser,
  onSwitchUserRole,
  notifications = [],
  onClearNotifications,
  activeTab,
  themeMode = 'system',
  setThemeMode
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Cari di KMS Growth Hub (artikel, dokumen, kegiatan)...';
      case 'knowledge-base':
        return 'Cari artikel pengetahuan, panduan, atau SOP...';
      case 'verifikasi-konten':
        return 'Cari dokumen dalam antrean verifikasi...';
      case 'handover-rotasi':
        return 'Cari dokumen handover rotasi...';
      case 'forum-diskusi':
        return 'Cari topik atau balasan forum diskusi...';
      case 'data-pengguna':
        return 'Cari nama, email, atau divisi pengguna...';
      case 'hak-akses':
        return 'Cari pengguna untuk atur hak akses...';
      case 'laporan-penggunaan':
        return 'Cari laporan penggunaan atau statistik...';
      case 'profil-pengguna':
        return 'Cari informasi akun pengguna...';
      default:
        return 'Cari pengetahuan, pengguna, atau laporan...';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-[64px] bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 lg:px-8">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl sm:max-w-2xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 shrink-0"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-transparent rounded-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/10 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notifications Button & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 text-slate-600 hover:text-[#006194] hover:bg-slate-100 rounded-full transition-all relative"
            title="Notifikasi"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-[440px] bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in duration-200">
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-extrabold text-[#006194] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                {notifications.length > 0 && onClearNotifications && (
                  <button
                    onClick={onClearNotifications}
                    className="text-[11px] font-semibold text-slate-400 hover:text-[#006194]"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada notifikasi baru.
                </div>
              ) : (
                <div className="p-3 bg-slate-50/50 space-y-2">
                  {/* Slider Control Header & Indicator */}
                  <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1 text-[#006194]">
                      <span className="material-symbols-outlined text-xs animate-pulse">swipe_left</span>
                      Geser ke kanan untuk melihat notifikasi ({notifications.length} Total)
                    </span>
                    {notifications.length > 5 && (
                      <span className="bg-sky-100 text-[#006194] px-2 py-0.5 rounded-full font-bold">
                        Maks. 5 Terlihat / Slide
                      </span>
                    )}
                  </div>

                  {/* Horizontal Scroll / Carousel Container */}
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 p-1 custom-scrollbar pb-2 scroll-smooth">
                    {notifications.map((n, idx) => (
                      <div
                        key={n.id}
                        className={`w-[260px] sm:w-[300px] shrink-0 snap-start p-3.5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
                          !n.read
                            ? 'bg-white border-[#006194]/40 ring-1 ring-[#006194]/20 shadow-sm'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                                  n.type === 'approved'
                                    ? 'bg-emerald-600'
                                    : n.type === 'rejected'
                                    ? 'bg-rose-600'
                                    : n.type === 'pending'
                                    ? 'bg-amber-600'
                                    : 'bg-[#006194]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {n.type === 'approved'
                                    ? 'verified'
                                    : n.type === 'rejected'
                                    ? 'cancel'
                                    : n.type === 'pending'
                                    ? 'pending_actions'
                                    : 'notifications'}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0 bg-slate-100 px-2 py-0.5 rounded-md">
                              {n.time}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                            {n.desc}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                          <span>{n.targetDivision ? `Divisi: ${n.targetDivision}` : 'Pribadi / Umum'}</span>
                          <span className="text-slate-400"># {idx + 1} / {notifications.length}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Single Dynamic Theme Dropdown Button */}
        <div className="relative" ref={themeRef}>
          <button
            type="button"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-[#006194] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all flex items-center gap-0.5 border border-slate-200 dark:border-slate-700"
            title={`Mode Tampilan: ${themeMode === 'light' ? 'Light' : themeMode === 'dark' ? 'Dark' : 'System'}`}
          >
            <span className="material-symbols-outlined text-[20px] text-amber-500">
              {themeMode === 'light' ? 'light_mode' : themeMode === 'dark' ? 'dark_mode' : 'desktop_windows'}
            </span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-150 text-xs">
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                Pilihan Mode Tampilan
              </div>
              <button
                type="button"
                onClick={() => {
                  if (setThemeMode) setThemeMode('light');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  themeMode === 'light' ? 'bg-amber-50 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-base text-amber-500">light_mode</span>
                <span>Light (Terang)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (setThemeMode) setThemeMode('dark');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  themeMode === 'dark' ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-base text-indigo-500">dark_mode</span>
                <span>Dark (Gelap)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (setThemeMode) setThemeMode('system');
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                  themeMode === 'system' ? 'bg-sky-50 text-sky-900 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-200' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-base text-sky-500">desktop_windows</span>
                <span>System (Sistem)</span>
              </button>
            </div>
          )}
        </div>

        <div className="h-7 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* User Profile Info (Static Display) */}
        <div className="flex items-center gap-3 p-1.5" ref={profileRef}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{currentUser?.name || 'Dandi Pangestu'}</p>
            <p className="text-[10px] font-extrabold text-[#006194] uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block">
              {currentUser?.role || 'Admin'}
            </p>
          </div>
          <div className="relative shrink-0">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name || 'User Avatar'}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#006194]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#006194] text-white flex items-center justify-center font-bold text-xs border-2 border-[#006194] shadow-sm">
                {currentUser?.initials || currentUser?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
};
