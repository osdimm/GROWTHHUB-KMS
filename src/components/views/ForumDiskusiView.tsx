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

interface CommentTreeNode extends ForumComment {
  children: CommentTreeNode[];
}

// Helper: Convert flat comments array into hierarchical nested tree
const buildCommentTree = (comments: ForumComment[]): CommentTreeNode[] => {
  if (!comments || comments.length === 0) return [];

  const map = new Map<string, CommentTreeNode>();
  const roots: CommentTreeNode[] = [];

  comments.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });

  comments.forEach((c) => {
    const node = map.get(c.id)!;
    let parentFound = false;

    // 1. Check parentId matching first
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
      parentFound = true;
    } else {
      // 2. Fallback: Check if comment starts with @Author
      const mentionMatch = c.content.match(/^@([^\s:]+)/);
      if (mentionMatch) {
        const mentionedAuthor = mentionMatch[1].toLowerCase();
        const parentCandidate = comments.find(
          (p) =>
            p.id !== c.id &&
            p.author.toLowerCase().replace(/\s+/g, '') === mentionedAuthor.replace(/\s+/g, '')
        );
        if (parentCandidate && map.has(parentCandidate.id)) {
          map.get(parentCandidate.id)!.children.push(node);
          parentFound = true;
        }
      }
    }

    if (!parentFound) {
      roots.push(node);
    }
  });

  // Sort top-level root comments: Pinned first, then chronological
  roots.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return roots;
};

interface CommentNodeItemProps {
  node: CommentTreeNode;
  depth: number;
  activeTopicId: string;
  currentUserRole: string;
  currentUserName: string;
  activeReplyId: string | null;
  inlineReplyText: string;
  collapsedSet: Set<string>;
  onToggleReply: (commentId: string, authorName: string) => void;
  onCancelReply: () => void;
  onChangeInlineText: (text: string) => void;
  onSubmitInlineReply: (parentId: string) => void;
  onToggleCollapse: (commentId: string) => void;
  onTogglePin?: (topicId: string, commentId: string) => void;
  onDeleteComment?: (topicId: string, commentId: string) => void;
}

