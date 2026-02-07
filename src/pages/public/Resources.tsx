import { useState } from 'react';
import { BookOpen, Video, FileText, ExternalLink, Search, Filter, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicResources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'articles', name: 'Articles' },
    { id: 'videos', name: 'Videos' },
    { id: 'guides', name: 'Guides' },
    { id: 'tools', name: 'Self-Help Tools' },
  ];

  const resources = [
    {
      id: 1,
      title: 'Managing Exam Stress: A Complete Guide',
      category: 'guides',
      type: 'PDF Guide',
      icon: FileText,
      description: 'Learn effective strategies to manage stress during exam periods.',
      downloadable: true
    },
    {
      id: 2,
      title: 'Introduction to Mindfulness Meditation',
      category: 'videos',
      type: 'Video Course',
      icon: Video,
      description: 'A beginner-friendly series on mindfulness and meditation practices.',
      duration: '45 min'
    },
    {
      id: 3,
      title: 'Understanding Anxiety in University Students',
      category: 'articles',
      type: 'Article',
      icon: BookOpen,
      description: 'Comprehensive overview of anxiety disorders common among students.',
      readTime: '8 min read'
    },
    {
      id: 4,
      title: 'Sleep Hygiene Checklist',
      category: 'tools',
      type: 'Interactive Tool',
      icon: FileText,
      description: 'Track and improve your sleep habits with this interactive checklist.',
      downloadable: true
    },
    {
      id: 5,
      title: 'Building Healthy Relationships',
      category: 'articles',
      type: 'Article',
      icon: BookOpen,
      description: 'Tips for maintaining healthy relationships while balancing academics.',
      readTime: '6 min read'
    },
    {
      id: 6,
      title: 'Breathing Exercises for Anxiety',
      category: 'videos',
      type: 'Video',
      icon: Video,
      description: 'Quick breathing techniques you can use anywhere to calm anxiety.',
      duration: '10 min'
    },
    {
      id: 7,
      title: 'Depression: Signs and When to Seek Help',
      category: 'articles',
      type: 'Article',
      icon: BookOpen,
      description: 'Understanding depression symptoms and knowing when to get professional help.',
      readTime: '10 min read'
    },
    {
      id: 8,
      title: 'Daily Mood Tracker Template',
      category: 'tools',
      type: 'Downloadable',
      icon: FileText,
      description: 'A printable mood tracking sheet to monitor your emotional patterns.',
      downloadable: true
    },
  ];

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative py-24 bg-linear-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-heading font-display mb-6">
            Free Mental Health Resources
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            Explore our collection of articles, videos, and self-help tools to support your mental wellness journey.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-5 h-5 text-gray-400 mr-2" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted">No resources found matching your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <resource.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-text-muted bg-gray-100 px-2 py-1 rounded-full">
                      {resource.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-heading mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-text-muted text-sm mb-4">{resource.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {resource.downloadable ? (
                      <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    ) : (
                      <span className="text-xs text-text-muted">
                        {resource.readTime || resource.duration}
                      </span>
                    )}
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-text-muted hover:text-primary transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display mb-6">Need More Support?</h2>
          <p className="text-white/80 text-lg mb-8">
            Our resources are just the beginning. Connect with a professional for personalized guidance.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Talk to a Psychologist
          </Link>
        </div>
      </section>
    </div>
  );
}
