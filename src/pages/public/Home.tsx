import { ArrowRight, Video, Calendar, Shield, Users, Heart, Star, Activity, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getPlatformStats } from '@/lib/firestore';

interface PlatformStats {
  studentsHelped: string;
  sessionsCompleted: string;
  psychologists: string;
  yearsOfSupport: string;
}

export default function Home() {
  const [stats, setStats] = useState<PlatformStats>({
    studentsHelped: '0',
    sessionsCompleted: '0',
    psychologists: '0',
    yearsOfSupport: '10+' // Stays constant as it's platform age/availability
  });

  useEffect(() => {
    console.log("Rahatek Platform v2 - Fetching Real Stats (No Defaults)");
    const fetchStats = async () => {
      try {
        const statsData = await getPlatformStats();
        
        // Directly set whatever comes from the DB, even if 0
        setStats({
            studentsHelped: `${statsData.studentsCount}`,
            sessionsCompleted: `${statsData.sessionsCount}`,
            psychologists: `${statsData.psychologistsCount}`,
            yearsOfSupport: '10+' 
        });
        
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-linear-to-br from-indigo-50 via-white to-green-50">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-primary/20 text-primary font-medium text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Trusted by El Taref University Students</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-text-heading font-display leading-tight">
                Your Mental Wellness <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary-light">
                  Journey Starts Here
                </span>
              </h1>
              
              <p className="text-xl text-text-muted leading-relaxed max-w-lg">
                Access professional psychological support, tracking tools, and a supportive community. 
                Confidential, accessible, and tailored for your university life.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4 shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1 transition-all duration-300">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/about" className="px-8 py-4 rounded-xl bg-white text-text-heading font-semibold border border-border hover:bg-gray-50 flex items-center justify-center gap-2 transition-all duration-300">
                  Learn More
                </Link>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {stats.studentsHelped.replace('+', '')}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-text-muted font-medium">from happy students</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in-left hidden lg:block">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="/images/hero_wellness_1770401125288.png" 
                  alt="Mental Wellness" 
                  className="w-full h-auto object-cover"
                />
                {/* Floating Cards */}
                <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-medium">Daily Mood</p>
                      <p className="text-sm font-bold text-text-heading">Improving</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-12 left-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 animate-float-delayed">
                   <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-medium">Status</p>
                      <p className="text-sm font-bold text-text-heading">100% Confidential</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements behind image */}
              <div className="absolute -z-10 top-10 -right-10 w-full h-full border-2 border-primary/20 rounded-3xl transform rotate-6" />
              <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-dots-pattern opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 bg-white relative">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl font-bold text-text-heading font-display mb-4">Comprehensive Support For You</h2>
             <p className="text-text-muted text-lg">We provide a holistic approach to mental well-being, combining professional care with self-help tools.</p>
           </div>

           <div className="space-y-24">
             {/* Feature 1 */}
             <div className="flex flex-col lg:flex-row items-center gap-12">
               <div className="lg:w-1/2 relative">
                 <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                   <img src="/images/video_consultation_1770401004363.png" alt="Video Consultation" className="w-full" />
                 </div>
                 <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                   <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                     <Video className="w-6 h-6" />
                   </div>
                   <div>
                     <div className="font-bold text-lg">HD Quality</div>
                     <div className="text-sm text-text-muted">Secure Calls</div>
                   </div>
                 </div>
               </div>
               <div className="lg:w-1/2 space-y-6">
                 <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                   <Video className="w-6 h-6" />
                 </div>
                 <h3 className="text-3xl font-bold text-text-heading">Virtual Therapy Sessions</h3>
                 <p className="text-lg text-text-muted leading-relaxed">
                   Connect with licensed university psychologists from the comfort and privacy of your dorm or home. 
                   Our secure video platform ensures your conversations remain confidential.
                 </p>
                 <ul className="space-y-3">
                   {['Easy scheduling', 'Encrypted connection', 'No waiting rooms'].map((item) => (
                     <li key={item} className="flex items-center gap-3 text-text-heading font-medium">
                       <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                       </div>
                       {item}
                     </li>
                   ))}
                 </ul>
               </div>
             </div>

             {/* Feature 2 */}
             <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
               <div className="lg:w-1/2 relative">
                 <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                   <img src="/images/therapy_session_1770401139939.png" alt="Therapy Session" className="w-full" />
                 </div>
               </div>
               <div className="lg:w-1/2 space-y-6">
                 <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                   <Users className="w-6 h-6" />
                 </div>
                 <h3 className="text-3xl font-bold text-text-heading">In-Person & Group Support</h3>
                 <p className="text-lg text-text-muted leading-relaxed">
                   Prefer face-to-face interaction? Book in-person appointments at the university counseling center 
                   or join support groups to connect with peers facing similar challenges.
                 </p>
                  <Link to="/psychologists" className="btn-primary inline-flex items-center gap-2 mt-4">
                    Find a Psychologist
                    <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
             </div>
           </div>
         </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Students Helped', value: stats.studentsHelped, icon: Users },
              { label: 'Sessions Completed', value: stats.sessionsCompleted, icon: Video },
              { label: 'Psychologists', value: stats.psychologists, icon: Heart },
              { label: 'Years of Support', value: stats.yearsOfSupport, icon: Calendar },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
                <stat.icon className="w-8 h-8 mx-auto mb-4 opacity-80" />
                <div className="text-4xl font-bold font-display mb-2">{stat.value}</div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-heading font-display mb-4">How Rahatek Works</h2>
            <p className="text-text-muted text-lg">Get the help you need in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', 
                title: 'Create Account', 
                desc: 'Sign up securely with your university credentials to ensure privacy.',
                bg: 'bg-blue-100', text: 'text-blue-600'
              },
              { 
                step: '02', 
                title: 'Choose Support', 
                desc: 'Browse psychologists, join a group, or access self-help resources.',
                bg: 'bg-purple-100', text: 'text-purple-600'
              },
              { 
                step: '03', 
                title: 'Start Wellness', 
                desc: 'Attend sessions, track your mood, and build resilience.',
                bg: 'bg-green-100', text: 'text-green-600'
              }
            ].map((item) => (
              <div key={item.step} className="bg-white p-8 rounded-2xl shadow-sm border border-border relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className={`absolute top-0 right-0 p-4 font-display font-bold text-6xl opacity-10 ${item.text}`}>
                  {item.step}
                </div>
                <div className={`w-14 h-14 rounded-xl ${item.bg} ${item.text} flex items-center justify-center mb-6 text-xl font-bold`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-text-heading mb-3">{item.title}</h3>
                <p className="text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
