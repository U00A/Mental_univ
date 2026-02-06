import { CheckCircle2, Circle, Target, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { type TherapyGoal } from '@/lib/firestore';

interface GoalCardProps {
  goal: TherapyGoal;
  onMilestoneToggle?: (index: number, completed: boolean) => void;
}

export default function GoalCard({ goal, onMilestoneToggle }: GoalCardProps) {
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const progressPercent = goal.milestones.length > 0 
    ? Math.round((completedMilestones / goal.milestones.length) * 100)
    : goal.progress;

  return (
    <div className="bg-white rounded-[32px] p-6 border border-border shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-primary/5 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-black text-text">{goal.title}</h4>
            {goal.targetDate && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-wider mt-0.5">
                <Calendar className="w-3 h-3" />
                Target: {format(goal.targetDate, 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-primary">{progressPercent}%</span>
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-text-muted font-medium mb-5 pl-1">{goal.description}</p>
      )}

      {/* Progress Bar */}
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-6">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Milestones */}
      {goal.milestones.length > 0 && (
        <div className="space-y-3 pl-1">
          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Milestones</span>
          <ul className="space-y-2.5">
            {goal.milestones.map((milestone, index) => (
              <li 
                key={index}
                className="flex items-center gap-3 cursor-pointer group/milestone"
                onClick={() => onMilestoneToggle?.(index, !milestone.completed)}
              >
                {milestone.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-200 group-hover/milestone:text-primary/50 flex-shrink-0 transition-colors" />
                )}
                <span className={`text-sm font-medium ${milestone.completed ? 'text-text-muted line-through' : 'text-text'}`}>
                  {milestone.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
