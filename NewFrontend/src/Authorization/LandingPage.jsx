import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('features');
  
  // Data
  const stats = [
    { number: '10K+', label: 'Active Alumni' },
    { number: '500+', label: 'Institute Partners' },
    { number: '2K+', label: 'Mentors' },
    { number: '150+', label: 'Global Events' },
  ];
  
  const features = [
    { icon: '💬', title: 'Chat', description: 'Connect directly with alumni through our secure messaging platform' },
    { icon: '🎥', title: 'Video Calls', description: 'Schedule and conduct virtual meetings for mentorship or networking' },
    { icon: '👥', title: 'Mentorship', description: 'Find experienced mentors in your field or become one yourself' },
    { icon: '🔗', title: 'Referrals', description: 'Access job opportunities and professional recommendations' },
    { icon: '📅', title: 'Events', description: 'Participate in exclusive webinars, workshops and meetups' },
    { icon: '📚', title: 'Resources', description: 'Access a library of career guides and educational materials' }
  ];
  
  const testimonials = [
    { name: 'Sarah J.', role: 'Software Engineer', text: 'This network helped me land my dream job. The mentorship program was invaluable.' },
    { name: 'Michael T.', role: 'Marketing Director', text: 'I\'ve connected with amazing professionals who have become both colleagues and friends.' },
    { name: 'Priya K.', role: 'Research Scientist', text: 'The knowledge sharing in this community has accelerated my career growth tremendously.' }
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-800 min-h-screen text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 pt-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Connect, Learn, and Grow</h1>
          <p className="text-xl md:text-2xl text-purple-200 mb-8">Join our thriving community of professionals and expand your network</p>
          
          <div className="flex justify-center gap-4">
            <button className="bg-white text-indigo-900 px-6 py-3 rounded-lg font-bold hover:bg-purple-100 transition">
              <Link to='/signup'>Sign Up</Link>
            </button>
            <button className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition">
              <Link to='/Login'>Login</Link>
            </button>
          </div>
        </header>
        
        {/* Stats */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Why Join Our Network?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 p-6 rounded-lg text-center backdrop-blur-sm hover:bg-white/20 transition">
                <p className="text-3xl md:text-4xl font-bold text-purple-300">{stat.number}</p>
                <p className="text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/10 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('features')} 
              className={`px-4 py-2 rounded-md ${activeTab === 'features' ? 'bg-white text-indigo-900 font-bold' : 'text-white/80'}`}
            >
              Features
            </button>
            <button 
              onClick={() => setActiveTab('testimonials')} 
              className={`px-4 py-2 rounded-md ${activeTab === 'testimonials' ? 'bg-white text-indigo-900 font-bold' : 'text-white/80'}`}
            >
              Testimonials
            </button>
          </div>
        </div>
        
        {/* Features */}
        {activeTab === 'features' && (
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/10 p-6 rounded-lg backdrop-blur-sm hover:translate-y-[-5px] transition duration-300">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-purple-200">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Testimonials */}
        {activeTab === 'testimonials' && (
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-purple-400 mr-4 flex items-center justify-center font-bold text-indigo-900">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-purple-300 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="text-yellow-400 mb-2">★★★★★</div>
                    <p className="italic">"{testimonial.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* CTA */}
        <section className="text-center mb-16">
          <div className="bg-white/20 p-8 rounded-lg backdrop-blur-md">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p className="text-purple-200 mb-6">Take the next step in your professional journey today.</p>
            <button className="bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-4 rounded-lg font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition">
              Get Started Now
            </button>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="text-center text-sm text-purple-300 py-8">
          <p>© 2025 Alumni Network Platform. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};
export default LandingPage;

