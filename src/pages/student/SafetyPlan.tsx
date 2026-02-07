import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Heart, Users, MapPin, Stethoscope, Shield, Loader2, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSafetyPlan, saveSafetyPlan, type SafetyPlanData, type SafetyPlanContact } from '@/lib/firestore';

import SafetySection from '@/components/common/SafetySection';
import ContactSection from '@/components/common/ContactSection';
import debounce from 'lodash/debounce';

const DEFAULT_PLAN: SafetyPlanData = {
  warningSigns: [],
  copingStrategies: [],
  socialDistractions: [],
  emergencyContacts: [],
  professionalSupport: [],
  environmentSafety: [],
};

type SectionType = 'list' | 'contact';
type SectionColor = 'orange' | 'coral' | 'green' | 'mint' | 'blue' | 'purple';

interface SectionConfig {
  id: keyof SafetyPlanData;
  title: string;
  description: string;
  icon: React.ElementType;
  color: SectionColor;
  type: SectionType;
  prompt: string;
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'warningSigns',
    title: 'Warning Signs',
    description: 'Thoughts, images, mood changes, or behaviors that show a crisis is developing.',
    icon: AlertTriangle,
    color: 'orange',
    type: 'list',
    prompt: 'What thoughts or behaviors do you notice right before things get difficult?'
  },
  {
    id: 'copingStrategies',
    title: 'Internal Coping Strategies',
    description: 'Things I can do to take my mind off my problems without contacting another person.',
    icon: Heart,
    color: 'coral',
    type: 'list',
    prompt: 'Try listing activities like listening to music, deep breathing, or going for a walk.'
  },
  {
    id: 'socialDistractions',
    title: 'Social Distractions',
    description: 'People or places that can provide distraction from the crisis.',
    icon: MapPin,
    color: 'green',
    type: 'list',
    prompt: 'Think of places like cafes, libraries, or parks where you feel safe in public.'
  },
  {
    id: 'environmentSafety',
    title: 'Making Environment Safe',
    description: 'Steps to make my environment safer (e.g., removing sharp objects).',
    icon: Shield,
    color: 'mint',
    type: 'list',
    prompt: 'Consider steps like putting away medications or asking a friend to hold onto specific items.'
  },
  {
    id: 'emergencyContacts',
    title: 'Emergency Contacts',
    description: 'Family or friends I can ask for help.',
    icon: Users,
    color: 'blue',
    type: 'contact',
    prompt: 'Who are the 2-3 people you trust most to support you during a tough time?'
  },
  {
    id: 'professionalSupport',
    title: 'Professional Support',
    description: 'Clinicians, local urgent care services, or crisis hotlines.',
    icon: Stethoscope,
    color: 'purple',
    type: 'contact',
    prompt: 'Add your psychologist, GP, or local crisis hotline numbers here.'
  }
];

