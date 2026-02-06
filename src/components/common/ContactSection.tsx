import { Plus, Trash2, Phone, User } from 'lucide-react';

interface Contact {
  name: string;
  relation: string;
  phone: string;
}

interface ContactSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: 'orange' | 'coral' | 'green' | 'mint' | 'blue' | 'purple';
  contacts: Contact[];
  onRemove: (index: number) => void;
  isEditing: boolean;
  onEdit: () => void;
  newContact: Contact;
  onNewContactChange: (field: keyof Contact, value: string) => void;
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

export default function ContactSection({
  title,
  description,
  icon: Icon,
  color,
  contacts,
  onRemove,
  isEditing,
  onEdit,
  newContact,
  onNewContactChange,
  onAdd,
  onCancel,
  sectionPrompt,
}: ContactSectionProps) {
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
          <button onClick={onEdit} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
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

      <div className="space-y-3">
        {contacts.map((contact, index) => (
          <div key={index} className={`flex items-center justify-between p-4 rounded-2xl ${itemColors[color]}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${iconColors[color]} flex items-center justify-center font-medium opacity-80`}>
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#2C3E50]">{contact.name}</p>
                <p className="text-sm text-[#7F8C8D]">{contact.relation}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <a href={`tel:${contact.phone}`} className="p-2 rounded-lg bg-white/80 hover:bg-white text-primary transition-colors" title="Call">
                <Phone className="w-4 h-4" />
              </a>
              {isEditing && (
                <button 
                  onClick={() => onRemove(index)} 
                  className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="mt-4 space-y-3 animate-fade-in border-t border-dashed border-gray-200 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => onNewContactChange('name', e.target.value)}
                    placeholder="Name"
                    className="input pl-9 w-full"
                />
            </div>
            <input
                type="text"
                value={newContact.relation}
                onChange={(e) => onNewContactChange('relation', e.target.value)}
                placeholder="Relation (e.g. Mom)"
                className="input w-full"
            />
            <div className="relative col-span-1 sm:col-span-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => onNewContactChange('phone', e.target.value)}
                    placeholder="Phone Number"
                    className="input pl-9 w-full"
                    onKeyDown={(e) => e.key === 'Enter' && onAdd()}
                />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={onAdd} className="btn-primary flex-1 justify-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Contact
            </button>
            <button onClick={onCancel} className="px-5 rounded-xl border border-[#E0E0E0] hover:bg-gray-50 text-[#2C3E50] font-medium transition-colors">
                Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
