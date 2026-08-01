import React, { useState, useRef, useEffect } from 'react';
import { NavigationTab, User } from '../types';
import { GrowthHubLogo } from './GrowthHubLogo';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onLogoutClick: () => void;
  isOpenMobile?: boolean;
  setIsOpenMobile?: (open: boolean) => void;
  currentUser?: User;
  themeMode?: ThemeMode;
  setThemeMode?: (mode: ThemeMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogoutClick,
  isOpenMobile,
  setIsOpenMobile,
  currentUser,
  themeMode = 'system',
  setThemeMode
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userRole = currentUser?.role || 'Admin';

  const allNavItems: { id: NavigationTab; label: string; icon: string; badge?: string; roles: string[] }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['Admin'] },
    { id: 'data-pengguna', label: 'Manajemen Pengguna', icon: 'group', roles: ['Admin'] },
    { id: 'hak-akses', label: 'Hak Akses', icon: 'key', roles: ['Admin'] },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: 'menu_book', roles: ['Admin', 'Manajer', 'Karyawan', 'Associate'] },
    { id: 'verifikasi-konten', label: 'Verifikasi Konten', icon: 'verified', roles: ['Manajer'] },
    { id: 'handover-rotasi', label: 'Handover Rotasi', icon: 'sync_alt', roles: ['Admin', 'Manajer', 'Karyawan', 'Associate'] },
    { id: 'forum-diskusi', label: 'Forum Diskusi', icon: 'forum', roles: ['Admin', 'Manajer', 'Karyawan', 'Associate'] },
    { id: 'laporan-penggunaan', label: 'Laporan Penggunaan', icon: 'analytics', roles: ['Admin'] },
    { id: 'profil-pengguna', label: 'Profil Pengguna', icon: 'person', roles: ['Admin', 'Manajer', 'Karyawan', 'Associate'] },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  const handleNav = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (setIsOpenMobile) setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpenMobile && setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] bg-[#0F172A] text-white flex flex-col py-6 z-50 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-md shrink-0">
              <GrowthHubLogo className="w-full h-full" iconColor="#0B2545" dotColor="#FFC800" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white">Growth Hub</h1>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Portal KMS</p>
            </div>
          </div>
          {setIsOpenMobile && (
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar px-3">
          {visibleNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 text-left font-medium ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold border-l-4 border-[#0284C7] pl-3'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      isActive ? 'text-[#38bdf8]' : 'text-slate-400'
                    }`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 font-bold text-[11px] rounded-full border border-sky-400/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Theme & Logout Section */}
        <div className="px-3 mt-auto pt-4 border-t border-white/10 flex items-center justify-between gap-2">
          {/* Single Dynamic Theme Dropdown Button */}
          <div className="relative" ref={themeRef}>
            <button
              type="button"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-1 border border-white/10"
              title={`Mode Tampilan: ${themeMode === 'light' ? 'Light' : themeMode === 'dark' ? 'Dark' : 'System'}`}
            >
              <span className="material-symbols-outlined text-[20px] text-amber-400">
                {themeMode === 'light' ? 'light_mode' : themeMode === 'dark' ? 'dark_mode' : 'desktop_windows'}
              </span>
              <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
            </button>

            {showThemeMenu && (
              <div className="absolute bottom-12 left-0 w-48 bg-[#1e293b] border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-150 text-xs">
                <div className="px-2 py-1 text-[10px] font-extrabold uppercase text-slate-400 border-b border-slate-800 mb-1">
                  Pilihan Mode Tampilan
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (setThemeMode) setThemeMode('light');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                    themeMode === 'light' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-base text-amber-400">light_mode</span>
                  <span>Light (Terang)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (setThemeMode) setThemeMode('dark');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                    themeMode === 'dark' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-base text-indigo-400">dark_mode</span>
                  <span>Dark (Gelap)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (setThemeMode) setThemeMode('system');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all ${
                    themeMode === 'system' ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-base text-sky-400">desktop_windows</span>
                  <span>System (Sistem)</span>
                </button>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogoutClick}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-bold border border-white/10"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
