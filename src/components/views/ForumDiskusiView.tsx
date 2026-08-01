import React, { useState } from 'react';
import { ForumTopic, ForumComment, CategoryItem } from '../../types';

interface ForumDiskusiViewProps {
  topics: ForumTopic[];
  categories?: CategoryItem[];
  onAddTopic: (topic: ForumTopic) => void;
  onAddComment: (topicId: string, comment: ForumComment) => void;
  onTogglePinComment?: (topicId: string, commentId: string) => void;
  onDeleteComment?: (topicId: string, commentId: string) => void;
  onDeleteTopic?: (topicId: string) => void;
  globalSearch: string;
  currentUserRole?: string;
  currentUserName?: string;
  currentUserId?: string;
}

export const ForumDiskusiView: React.FC<ForumDiskusiViewProps> = ({
  topics,
  categories,
  onAddTopic,
  onAddComment,
  onTogglePinComment,
  onDeleteComment,
  onDeleteTopic,
  globalSearch,
  currentUserRole = 'Karyawan',
  currentUserName = 'Ananda Reva',
  currentUserId = 'u-karyawan'
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topics[0]?.id || '');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('Semua Divisi');
  const [newCommentText, setNewCommentText] = useState('');
  const [replyParentComment, setReplyParentComment] = useState<ForumComment | null>(null);
  
  const divisionsList =
    categories && categories.length > 0
      ? categories.map((c) => c.name)
      : [
          'Talent Acquisition',
          'Talent Development',
          'Organizational Development',
          'Employee Benefit',
          'Administration',
          'Graphic Design',
          'Copywriting',
          'Content Coordinator',
          'Video Editor',
          'Public Relation',
          'Social Media Officer',
          'Key Opinion Leader Coordinator',
          'Representative',
          'Program Specialist',
          'Project Representative',
          'Community & Digital Marketing'
        ];

  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState(divisionsList[0] || 'Talent Development');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteConfirmTopic, setDeleteConfirmTopic] = useState<ForumTopic | null>(null);

  const handleConfirmDeleteTopic = () => {
    if (!deleteConfirmTopic || !onDeleteTopic) return;
    const title = deleteConfirmTopic.title;
    onDeleteTopic(deleteConfirmTopic.id);
    setDeleteConfirmTopic(null);
    triggerToast(`Topik diskusi "${title}" berhasil dihapus.`);
  };

  const query = globalSearch.toLowerCase();
  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(query) ||
      t.author.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)));

    const matchesDivision =
      selectedDivisionFilter === 'Semua Divisi' || t.category === selectedDivisionFilter;

    return matchesSearch && matchesDivision;
  });

  const activeTopic = topics.find((t) => t.id === selectedTopicId) || filteredTopics[0] || topics[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeTopic) return;

    const initials = currentUserName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newComment: ForumComment = {
      id: `comment-${Date.now()}`,
      author: currentUserName,
      authorRole: currentUserRole,
      avatar: undefined,
      initials: initials,
      content: newCommentText.trim(),
      timestamp: 'Baru saja',
      isPinned: false,
      parentId: replyParentComment ? replyParentComment.id : null
    };

    onAddComment(activeTopic.id, newComment);
    setNewCommentText('');
    setReplyParentComment(null);
    triggerToast('Balasan Anda telah dipublikasikan.');
  };

  const handleCreateTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle || !newTopicContent) return;

    const newTopic: ForumTopic = {
      id: `ft-${Date.now()}`,
      title: newTopicTitle,
      category: newTopicCategory,
      author: currentUserName,
      authorRole: currentUserRole,
      date: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      time: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      views: 1,
      commentCount: 0,
      content: newTopicContent,
      tags: [newTopicCategory.toUpperCase(), 'DISKUSI'],
      comments: []
    };

    onAddTopic(newTopic);
    setSelectedTopicId(newTopic.id);
    setShowNewTopicModal(false);
    setNewTopicTitle('');
    setNewTopicContent('');
    triggerToast(`Topik baru "${newTopic.title}" berhasil dibuat.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Forum Diskusi</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Wadah kolaborasi, tanya jawab operasional, dan pertukaran ide antar tim.
          </p>
        </div>

        {currentUserRole !== 'Associate' && (
          <button
            onClick={() => setShowNewTopicModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#006194] text-white rounded-xl text-xs font-bold hover:bg-[#004b73] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_comment</span>
            <span>Buat Topik Baru</span>
          </button>
        )}
      </div>

      {/* Main Forum Split Container */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Topic List Panel */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          {/* Division Filter Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  filter_alt
                </span>
                <select
                  value={selectedDivisionFilter}
                  onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-[#006194] outline-none cursor-pointer"
                >
                  <option value="Semua Divisi">Semua Divisi</option>
                  {divisionsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDivisionFilter !== 'Semua Divisi' && (
                <button
                  type="button"
                  onClick={() => setSelectedDivisionFilter('Semua Divisi')}
                  className="px-2.5 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center shrink-0"
                  title="Reset Filter Divisi"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto custom-scrollbar pr-1">
            {filteredTopics.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada diskusi ditemukan.
              </div>
            ) : (
              filteredTopics.map((topic) => {
                const isSelected = topic.id === activeTopic?.id;
                return (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/80 border-[#006194] shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#006194] bg-sky-100 px-2 py-0.5 rounded">
                        {topic.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{topic.date}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                      {topic.title}
                    </h4>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                        {topic.author}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-[#006194]">
                        <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                        <span>{topic.comments ? topic.comments.length : 0} Balasan</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Topic Thread Panel */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {activeTopic ? (
            <div className="p-6 space-y-6">
              {/* Post Header */}
              <div className="border-b border-slate-100 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-sky-100 text-[#006194] text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs">
                      <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
                      <span>Divisi Topik: {activeTopic.category}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">
                      {activeTopic.date} • {activeTopic.time}
                    </span>
                    {currentUserRole === 'Admin' && onDeleteTopic && (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmTopic(activeTopic)}
                        className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 hover:border-rose-300 transition-all flex items-center gap-1 shadow-sm"
                        title="Hapus Topik Diskusi (Khusus Admin)"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Hapus Topik</span>
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 leading-snug mb-4">
                  {activeTopic.title}
                </h3>

                {/* Author Info */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {activeTopic.authorAvatar ? (
                    <img
                      src={activeTopic.authorAvatar}
                      alt={activeTopic.author}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#006194] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {activeTopic.authorInitials || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{activeTopic.author}</p>
                    <p className="text-xs text-slate-500">{activeTopic.authorRole}</p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {activeTopic.content}
              </div>

              {/* Tags */}
              {activeTopic.tags && activeTopic.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {activeTopic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-md border border-slate-200/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comments Section */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006194]">question_answer</span>
                  <span>Diskusi Balasan ({activeTopic.comments ? activeTopic.comments.length : 0})</span>
                </h4>

                <div className="space-y-3">
                  {!activeTopic.comments || activeTopic.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 italic">
                      Belum ada balasan. Jadilah yang pertama memberikan masukan!
                    </p>
                  ) : (
                    activeTopic.comments.map((c) => {
                      const canDelete =
                        currentUserRole === 'Admin' ||
                        (c.author && c.author.toLowerCase() === currentUserName.toLowerCase());

                      const canPin =
                        currentUserRole === 'Admin' ||
                        currentUserRole === 'Manajer' ||
                        (activeTopic && activeTopic.author.toLowerCase() === currentUserName.toLowerCase());

                      return (
                        <div
                          key={c.id}
                          className={`p-4 rounded-xl border transition-all space-y-2 ${
                            c.isPinned
                              ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300/50'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          {/* Pinned Badge */}
                          {c.isPinned && (
                            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-800 mb-1">
                              <span className="material-symbols-outlined text-sm text-amber-600">push_pin</span>
                              <span>Disematkan</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {c.avatar ? (
                                <img
                                  src={c.avatar}
                                  alt={c.author}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-sky-100 text-[#006194] font-bold text-xs flex items-center justify-center border border-sky-200">
                                  {c.initials || 'U'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{c.author}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{c.authorRole}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">{c.timestamp}</span>
                          </div>

                          <p className="text-xs text-slate-800 leading-relaxed pl-10 whitespace-pre-line">
                            {c.content}
                          </p>

                          <div className="flex items-center justify-end gap-2 pt-1 text-[11px] font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                setNewCommentText(`@${c.author} `);
                                const el = document.querySelector<HTMLTextAreaElement>('textarea');
                                if (el) el.focus();
                              }}
                              className="px-2.5 py-1 text-slate-600 hover:text-[#006194] hover:bg-slate-200/70 rounded-lg transition-all flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[15px]">reply</span>
                              <span>Balas</span>
                            </button>

                            {canPin && onTogglePinComment && activeTopic && (
                              <button
                                type="button"
                                onClick={() => onTogglePinComment(activeTopic.id, c.id)}
                                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                                  c.isPinned
                                    ? 'text-amber-800 bg-amber-100 hover:bg-amber-200'
                                    : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                }`}
                                title={c.isPinned ? 'Lepas Sematan' : 'Sematkan Pesan'}
                              >
                                <span className="material-symbols-outlined text-[15px]">push_pin</span>
                                <span>{c.isPinned ? 'Lepas Sematan' : 'Sematkan'}</span>
                              </button>
                            )}

                            {canDelete && onDeleteComment && activeTopic && (
                              <button
                                type="button"
                                onClick={() => onDeleteComment(activeTopic.id, c.id)}
                                className="px-2.5 py-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1"
                                title="Hapus balasan"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Reply Comment Editor */}
              <form onSubmit={handleSendComment} className="pt-4 border-t border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">Tulis Balasan Diskusi</label>
                <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#006194]/20 focus-within:border-[#006194]">
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Ketik tanggapan Anda di sini..."
                    rows={3}
                    className="w-full p-3 text-xs text-slate-800 outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#006194] text-white rounded-xl text-xs font-bold hover:bg-[#004b73] transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Kirim Balasan</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Pilih topik di sebelah kiri untuk melihat thread diskusi.
            </div>
          )}
        </div>
      </div>

      {/* New Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900">Buat Topik Diskusi Baru</h3>
              <button
                onClick={() => setShowNewTopicModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTopicSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase block mb-1">
                  Judul Topik
                </label>
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Contoh: Evaluasi Alur Kerja Editorial Q1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase block mb-1">
                  Kategori Divisi
                </label>
                <select
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#006194]"
                >
                  {divisionsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase block mb-1">
                  Isi Pertanyaan / Topik
                </label>
                <textarea
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  placeholder="Jelaskan secara mendalam poin diskusi atau kendala yang dihadapi..."
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#006194] text-white hover:bg-[#004b73]"
                >
                  Publikasikan Topik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Topic Modal (Admin) */}
      {deleteConfirmTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">delete_forever</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Topik Diskusi</h3>
                <p className="text-xs text-slate-500">Akses Khusus Admin</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus topik diskusi <strong className="text-slate-900">"{deleteConfirmTopic.title}"</strong>?
              Seluruh balasan dan histori di dalamnya akan terhapus secara permanen dari sistem KMS.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmTopic(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTopic}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                <span>Ya, Hapus Topik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#2d3133] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          {!toastMessage.includes('⚠️') && !toastMessage.includes('❌') && !toastMessage.toLowerCase().includes('salah') && !toastMessage.toLowerCase().includes('gagal') && (
            <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
          )}
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
