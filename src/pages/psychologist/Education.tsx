import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Award,
  CheckCircle,
  Star,
  ArrowRight,
  FileText,
  Video
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  category: string;
  instructor: string;
  image?: string;
  completed: boolean;
}

interface Certification {
  id: string;
  title: string;
  issuer: string;
  dateEarned?: string;
  expiryDate?: string;
  status: 'completed' | 'in-progress' | 'available';
}

interface Webinar {
  id: string;
  title: string;
  speaker: string;
  date: string;
  time: string;
  duration: string;
  registered: boolean;
}

type TabType = 'courses' | 'certifications' | 'webinars';

const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'webinars', label: 'Webinars', icon: Video },
];

export default function Education() {
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducationData();
  }, []);

  async function fetchEducationData() {
    try {
      // Fetch courses
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Course[];
      setCourses(coursesData);

      // Fetch certifications
      const certsSnap = await getDocs(collection(db, 'certifications'));
      const certsData = certsSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Certification[];
      setCertifications(certsData);

      // Fetch webinars
      const webinarsSnap = await getDocs(collection(db, 'webinars'));
      const webinarsData = webinarsSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Webinar[];
      setWebinars(webinarsData);
    } catch (error) {
      console.error('Error fetching education data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professional Development</h1>
          <p className="text-gray-500 mt-1">Enhance your skills and earn certifications</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-xl">
            {courses.filter(c => c.completed).length} Courses Completed
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              <p className="text-xs text-gray-500">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.completed).length}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{certifications.filter(c => c.status === 'completed').length}</p>
              <p className="text-xs text-gray-500">Certifications</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{webinars.filter(w => w.registered).length}</p>
              <p className="text-xs text-gray-500">Upcoming Webinars</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No courses available yet</p>
              <p className="text-sm text-gray-400 mt-1">Check back later for new learning opportunities</p>
            </div>
          ) : (
            courses.map((course) => (
              <div 
                key={course.id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        {course.category}
                      </span>
                      {course.completed && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-50 text-green-600 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span>By {course.instructor}</span>
                    </div>
                    {!course.completed && course.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="p-2 bg-gray-50 rounded-full group-hover:bg-primary/10 transition-colors">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'certifications' && (
        <div className="space-y-4">
          {certifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No certifications available yet</p>
            </div>
          ) : (
            certifications.map((cert) => (
              <div 
                key={cert.id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      cert.status === 'completed' ? 'bg-green-50' : 
                      cert.status === 'in-progress' ? 'bg-amber-50' : 'bg-gray-50'
                    }`}>
                      <Award className={`w-6 h-6 ${
                        cert.status === 'completed' ? 'text-green-600' : 
                        cert.status === 'in-progress' ? 'text-amber-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                      <p className="text-sm text-gray-500">{cert.issuer}</p>
                      {cert.dateEarned && (
                        <p className="text-xs text-gray-400 mt-1">Earned: {cert.dateEarned}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    cert.status === 'completed' ? 'bg-green-50 text-green-600' : 
                    cert.status === 'in-progress' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {cert.status === 'completed' ? 'Earned' : 
                     cert.status === 'in-progress' ? 'In Progress' : 'Available'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'webinars' && (
        <div className="space-y-4">
          {webinars.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming webinars</p>
            </div>
          ) : (
            webinars.map((webinar) => (
              <div 
                key={webinar.id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-50 rounded-xl">
                      <Play className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{webinar.title}</h3>
                      <p className="text-sm text-gray-500">Speaker: {webinar.speaker}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {webinar.date}
                        </span>
                        <span>{webinar.time}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {webinar.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    webinar.registered 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}>
                    {webinar.registered ? 'Registered' : 'Register'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