const CommentNodeItem: React.FC<CommentNodeItemProps> = ({
  node,
  depth,
  activeTopicId,
  currentUserRole,
  currentUserName,
  activeReplyId,
  inlineReplyText,
  collapsedSet,
  onToggleReply,
  onCancelReply,
  onChangeInlineText,
  onSubmitInlineReply,
  onToggleCollapse,
  onTogglePin,
  onDeleteComment
}) => {
  const isCollapsed = collapsedSet.has(node.id);
  const isReplyingThis = activeReplyId === node.id;
  const isDeleted = node.content === '[Komentar telah dihapus]' || node.author === '[Dihapus]';
  const hasChildren = node.children && node.children.length > 0;

  const canDelete =
    !isDeleted &&
    (currentUserRole === 'Admin' ||
      (node.author && node.author.toLowerCase() === currentUserName.toLowerCase()));

  return (
    <div className={`space-y-2 relative ${depth > 0 ? 'mt-2' : 'mt-3'}`}>
      {/* Main Comment Card */}
      <div
        className={`p-3.5 sm:p-4 rounded-xl border transition-all space-y-2 ${
          node.isPinned
            ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300/50'
            : isDeleted
            ? 'bg-slate-100/80 border-slate-200'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Header Badges: Pinned & Collapse Control */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {node.isPinned && (
              <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                <span className="material-symbols-outlined text-xs">push_pin</span>
                <span>Disematkan</span>
              </span>
            )}
            {hasChildren && (
              <button
                type="button"
                onClick={() => onToggleCollapse(node.id)}
                className="text-[11px] font-bold text-slate-600 hover:text-[#006194] bg-slate-200/70 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
                title={isCollapsed ? 'Tampilkan Balasan' : 'Sembunyikan Balasan'}
              >
                <span className="material-symbols-outlined text-xs">
                  {isCollapsed ? 'add' : 'remove'}
                </span>
                <span>{isCollapsed ? `+${node.children.length} Balasan` : 'Collapse'}</span>
              </button>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{node.timestamp}</span>
        </div>

        {/* Comment Author Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {node.avatar ? (
              <img
                src={node.avatar}
                alt={node.author}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sky-100 text-[#006194] font-bold text-xs flex items-center justify-center border border-sky-200">
                {node.initials || 'U'}
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-xs">{node.author}</p>
              <p className="text-[10px] text-slate-500 font-medium">{node.authorRole}</p>
            </div>
          </div>
        </div>

        {/* Comment Body */}
        <div className="pl-10">
          {isDeleted ? (
            <p className="text-xs text-slate-400 italic">
              [Komentar telah dihapus]
            </p>
          ) : (
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {node.content}
            </p>
          )}
        </div>

        {/* Action Controls (Reply, Pin, Delete) */}
        {!isDeleted && (
          <div className="flex items-center justify-end gap-1 pt-1 text-[11px]">
            {/* Inline Reply Trigger */}
            <button
              type="button"
              onClick={() => onToggleReply(node.id, node.author)}
              className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                isReplyingThis
                  ? 'bg-sky-100 text-[#006194] font-bold'
                  : 'text-slate-500 hover:text-[#006194] hover:bg-slate-200/70'
              }`}
              title="Balas Diskusi (Inline)"
            >
              <span className="material-symbols-outlined text-[18px]">reply</span>
            </button>

            {/* Pin / Unpin Toggle */}
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(activeTopicId, node.id)}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  node.isPinned
                    ? 'text-amber-800 bg-amber-100 hover:bg-amber-200'
                    : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                }`}
                title={node.isPinned ? 'Lepas Sematan' : 'Sematkan Pesan'}
              >
                <span className="material-symbols-outlined text-[18px]">push_pin</span>
              </button>
            )}

            {/* Delete Trigger */}
            {canDelete && onDeleteComment && (
              <button
                type="button"
                onClick={() => onDeleteComment(activeTopicId, node.id)}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all flex items-center justify-center"
                title="Hapus Balasan"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Inline Reply Form */}
      {isReplyingThis && (
        <div className="ml-4 sm:ml-6 mt-2 p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs text-[#006194] font-bold">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">reply</span>
              <span>Membalas @{node.author}</span>
            </span>
            <button
              type="button"
              onClick={onCancelReply}
              className="text-slate-400 hover:text-rose-500 text-xs font-semibold"
            >
              Batal
            </button>
          </div>
          <textarea
            value={inlineReplyText}
            onChange={(e) => onChangeInlineText(e.target.value)}
            placeholder={`Tulis balasan Anda untuk @${node.author}...`}
            rows={2}
            className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-[#006194] resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancelReply}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-200/60 rounded-lg text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => onSubmitInlineReply(node.id)}
              disabled={!inlineReplyText.trim()}
              className="px-4 py-1.5 bg-[#006194] text-white rounded-lg text-xs font-bold hover:bg-[#004b73] transition-all disabled:opacity-50"
            >
              Kirim Balasan
            </button>
          </div>
        </div>
      )}

      {/* Children Replies (Nested Branching Tree) */}
      {hasChildren && !isCollapsed && (
        <div className="ml-3 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-[#006194]/30 space-y-2 mt-2">
          {node.children.map((child) => (
            <CommentNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeTopicId={activeTopicId}
              currentUserRole={currentUserRole}
              currentUserName={currentUserName}
              activeReplyId={activeReplyId}
              inlineReplyText={inlineReplyText}
              collapsedSet={collapsedSet}
              onToggleReply={onToggleReply}
              onCancelReply={onCancelReply}
              onChangeInlineText={onChangeInlineText}
              onSubmitInlineReply={onSubmitInlineReply}
              onToggleCollapse={onToggleCollapse}
              onTogglePin={onTogglePin}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}

      {/* Collapsed Indicator Banner */}
      {hasChildren && isCollapsed && (
        <div className="ml-3 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-slate-200/80 dark:border-slate-800 mt-2">
          <button
            type="button"
            onClick={() => onToggleCollapse(node.id)}
            className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#006194] bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full transition-all inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-xs">unfold_more</span>
            <span>{node.children.length} balasan disembunyikan. Klik untuk menampilkan.</span>
          </button>
        </div>
      )}
    </div>
  );
};

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
  const [mainCommentText, setMainCommentText] = useState('');

  // Inline Reply & Thread Collapse State
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [inlineReplyText, setInlineReplyText] = useState('');
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set());

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

  // Submit Top-Level Comment (parentId: null)
  const handleSendMainComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainCommentText.trim() || !activeTopic) return;

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
      content: mainCommentText.trim(),
      timestamp: 'Baru saja',
      isPinned: false,
      parentId: null
    };

    onAddComment(activeTopic.id, newComment);
    setMainCommentText('');
    triggerToast('Tanggapan Anda telah dipublikasikan.');
  };

  // Submit Inline Reply (parentId: specific comment ID)
  const handleSubmitInlineReply = (parentId: string) => {
    if (!inlineReplyText.trim() || !activeTopic) return;

    const initials = currentUserName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newReply: ForumComment = {
      id: `comment-${Date.now()}`,
      author: currentUserName,
      authorRole: currentUserRole,
      avatar: undefined,
      initials: initials,
      content: inlineReplyText.trim(),
      timestamp: 'Baru saja',
      isPinned: false,
      parentId: parentId
    };

    onAddComment(activeTopic.id, newReply);
    setInlineReplyText('');
    setActiveReplyId(null);
    triggerToast('Balasan Anda telah dipublikasikan.');
  };

  const handleToggleReply = (commentId: string, authorName: string) => {
    if (activeReplyId === commentId) {
      setActiveReplyId(null);
      setInlineReplyText('');
    } else {
      setActiveReplyId(commentId);
      setInlineReplyText(`@${authorName} `);
    }
  };

  const handleToggleCollapse = (commentId: string) => {
    setCollapsedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
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

  const commentTree = activeTopic ? buildCommentTree(activeTopic.comments) : [];

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

              {/* Comments Section (Reddit-style Threaded Comments) */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006194]">question_answer</span>
                    <span>Diskusi Balasan ({activeTopic.comments ? activeTopic.comments.length : 0})</span>
                  </span>
                  {collapsedComments.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setCollapsedComments(new Set())}
                      className="text-xs font-semibold text-[#006194] hover:underline"
                    >
                      Buka Semua Thread
                    </button>
                  )}
                </h4>

                <div className="space-y-3">
                  {commentTree.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 italic">
                      Belum ada balasan. Jadilah yang pertama memberikan masukan!
                    </p>
                  ) : (
                    commentTree.map((rootNode) => (
                      <CommentNodeItem
                        key={rootNode.id}
                        node={rootNode}
                        depth={0}
                        activeTopicId={activeTopic.id}
                        currentUserRole={currentUserRole}
                        currentUserName={currentUserName}
                        activeReplyId={activeReplyId}
                        inlineReplyText={inlineReplyText}
                        collapsedSet={collapsedComments}
                        onToggleReply={handleToggleReply}
                        onCancelReply={() => {
                          setActiveReplyId(null);
                          setInlineReplyText('');
                        }}
                        onChangeInlineText={setInlineReplyText}
                        onSubmitInlineReply={handleSubmitInlineReply}
                        onToggleCollapse={handleToggleCollapse}
                        onTogglePin={onTogglePinComment}
                        onDeleteComment={onDeleteComment}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Main Top-Level Comment Form */}
              <form onSubmit={handleSendMainComment} className="pt-4 border-t border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">Tulis Balasan Utama</label>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#006194]/20 focus-within:border-[#006194]">
                  <textarea
                    value={mainCommentText}
                    onChange={(e) => setMainCommentText(e.target.value)}
                    placeholder="Ketik tanggapan Anda untuk topik ini..."
                    rows={3}
                    className="w-full p-3 text-xs text-slate-800 dark:text-white bg-transparent outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#006194] text-white rounded-xl text-xs font-bold hover:bg-[#004b73] transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Kirim Tanggapan Utama</span>
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
