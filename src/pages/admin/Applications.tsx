import { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Check, 
  X,
  FileCheck,
  Clock,
  Mail,
  Phone,
  Shield,
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';

interface PsychologistApplication {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  role: 'psychologist';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'pending' | 'suspended';
  createdAt: { seconds: number } | null;
  // Professional info
  title?: string;
  licenseNumber?: string;
  specializations?: string[];
  yearsExperience?: number;
  education?: string;
  certifications?: string[];
  bio?: string;
  photoURL?: string;
  // Application documents
  applicationNotes?: string;
  rejectionReason?: string;
  verifiedAt?: { seconds: number } | null;
  verifiedBy?: string;
}

type TabType = 'pending' | 'approved' | 'rejected';

const tabs: { id: TabType; label: string; color: string }[] = [
  { id: 'pending', label: 'Pending Review', color: 'yellow' },
  { id: 'approved', label: 'Approved', color: 'green' },
  { id: 'rejected', label: 'Rejected', color: 'red' },
];

export default function Applications() {
  const [applications, setApplications] = useState<PsychologistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<PsychologistApplication | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  // New psychologist form state
  const [newPsychologist, setNewPsychologist] = useState({
    displayName: '',
    email: '',
    phone: '',
    title: '',
    licenseNumber: '',
    specializations: '',
    yearsExperience: 0,
    education: '',
    bio: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'psychologist')
      );
      const snapshot = await getDocs(q);
      const apps = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as PsychologistApplication[];
      setApplications(apps);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (uid: string) => {
    try {
      setProcessingId(uid);
      await updateDoc(doc(db, 'users', uid), { 
        verificationStatus: 'approved',
        status: 'active',
        verifiedAt: serverTimestamp(),
        isAvailable: true
      });
      setApplications(prev => prev.map(app => 
        app.uid === uid ? { ...app, verificationStatus: 'approved', status: 'active' } : app
      ));
      setSelectedApp(null);
    } catch (err) {
      console.error('Error approving application:', err);
      alert('Failed to approve application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (uid: string) => {
    try {
      setProcessingId(uid);
      await updateDoc(doc(db, 'users', uid), { 
        verificationStatus: 'rejected',
        status: 'suspended',
        rejectionReason: rejectionReason || 'Application not approved'
      });
      setApplications(prev => prev.map(app => 
        app.uid === uid ? { ...app, verificationStatus: 'rejected', status: 'suspended' } : app
      ));
      setShowRejectModal(null);
      setRejectionReason('');
      setSelectedApp(null);
    } catch (err) {
      console.error('Error rejecting application:', err);
      alert('Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddPsychologist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProcessingId('new');
      await addDoc(collection(db, 'users'), {
        ...newPsychologist,
        specializations: newPsychologist.specializations.split(',').map(s => s.trim()).filter(Boolean),
        role: 'psychologist',
        verificationStatus: 'approved',
        status: 'active',
        isAvailable: true,
        createdAt: serverTimestamp(),
        verifiedAt: serverTimestamp(),
        rating: 5.0,
        reviewCount: 0
      });
      
      // Refresh list
      await fetchApplications();
      setShowAddModal(false);
      setNewPsychologist({
        displayName: '',
        email: '',
        phone: '',
        title: '',
        licenseNumber: '',
        specializations: '',
        yearsExperience: 0,
        education: '',
        bio: ''
      });
    } catch (err) {
      console.error('Error adding psychologist:', err);
      alert('Failed to add psychologist');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesTab = activeTab === 'pending' 
      ? (!app.verificationStatus || app.verificationStatus === 'pending')
      : app.verificationStatus === activeTab;
    const matchesSearch = 
      app.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.licenseNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusCounts = () => ({
    pending: applications.filter(a => !a.verificationStatus || a.verificationStatus === 'pending').length,
    approved: applications.filter(a => a.verificationStatus === 'approved').length,
    rejected: applications.filter(a => a.verificationStatus === 'rejected').length
  });

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Psychologist Applications</h1>
          <p className="text-gray-500">Review and approve psychologist verification requests</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Psychologist
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{counts.pending}</p>
              <p className="text-sm text-yellow-600">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{counts.approved}</p>
              <p className="text-sm text-green-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{counts.rejected}</p>
              <p className="text-sm text-red-600">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? tab.color === 'yellow' 
                    ? 'bg-yellow-100 text-yellow-700'
                    : tab.color === 'green'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({counts[tab.id]})
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No {activeTab} applications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredApplications.map((app) => (
              <div key={app.uid} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold shrink-0">
                      {app.displayName?.charAt(0) || 'P'}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{app.displayName || 'Unknown'}</h3>
                        {app.verificationStatus === 'approved' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Verified
                          </span>
                        )}
                        {(!app.verificationStatus || app.verificationStatus === 'pending') && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                        {app.verificationStatus === 'rejected' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Rejected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{app.title || 'Psychologist'}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {app.email}
                        </span>
                        {app.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {app.phone}
                          </span>
                        )}
                        {app.licenseNumber && (
                          <span className="flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" />
                            License: {app.licenseNumber}
                          </span>
                        )}
                      </div>
                      {app.specializations && app.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.specializations.slice(0, 3).map((spec, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {spec}
                            </span>
                          ))}
                          {app.specializations.length > 3 && (
                            <span className="text-xs text-gray-400">+{app.specializations.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedApp(selectedApp?.uid === app.uid ? null : app)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {selectedApp?.uid === app.uid ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    {(!app.verificationStatus || app.verificationStatus === 'pending') && (
                      <>
                        <button
                          onClick={() => handleApprove(app.uid)}
                          disabled={processingId === app.uid}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          {processingId === app.uid ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => setShowRejectModal(app.uid)}
                          disabled={processingId === app.uid}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedApp?.uid === app.uid && (
                  <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Professional Information</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">Years of Experience:</span> {app.yearsExperience || 'Not specified'}</p>
                          <p><span className="text-gray-500">Education:</span> {app.education || 'Not specified'}</p>
                          <p><span className="text-gray-500">License Number:</span> {app.licenseNumber || 'Not specified'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
                        <p className="text-sm text-gray-600">{app.bio || 'No bio provided'}</p>
                      </div>
                    </div>
                    {app.certifications && app.certifications.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {app.certifications.map((cert, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {app.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {app.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-bold">Reject Application</h2>
            </div>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this application.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-200 rounded-xl text-sm min-h-[100px] focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={processingId === showRejectModal}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {processingId === showRejectModal ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Psychologist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <UserPlus className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-bold">Add New Psychologist</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPsychologist} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPsychologist.displayName}
                    onChange={(e) => setNewPsychologist(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newPsychologist.email}
                    onChange={(e) => setNewPsychologist(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="doctor@rahatek.dz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newPsychologist.phone}
                    onChange={(e) => setNewPsychologist(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="+213 XX XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newPsychologist.title}
                    onChange={(e) => setNewPsychologist(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="Clinical Psychologist"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    value={newPsychologist.licenseNumber}
                    onChange={(e) => setNewPsychologist(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="PSY-XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={newPsychologist.yearsExperience}
                    onChange={(e) => setNewPsychologist(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specializations (comma-separated)</label>
                <input
                  type="text"
                  value={newPsychologist.specializations}
                  onChange={(e) => setNewPsychologist(prev => ({ ...prev, specializations: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="Anxiety, Depression, Stress Management"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input
                  type="text"
                  value={newPsychologist.education}
                  onChange={(e) => setNewPsychologist(prev => ({ ...prev, education: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="PhD in Clinical Psychology, University of Algiers"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={newPsychologist.bio}
                  onChange={(e) => setNewPsychologist(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[100px]"
                  placeholder="Brief professional biography..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === 'new'}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingId === 'new' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Psychologist
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
