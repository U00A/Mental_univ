import { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Check, 
  X,
  FileCheck,
  Clock,
  Mail,
  Shield,
  Loader2,
  Plus,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, query, where, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

interface PsychologistApplication {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  role: 'psychologist';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  status: 'active' | 'pending' | 'suspended';
  createdAt: Timestamp | null; // Using Timestamp to handle Firestore Timestamp
  // Professional info
  title?: string;
  licenseNumber?: string;
  specializations?: string[];
  yearsExperience?: number;
  education?: string;
  certifications?: string[];
  bio?: string;
  photoURL?: string;
  location?: string;
  sessionPrice?: number;
  languages?: string[];
  // Application documents
  applicationNotes?: string;
  rejectionReason?: string;
  verifiedAt?: Timestamp | null;
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
  const [verificationNote, setVerificationNote] = useState('');
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

      <div className="grid gap-6">
        {loading ? (
           <div className="flex justify-center py-12">
             <Loader2 className="w-8 h-8 animate-spin text-red-500" /> {/* Changed to red-500 for consistency */}
           </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <FileCheck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No {activeTab} applications</h3>
            <p className="text-gray-500">New applications will appear here</p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <div key={app.uid} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* ... User Info Section (Same as before) ... */}
                  <div className="shrink-0">
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white"> {/* Adjusted colors for consistency */}
                      {app.photoURL ? (
                        <img src={app.photoURL} alt={app.displayName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        app.displayName?.charAt(0) || 'P'
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{app.displayName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Mail className="w-3 h-3" />
                      {app.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="w-3 h-3" />
                      License: {app.licenseNumber}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    app.verificationStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    app.verificationStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {app.verificationStatus?.toUpperCase() || 'PENDING'}
                  </div>
                  <button 
                    onClick={() => setSelectedApp(app)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                  >
                    Review Application
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-2xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.15)] w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-gray-100/50 flex items-center justify-between sticky top-0 bg-white/20 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-gray-200/50 rounded-lg transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {selectedApp.displayName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedApp?.displayName}</h3>
                  <p className="text-gray-500">{selectedApp?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      selectedApp?.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      selectedApp?.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedApp?.verificationStatus?.toUpperCase() || 'PENDING'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Applied: {selectedApp?.createdAt && typeof selectedApp.createdAt.toDate === 'function' ? selectedApp.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Professional Info</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Title</dt>
                      <dd>{selectedApp.title || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">License Number</dt>
                      <dd>{selectedApp.licenseNumber || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Years of Experience</dt>
                      <dd>{selectedApp.yearsExperience || 0} years</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Contact & Location</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Phone</dt>
                      <dd>{selectedApp.phone || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Location</dt>
                      <dd>{selectedApp.location || 'Not specified'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Bio</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {selectedApp.bio || 'No bio provided.'}
                </p>
              </div>

              {selectedApp.verificationStatus === 'pending' && (
                <div className="border-t pt-6 space-y-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleApprove(selectedApp.uid)}
                      disabled={!!processingId}
                      className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                    >
                      {processingId === selectedApp.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve Application
                    </button>
                    <button 
                      onClick={() => handleReject(selectedApp.uid)}
                      disabled={!!processingId}
                      className="flex-1 btn bg-red-50 text-red-600 hover:bg-red-100 border-red-200 flex items-center justify-center gap-2"
                    >
                      {processingId === selectedApp.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      Reject Application
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Note (Optional)
                    </label>
                    <textarea
                      value={verificationNote}
                      onChange={(e) => setVerificationNote(e.target.value)}
                      placeholder="Add a note about this decision..."
                      className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-2xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.15)] p-8 max-w-2xl w-full transform transition-all animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Reject Application</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this application.</p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-4 border border-gray-200 rounded-xl text-sm min-h-[120px] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none bg-gray-50 focus:bg-white transition-all"
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={processingId === showRejectModal}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                {processingId === showRejectModal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject Application'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Psychologist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-2xl flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.15)] w-full max-w-4xl my-8 transform transition-all animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-gray-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 rounded-2xl">
                  <UserPlus className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Add New Psychologist</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100/50 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddPsychologist} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPsychologist.displayName}
                    onChange={(e) => setNewPsychologist(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
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
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                    placeholder="doctor@rahatek.dz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newPsychologist.phone}
                    onChange={(e) => setNewPsychologist(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
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
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                    placeholder="Clinical Psychologist"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    value={newPsychologist.licenseNumber}
                    onChange={(e) => setNewPsychologist(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
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
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
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
