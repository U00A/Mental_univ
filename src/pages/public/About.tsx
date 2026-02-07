import { Heart, Users, Shield, Award, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const team = [
    {
      name: 'Dr. Sarah Ahmed',
      role: 'Director of Counseling Services',
      image: 'https://i.pravatar.cc/200?img=5',
      bio: 'Licensed clinical psychologist with 15+ years experience in university mental health.'
    },
    {
      name: 'Dr. Mohamed Benali',
      role: 'Senior Psychologist',
      image: 'https://i.pravatar.cc/200?img=12',
      bio: 'Specializes in student stress, anxiety, and academic performance.'
    },
    {
      name: 'Dr. Amira Khelifi',
      role: 'Wellness Coordinator',
      image: 'https://i.pravatar.cc/200?img=9',
      bio: 'Expert in group therapy and peer support programs.'
    },
  ];

  const values = [
    { icon: Heart, title: 'Compassion', desc: 'We approach every student with empathy and understanding.' },
    { icon: Shield, title: 'Confidentiality', desc: 'Your privacy is our absolute priority.' },
    { icon: Users, title: 'Accessibility', desc: 'Mental health support should be available to everyone.' },
    { icon: Award, title: 'Excellence', desc: 'We maintain the highest standards of professional care.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative py-24 bg-linear-to-br from-primary/10 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/20 text-primary font-medium text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>El Taref University Mental Health</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-heading font-display mb-6">
            About MindWell
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            MindWell is El Taref University's dedicated mental health platform, 
            providing students with accessible, confidential, and professional psychological support.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-semibold mb-4">
                <Target className="w-5 h-5" />
                Our Mission
              </div>
              <h2 className="text-3xl font-bold text-text-heading mb-6">
                Empowering Students Through Mental Wellness
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                We believe that every student deserves access to quality mental health care. 
                Our platform bridges the gap between students and professional support, making it 
                easier than ever to seek help, track progress, and build resilience.
              </p>
              <p className="text-text-muted leading-relaxed">
                Whether you're dealing with academic stress, personal challenges, or simply want 
                to improve your overall well-being, MindWell is here to support your journey.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/images/community_support_1770401023924.png" 
                alt="Community Support" 
                className="rounded-3xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-heading font-display mb-4">Our Core Values</h2>
            <p className="text-text-muted text-lg">The principles that guide everything we do.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-text-heading mb-2">{value.title}</h3>
                <p className="text-text-muted text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-heading font-display mb-4">Meet Our Team</h2>
            <p className="text-text-muted text-lg">Dedicated professionals committed to your well-being.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-text-heading">{member.name}</h3>
                  <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
                  <p className="text-text-muted text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display mb-6">Ready to Take the First Step?</h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of students who have already started their wellness journey with MindWell.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}
