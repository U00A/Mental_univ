import { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Lock, 
  Unlock, 
  Edit3, 
  Trash2, 
  X,
  Save,
  Calendar,
  Filter
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { 
  createJournalEntry, 
  getJournalEntries, 
  updateJournalEntry, 
  deleteJournalEntry,
  type JournalEntry 
} from '@/lib/firestore';

const moods = [
  { value: 'very_good', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'neutral', emoji: '😐', label: 'Okay' },
  { value: 'bad', emoji: '😔', label: 'Bad' },
  { value: 'very_bad', emoji: '😢', label: 'Terrible' },
];

const commonTags = ['Gratitude', 'Reflection', 'Goals', 'Anxiety', 'Progress', 'Therapy', 'Sleep', 'Social'];

export default function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood'] | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getJournalEntries(user.uid);
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? entry.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !user) return;
    
    setSaving(true);
    try {
      if (editingEntry) {
        await updateJournalEntry(editingEntry.id, {
          title,
          content,
          mood: selectedMood || undefined,
          tags,
          isPrivate,
        });
      } else {
        await createJournalEntry({
          userId: user.uid,
          title,
          content,
          mood: selectedMood || undefined,
          tags,
          isPrivate,
        });
      }
      
      resetForm();
      fetchEntries();
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await deleteJournalEntry(entryId);
      fetchEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedMood(null);
    setTags([]);
    setIsPrivate(true);
    setShowNewEntry(false);
    setEditingEntry(null);
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedMood(entry.mood);
    setTags(entry.tags);
    setIsPrivate(entry.isPrivate);
    setShowNewEntry(true);
  };

  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getMoodEmoji = (mood?: JournalEntry['mood']) => {
    return moods.find(m => m.value === mood)?.emoji || '📝';
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text mb-2">Journal & Goals</h1>
            <p className="text-text-muted">Your private space for reflection and growth</p>
          </div>
          <button
            onClick={() => setShowNewEntry(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="card">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="input pl-9 w-full"
                />
              </div>
            </div>

            {/* Tags Filter */}
            <div className="card">
              <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Filter by Tag
              </h3>
              <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTag === tag
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="card">
              <h3 className="font-semibold text-text mb-3">Your Journey</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Total Entries</span>
                  <span className="font-bold text-text">{entries.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">This Month</span>
                  <span className="font-bold text-text">
                    {entries.filter(e => {
                      const date = new Date(e.createdAt);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Private Entries</span>
                  <span className="font-bold text-text">
                    {entries.filter(e => e.isPrivate).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {showNewEntry ? (
              <div className="card animate-in fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-text">
                    {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-lg text-text-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Entry title..."
                    className="input text-lg font-semibold"
                  />

                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts here..."
                    rows={8}
                    className="input resize-none"
                  />

                  {/* Mood Selection */}
                  <div>
                    <label className="text-sm font-medium text-text-muted mb-2 block">How are you feeling?</label>
                    <div className="flex gap-2">
                      {moods.map(mood => (
                        <button
                          key={mood.value}
                          onClick={() => setSelectedMood(mood.value as JournalEntry['mood'])}
                          className={`p-2 rounded-xl transition-all ${
                            selectedMood === mood.value
                              ? 'bg-primary/10 ring-2 ring-primary'
                              : 'hover:bg-gray-100'
                          }`}
                          title={mood.label}
                        >
                          <span className="text-2xl">{mood.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium text-text-muted mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {commonTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            tags.includes(tag)
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {isPrivate ? (
                        <Lock className="w-5 h-5 text-primary" />
                      ) : (
                        <Unlock className="w-5 h-5 text-text-muted" />
                      )}
                      <div>
                        <p className="font-medium text-text">{isPrivate ? 'Private Entry' : 'Shared Entry'}</p>
                        <p className="text-xs text-text-muted">
                          {isPrivate ? 'Only you can see this' : 'Visible to your therapist'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPrivate(!isPrivate)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        isPrivate ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        isPrivate ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={resetForm}
                      className="btn btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!title.trim() || !content.trim() || saving}
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      Save Entry
                    </button>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="card text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">No entries yet</h3>
                <p className="text-text-muted mb-4">Start your journaling journey today</p>
                <button
                  onClick={() => setShowNewEntry(true)}
                  className="btn btn-primary"
                >
                  Write Your First Entry
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="card group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
                        <div>
                          <h3 className="font-semibold text-text">{entry.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Calendar className="w-3 h-3" />
                            {entry.createdAt.toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            {entry.isPrivate && <Lock className="w-3 h-3 ml-1" />}
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => startEdit(entry)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-text-muted"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-text mb-3 line-clamp-3">{entry.content}</p>
                    
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 rounded-full text-xs text-text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