export default function SafetyPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<SafetyPlanData>(DEFAULT_PLAN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit state
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');
  const [newContact, setNewContact] = useState<SafetyPlanContact>({ name: '', relation: '', phone: '' });

  useEffect(() => {
    async function fetchPlan() {
      if (!user) return;
      try {
        const data = await getSafetyPlan(user.uid);
        if (data) setPlan(data);
      } catch (error) {
        console.error('Error fetching safety plan:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [user]);

  const completionProgress = useMemo(() => {
    const totalSections = SECTIONS.length;
    const completedSections = SECTIONS.filter(section => {
      const field = plan[section.id];
      return Array.isArray(field) && field.length > 0;
    }).length;
    return Math.round((completedSections / totalSections) * 100);
  }, [plan]);

  // Auto-save with debounce
  const debouncedSave = useMemo(
    () => debounce(async (uid: string, currentPlan: SafetyPlanData) => {
      setSaving(true);
      try {
        await saveSafetyPlan(uid, currentPlan);
      } catch (error) {
        console.error('Error saving plan:', error);
      } finally {
        setSaving(false);
      }
    }, 1000),
    []
  );

  const updatePlan = (updates: Partial<SafetyPlanData>) => {
    if (!user) return;
    const updated = { ...plan, ...updates };
    setPlan(updated);
    debouncedSave(user.uid, updated);
  };

  const handleAddItem = (sectionKey: keyof SafetyPlanData) => {
    if (!newItem.trim()) return;
    const currentItems = plan[sectionKey] as string[];
    updatePlan({
      [sectionKey]: [...currentItems, newItem]
    });
    setNewItem('');
  };

  const handleAddContact = (sectionKey: keyof SafetyPlanData) => {
    if (!newContact.name.trim()) return;
    const currentContacts = plan[sectionKey] as SafetyPlanContact[];
    updatePlan({
      [sectionKey]: [...currentContacts, newContact]
    });
    setNewContact({ name: '', relation: '', phone: '' });
  };

  const handleRemoveItem = (sectionKey: keyof SafetyPlanData, index: number) => {
    const currentList = plan[sectionKey];
    if (Array.isArray(currentList)) {
        const updatedList = [...currentList];
        updatedList.splice(index, 1);
        updatePlan({
            [sectionKey]: updatedList
        });
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">My Safety Plan</h1>
            <p className="text-text-muted">A step-by-step plan for keeping myself safe during a crisis.</p>
          </div>
          {saving && (
             <span className="text-sm text-text-muted flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
             </span>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="card-glass p-6 rounded-3xl mb-8 border-none overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-text uppercase tracking-widest">Plan Completion</h2>
              <span className="text-2xl font-black text-primary">{completionProgress}%</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1">
              <div 
                className="h-full bg-linear-to-r from-primary to-primary-light rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(45,106,79,0.3)]"
                style={{ width: `${completionProgress}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-text-muted font-medium italic">
                {completionProgress === 100 
                    ? "Fantastic! Your safety plan is complete and ready when you need it." 
                    : "Every step you complete makes you stronger. Take your time."}
            </p>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        </div>

        {/* Persistent Crisis Alert */}
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-10 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shrink-0 shadow-md">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-700 mb-2">In Immediate Crisis?</h2>
              <p className="text-red-600/90 mb-4 font-medium">If you are in danger or cannot keep yourself safe, please call immediately.</p>
              <div className="flex flex-wrap gap-3">
                <a href="tel:988" className="btn bg-red-600 hover:bg-red-700 text-white border-0 shadow-md hover:shadow-lg transform transition-transform active:scale-95">
                  <Phone className="w-4 h-4 mr-2" />
                  Call 988 (Suicide & Crisis Lifeline)
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
            {SECTIONS.map((section) => (
                section.type === 'contact' ? (
                    <ContactSection
                        key={section.id}
                        title={section.title}
                        description={section.description}
                        icon={section.icon}
                        color={section.color}
                        contacts={plan[section.id] as SafetyPlanContact[]}
                        onRemove={(index) => handleRemoveItem(section.id, index)}
                        isEditing={editingSection === section.id}
                        onEdit={() => setEditingSection(section.id)}
                        newContact={newContact}
                        onNewContactChange={(field, value) => setNewContact(prev => ({ ...prev, [field]: value }))}
                        onAdd={() => handleAddContact(section.id)}
                        onCancel={() => { setEditingSection(null); setNewContact({ name: '', relation: '', phone: '' }); }}
                        sectionPrompt={section.prompt}
                    />
                ) : (
                    <SafetySection
                        key={section.id}
                        title={section.title}
                        description={section.description}
                        icon={section.icon}
                        color={section.color}
                        items={plan[section.id] as string[]}
                        onRemove={(index) => handleRemoveItem(section.id, index)}
                        isEditing={editingSection === section.id}
                        onEdit={() => setEditingSection(section.id)}
                        newItem={newItem}
                        onNewItemChange={setNewItem}
                        onAdd={() => handleAddItem(section.id)}
                        onCancel={() => { setEditingSection(null); setNewItem(''); }}
                        sectionPrompt={section.prompt}
                    />
                )
            ))}
        </div>
    </div>
  );
}
