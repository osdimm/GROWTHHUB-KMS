import React, { useState } from 'react';
import { ActivityLog, PopularTopic, NavigationTab, User, KnowledgeArticle, HandoverDoc } from '../../types';

interface DashboardViewProps {
  activities?: ActivityLog[];
  popularTopics: PopularTopic[];
  setActiveTab: (tab: NavigationTab) => void;
  users?: User[];
  articles?: KnowledgeArticle[];
  handoverDocs?: HandoverDoc[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  popularTopics,
  setActiveTab,
  users = [],
  articles = [],
  handoverDocs = []
}) => {
  const [showToast, setShowToast] = useState(true);
  const [timeRange, setTimeRange] = useState('30 Hari Terakhir');

  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'Aktif').length;
  const totalContentCount = articles.length + handoverDocs.length;
  const totalKbArticles = articles.length;
  const totalHandovers = handoverDocs.length;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Ikhtisar kinerja sistem dan distribusi pengetahuan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006194]"
          >
            <option>30 Hari Terakhir</option>
            <option>7 Hari Terakhir</option>
            <option>Tahun Ini (2026)</option>
          </select>
        </div>
      </div>

      {/* Top 2 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div
          onClick={() => setActiveTab('data-pengguna')}
          className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-5 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-4 bg-sky-100 text-[#001d31] rounded-2xl group-hover:bg-[#006194] group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[36px]">group</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pengguna</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalUsersCount}</h3>
            <div className="flex items-center gap-1 mt-1.5 text-emerald-600 text-xs font-bold">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{activeUsersCount} Akun Aktif</span>
              <span className="font-normal text-slate-400 ml-1">terdaftar di sistem</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div
          onClick={() => setActiveTab('knowledge-base')}
          className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-5 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-4 bg-indigo-100 text-indigo-900 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[36px]">cloud_upload</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Konten Diunggah</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalContentCount}</h3>
            <div className="flex items-center gap-1 mt-1.5 text-emerald-600 text-xs font-bold">
              <span className="material-symbols-outlined text-base">description</span>
              <span>{totalKbArticles} KB</span>
              <span className="font-normal text-slate-400 ml-1">• {totalHandovers} Handover</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Popular Topics Box */}
        <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-slate-900">Topik Populer</h4>
              <span className="text-xs text-slate-400 font-semibold">Pencarian Top</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {popularTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setActiveTab('forum-diskusi')}
                  className="flex items-center gap-3 p-3.5 border border-slate-100 bg-slate-50/50 hover:bg-sky-50/60 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#006194] flex items-center justify-center font-bold text-sm group-hover:bg-sky-100 transition-colors shrink-0">
                    #{topic.rank}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{topic.title}</p>
                    <p className="text-xs text-slate-400">{topic.searches.toLocaleString()} pencarian</p>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 ${
                      topic.trend === 'up'
                        ? 'text-emerald-500'
                        : topic.trend === 'down'
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {topic.trend === 'up'
                      ? 'trending_up'
                      : topic.trend === 'down'
                      ? 'trending_down'
                      : 'horizontal_rule'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('forum-diskusi')}
            className="w-full mt-6 text-[#006194] font-semibold text-xs py-2.5 border border-sky-200 rounded-xl hover:bg-sky-50 transition-colors"
          >
            Lihat Semua Forum Diskusi
          </button>
        </div>
      </div>

      {/* System Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#2d3133] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <span className="material-symbols-outlined text-emerald-400 text-[24px]">check_circle</span>
          <div className="pr-4">
            <p className="text-xs font-bold">Status Sistem</p>
            <p className="text-[11px] text-slate-300">
              Dashboard berhasil disinkronkan dengan data terbaru.
            </p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
};
