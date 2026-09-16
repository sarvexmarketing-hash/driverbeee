import React from 'react';
import { 
  Quote, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Linkedin, 
  Mail, 
  Award, 
  CheckCircle2,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface FoundersSectionProps {
  onBookClick?: () => void;
}

export const FoundersSection: React.FC<FoundersSectionProps> = ({ onBookClick }) => {
  return (
    <section id="founder-section" className="py-16 sm:py-24 bg-gradient-to-b from-white via-[#F7FAFD] to-white border-t border-navy-100/80 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-bee-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-bee-50 border border-bee-200/80 rounded-full text-bee-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-bee-600" />
            Leadership & Vision
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-navy-950 tracking-tight leading-tight">
            Meet the Mind Behind <br className="hidden sm:inline" />
            <span className="relative inline-block">
              <span className="relative z-10 text-bee-600">DriverBee</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-bee-200/60 -z-0 rounded-full transform -rotate-1" />
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-navy-600 max-w-2xl mx-auto">
            Driven by a commitment to safety, driver dignity, and seamless mobility for every car owner.
          </p>
        </div>

        {/* Founder Showcase Card */}
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-navy-200/70 shadow-card p-6 sm:p-10 lg:p-12 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Portrait & Quick Credentials */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[360px] group">
                
                {/* Decorative background glow frame */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-bee-500/30 via-amber-400/20 to-blue-600/20 rounded-[36px] blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
                
                {/* Image Container */}
                <div className="relative rounded-[32px] overflow-hidden border-4 border-white shadow-2xl bg-navy-50 aspect-square">
                  <img
                    src="/viswa-teja.jpg"
                    alt="Mr. Viswa Teja - Founder of DriverBee"
                    className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Gradient Overlay for Tag */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent pointer-events-none" />

                  {/* Bottom Floating Badge inside photo */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-white/40 shadow-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-navy-950">Mr. Viswa Teja</h4>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                      </div>
                      <p className="text-[11px] font-semibold text-bee-700">Founder & CEO, DriverBee</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-navy-500">
                      <MapPin className="w-3.5 h-3.5 text-bee-600" />
                      <span className="text-[11px] font-medium text-navy-700">Warangal</span>
                    </div>
                  </div>
                </div>

                {/* Floating Experience / Trust Chip */}
                <div className="absolute -top-4 -right-3 sm:-right-4 bg-navy-950 text-white px-3.5 py-2 rounded-2xl shadow-xl border border-navy-800 flex items-center gap-2 animate-bounce-subtle">
                  <div className="w-2.5 h-2.5 rounded-full bg-bee-400 animate-pulse" />
                  <span className="text-xs font-bold tracking-wide">Visionary Leader</span>
                </div>
              </div>

              {/* Founder Social & Contact Quick Links */}
              <div className="flex items-center gap-3 mt-6">
                <a
                  href="mailto:viswa@driverbee.in"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-navy-50 hover:bg-bee-50 border border-navy-200/80 hover:border-bee-300 text-xs font-semibold text-navy-700 hover:text-navy-950 transition-colors shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-bee-600" />
                  <span>Connect with Founder</span>
                </a>
                <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-navy-50 border border-navy-200/80 text-xs font-medium text-navy-600">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tech Innovator</span>
                </div>
              </div>
            </div>

            {/* Right Column: Founder's Story, Vision & Pillars */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              {/* Role & Name Header */}
              <div>
                <div className="flex items-center gap-2 text-bee-600 text-xs sm:text-sm font-bold tracking-wider uppercase mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Founder's Perspective
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-navy-950">
                  "You worked hard to buy your car. You deserve to enjoy every journey in it."
                </h3>
              </div>

              {/* Founder's Personal Message */}
              <div className="relative bg-navy-50/60 rounded-3xl p-5 sm:p-7 border border-navy-100/90 text-navy-700 text-sm sm:text-[15px] leading-relaxed">
                <Quote className="w-8 h-8 text-bee-500/40 mb-2 transform -scale-x-100" />
                <p className="font-normal text-navy-800">
                  When I observed the daily commuting challenges in both Telugu states (Andhra Pradesh and Telangana), one thing stood out: car owners love their vehicles, but chaotic traffic, parking headaches, late-night returns, and highway fatigue turn driving into a daily chore.
                </p>
                <p className="mt-3 font-normal text-navy-800">
                  At <strong className="text-navy-950">DriverBee</strong>, we asked a fundamental question: <em className="text-bee-700 font-medium">Why buy a second car or hire expensive cabs when you can have a verified, courteous driver take the wheel of your own car?</em>
                </p>
                <p className="mt-3 font-normal text-navy-800">
                  We built this platform with unbending pillars of trust, strict 7-point driver verification, and authentic respect for our driver partners. Thank you for welcoming DriverBee into your daily lives and trusting us with your family.
                </p>

                <div className="mt-5 pt-4 border-t border-navy-200/60 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-navy-950 text-base">Mr. Viswa Teja</div>
                    <div className="text-xs text-navy-500">Founder & CEO, DriverBee Technologies</div>
                  </div>
                  <div className="font-script text-2xl sm:text-3xl text-navy-900 tracking-wider select-none transform -rotate-2">
                    Viswa Teja
                  </div>
                </div>
              </div>

              {/* 3 Core Commitments under his leadership */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="bg-white p-4 rounded-2xl border border-navy-100 shadow-xs hover:border-bee-200 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-bee-50 text-bee-700 flex items-center justify-center mb-2.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-navy-950">Zero Compromise on Safety</h5>
                  <p className="text-[11px] text-navy-600 mt-1 leading-snug">
                    Official background clearances, biometric checks, and 5+ years of verified clean records.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-navy-100 shadow-xs hover:border-emerald-200 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-navy-950">Family-Centric Care</h5>
                  <p className="text-[11px] text-navy-600 mt-1 leading-snug">
                    Gentle drivers trained in senior citizen courtesy & child commute safety.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-navy-100 shadow-xs hover:border-blue-200 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-navy-950">Driver Dignity & Growth</h5>
                  <p className="text-[11px] text-navy-600 mt-1 leading-snug">
                    Fair, instant payouts, professional onboarding, and respect for every driver.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Founder Stats Bar */}
          <div className="mt-10 sm:mt-12 pt-8 border-t border-navy-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-navy-950">10,000+</div>
              <div className="text-xs font-medium text-navy-500 mt-0.5">Trips Safely Executed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-bee-600">4.9 ★</div>
              <div className="text-xs font-medium text-navy-500 mt-0.5">Average Customer Rating</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
              <div className="text-xs font-medium text-navy-500 mt-0.5">Background Verified Drivers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600">30 Min</div>
              <div className="text-xs font-medium text-navy-500 mt-0.5">Average Express Dispatch</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
