import { useState, useEffect, useCallback } from 'react';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trophy, 
  Calendar,
  TrendingUp,
  Edit3,
  Trash2,
  X,
  Save
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { 
  getTherapyGoals, 
  saveTherapyGoal, 
  updateTherapyGoal,
  type TherapyGoal 
} from '@/lib/firestore';

const goalCategories = [
  { id: 'anxiety', label: 'Anxiety Management', color: 'bg-blue-100 text-blue-700' },
  { id: 'depression', label: 'Depression', color: 'bg-purple-100 text-purple-700' },
  { id: 'stress', label: 'Stress Reduction', color: 'bg-orange-100 text-orange-700' },
  { id: 'sleep', label: 'Sleep Improvement', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'social', label: 'Social Skills', color: 'bg-green-100 text-green-700' },
  { id: 'self-esteem', label: 'Self-Esteem', color: 'bg-pink-100 text-pink-700' },
  { id: 'academic', label: 'Academic Performance', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'relationships', label: 'Relationships', color: 'bg-red-100 text-red-700' },
  { id: 'coping', label: 'Coping Skills', color: 'bg-teal-100 text-teal-700' },
  { id: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
];

export default function TherapyGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<TherapyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<TherapyGoal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [targetDate, setTargetDate] = useState('');
  const [milestones, setMilestones] = useState<{ label: string; completed: boolean }[]>([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getTherapyGoals(user.uid);
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch therapy goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const filteredGoals = selectedCategory 
    ? goals.filter(g => g.category === selectedCategory)
    : goals;

  const calculateProgress = (goal: TherapyGoal) => {
    if (goal.milestones.length === 0) return goal.progress;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  const handleSave = async () => {
    if (!title.trim() || !user) return;
    
    setSaving(true);
    try {
      const progress = milestones.length > 0 
        ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100)
        : 0;

      if (editingGoal) {
        await updateTherapyGoal(editingGoal.id, {
          title,
          description,
          category,
          targetDate: targetDate ? new Date(targetDate) : undefined,
          milestones,
          progress,
        });
      } else {
        await saveTherapyGoal({
          userId: user.uid,
          title,
          description,
          category,
          targetDate: targetDate ? new Date(targetDate) : undefined,
          milestones,
          progress,
        });
      }
      
      resetForm();
      fetchGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  const toggleMilestone = async (goalId: string, milestoneIndex: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = [...goal.milestones];
    updatedMilestones[milestoneIndex].completed = !updatedMilestones[milestoneIndex].completed;
    
    const newProgress = Math.round(
      (updatedMilestones.filter(m => m.completed).length / updatedMilestones.length) * 100
    );

    try {
      await updateTherapyGoal(goalId, {
        milestones: updatedMilestones,
        progress: newProgress,
      });
      fetchGoals();
    } catch (error) {
      console.error('Failed to update milestone:', error);
    }
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    setMilestones([...milestones, { label: newMilestone, completed: false }]);
    setNewMilestone('');
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('other');
    setTargetDate('');
    setMilestones([]);
    setNewMilestone('');
    setShowNewGoal(false);
    setEditingGoal(null);
  };

  const startEdit = (goal: TherapyGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setCategory(goal.category || 'other');
    setTargetDate(goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : '');
    setMilestones([...goal.milestones]);
    setShowNewGoal(true);
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      // Note: You'd need to add a deleteTherapyGoal function to firestore.ts
      // For now, we'll just filter it out locally
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const getCategoryLabel = (catId?: string) => {
    return goalCategories.find(c => c.id === catId)?.label || 'Other';
  };

  const getCategoryColor = (catId?: string) => {
    return goalCategories.find(c => c.id === catId)?.color || 'bg-gray-100 text-gray-700';
  };

  const completedGoals = goals.filter(g => calculateProgress(g) === 100).length;
  const inProgressGoals = goals.filter(g => calculateProgress(g) > 0 && calculateProgress(g) < 100).length;
  const averageProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + calculateProgress(g), 0) / goals.length)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text mb-2">Therapy Goals</h1>
            <p className="text-text-muted">Track your progress and celebrate your wins</p>
          </div>
          <button
            onClick={() => setShowNewGoal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{goals.length}</p>
                <p className="text-xs text-text-muted">Total Goals</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{completedGoals}</p>
                <p className="text-xs text-text-muted">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{inProgressGoals}</p>
                <p className="text-xs text-text-muted">In Progress</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{averageProgress}%</p>
                <p className="text-xs text-text-muted">Avg. Progress</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="font-semibold text-text mb-4">Filter by Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === null ? 'bg-primary text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  All Goals ({goals.length})
                </button>
                {goalCategories.map(cat => {
                  const count = goals.filter(g => g.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        selectedCategory === cat.id ? 'bg-primary text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {showNewGoal ? (
              <div className="card animate-in fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-text">
                    {editingGoal ? 'Edit Goal' : 'New Therapy Goal'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-lg text-text-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-muted mb-1 block">Goal Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What do you want to achieve?"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-muted mb-1 block">Description (optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add more details about this goal..."
                      rows={3}
                      className="input resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-text-muted mb-1 block">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input"
                      >
                        {goalCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted mb-1 block">Target Date (optional)</label>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <label className="text-sm font-medium text-text-muted mb-2 block">Milestones</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addMilestone()}
                        placeholder="Add a milestone..."
                        className="input flex-1"
                      />
                      <button
                        onClick={addMilestone}
                        disabled={!newMilestone.trim()}
                        className="btn btn-secondary"
                      >
                        Add
                      </button>
                    </div>
                    
                    {milestones.length > 0 && (
                      <div className="space-y-2">
                        {milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Circle className="w-4 h-4 text-text-muted" />
                            <span className="flex-1 text-sm">{milestone.label}</span>
                            <button
                              onClick={() => removeMilestone(index)}
                              className="p-1 hover:bg-red-100 rounded text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                      disabled={!title.trim() || saving}
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      Save Goal
                    </button>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="card text-center py-16">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-3">
                  {selectedCategory ? 'No goals in this category' : 'No goals yet'}
                </h3>
                <p className="text-text-muted mb-6 max-w-md mx-auto">
                  Set therapy goals to track your progress and celebrate your achievements along the way
                </p>
                <button
                  onClick={() => setShowNewGoal(true)}
                  className="btn btn-primary"
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGoals.map((goal) => {
                  const progress = calculateProgress(goal);
                  const isCompleted = progress === 100;
                  
                  return (
                    <div 
                      key={goal.id} 
                      className={`card transition-all ${isCompleted ? 'bg-green-50/50 border-green-200' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isCompleted ? 'bg-green-500 text-white' : getCategoryColor(goal.category)
                          }`}>
                            {isCompleted ? (
                              <Trophy className="w-6 h-6" />
                            ) : (
                              <Target className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-text">{goal.title}</h3>
                            {goal.description && (
                              <p className="text-sm text-text-muted mt-1">{goal.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(goal.category)}`}>
                                {getCategoryLabel(goal.category)}
                              </span>
                              {goal.targetDate && (
                                <span className="text-xs text-text-muted flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due {new Date(goal.targetDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(goal)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-text-muted"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-text">Progress</span>
                          <span className={`text-sm font-bold ${isCompleted ? 'text-green-600' : 'text-primary'}`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-green-500' : 'bg-primary'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Milestones */}
                      {goal.milestones.length > 0 && (
                        <div className="space-y-2">
                          {goal.milestones.map((milestone, index) => (
                            <button
                              key={index}
                              onClick={() => toggleMilestone(goal.id, index)}
                              className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors"
                            >
                              {milestone.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-text-muted flex-shrink-0" />
                              )}
                              <span className={`text-sm ${milestone.completed ? 'line-through text-text-muted' : 'text-text'}`}>
                                {milestone.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {isCompleted && (
                        <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
                          <p className="text-green-700 font-medium flex items-center justify-center gap-2">
                            <Trophy className="w-4 h-4" />
                            Goal completed! Great job!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
