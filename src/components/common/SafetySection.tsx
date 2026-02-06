import { Plus, Trash2 } from 'lucide-react';

interface SafetySectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: 'orange' | 'coral' | 'green' | 'mint' | 'blue' | 'purple';
  items: string[];
  onRemove: (index: number) => void;
  isEditing: boolean;
  onEdit: () => void;
  newItem: string;
  onNewItemChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  sectionPrompt?: string;
}

const iconColors = {
  orange: 'bg-amber-100 text-amber-600',
  coral: 'bg-[#FFB4B4]/30 text-[#D84A4A]',
  green: 'bg-[#D8F3DC] text-[#2D6A4F]',
  mint: 'bg-[#95D5B2]/30 text-[#40916C]',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
};

const itemColors = {
  orange: 'bg-amber-50',
  coral: 'bg-[#FFB4B4]/10',
  green: 'bg-[#D8F3DC]/50',
  mint: 'bg-[#95D5B2]/20',
  blue: 'bg-blue-50',
  purple: 'bg-purple-50',
};

export default function SafetySection({
  title,
  description,
  icon: Icon,
  color,
  items,
  onRemove,
  isEditing,
  onEdit,
  newItem,
  onNewItemChange,
  onAdd,
  onCancel,
  sectionPrompt,
}: SafetySectionProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-[#E0E0E0] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${iconColors[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2C3E50] text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {title}
            </h3>
            <p className="text-sm text-[#7F8C8D]">{description}</p>
          </div>
        </div>
        {!isEditing && (
            <button onClick={onEdit} className="p-2.5 rounded-xl hover:bg-[#D8F3DC] transition-colors">
            <span className="sr-only">Edit</span>
            <svg className="w-5 h-5 text-[#7F8C8D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            </button>
        )}
      </div>

      {isEditing && sectionPrompt && (
          <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-sm text-primary font-medium flex gap-3 items-start animate-fade-in">
              <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-[10px] mt-0.5">?</div>
              <p>{sectionPrompt}</p>
          </div>
      )}

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className={`flex items-center justify-between p-4 rounded-2xl ${itemColors[color]}`}>
            <span className="text-[#2C3E50]">{item}</span>
            {isEditing && (
              <button onClick={() => onRemove(index)} className="p-1.5 rounded-lg hover:bg-[#FFB4B4]/30 text-[#D84A4A] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {isEditing && (
        <div className="mt-4 flex gap-2 animate-fade-in">
          <input
            type="text"
            value={newItem}
            onChange={(e) => onNewItemChange(e.target.value)}
            placeholder="Add new item..."
            className="input flex-1"
            onKeyDown={(e) => e.key === 'Enter' && onAdd()}
          />
          <button onClick={onAdd} className="btn-primary px-4">
            <Plus className="w-5 h-5" />
          </button>
          <button onClick={onCancel} className="px-5 rounded-xl border border-[#E0E0E0] hover:bg-[#D8F3DC]/30 text-[#2C3E50] font-medium transition-colors">
            Done
          </button>
        </div>
      )}
    </div>
  );
}
