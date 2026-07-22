import { Link, useOutletContext } from 'react-router-dom';
import { TurfSettings, Service } from '../types';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, ShieldCheck, Trophy, ChevronRight } from 'lucide-react';

export default function Home() {
  const { settings } = useOutletContext<{ settings: TurfSettings | null }>();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const defaultServices: Service[] = [
      {
        id: '1',
        name: '5-a-side Football Turf',
        description: 'Premium 5-a-side artificial grass turf enclosed with nets.',
        duration_minutes: 60,
        price: 50.00,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: '7-a-side Football Turf',
        description: 'Large 7-a-side artificial grass turf enclosed with nets.',
        duration_minutes: 60,
        price: 80.00,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Cricket Net Practice',
        description: 'Professional cricket practice nets with high-quality artificial turf.',
        duration_minutes: 60,
        price: 30.00,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    async function fetchServices() {
      try {
        const { data } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });
        
        if (data && data.length > 0) {
          setServices(data);
        } else {
          // Robust preview fallback if Supabase returns nothing
          setServices(defaultServices);
        }
      } catch (err) {
        console.error('Error fetching services, falling back to defaults:', err);
        setServices(defaultServices);
      }
    }
    fetchServices();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/turf_hero_nets.png" 
            alt="Football Turf at Night" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-turf-900/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-turf-900 via-turf-900/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-turf-900 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center md:text-left">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-turf-green/10 border border-turf-green/20 text-turf-green text-sm font-semibold mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-turf-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-turf-green"></span>
              </span>
              Premium Sports Facility
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Elevate Your Game at <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-turf-green to-emerald-400">
                {settings?.turf_name || 'The Arena'}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              Book world-class floodlit pitches for 5-a-side, 7-a-side, and cricket nets. Professional grade turf designed for players who demand the best.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 md:justify-start justify-center">
              <Link 
                to="/book" 
                className="w-full sm:w-auto bg-turf-green hover:bg-turf-green-hover text-turf-900 font-bold px-8 py-4 rounded-full transition-all shadow-[0_0_20px_rgba(0,255,135,0.3)] hover:shadow-[0_0_40px_rgba(0,255,135,0.5)] flex items-center justify-center gap-2"
              >
                Book Your Pitch
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a 
                href="#services" 
                className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-white border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-center"
              >
                View Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-turf-900 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Trophy, title: 'Pro-Grade Turf', desc: 'FIFA-approved artificial grass for perfect ball roll and shock absorption.' },
              { icon: Clock, title: 'Floodlit Arena', desc: 'High-intensity LED stadium lighting for perfect visibility during evening matches.' },
              { icon: ShieldCheck, title: 'Secure & Safe', desc: 'Fully enclosed pitches with premium netting and regular maintenance.' }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-turf-800 border border-white/5 hover:border-turf-green/30 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-turf-900 border border-white/5 flex items-center justify-center text-turf-green mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-turf-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-64 -mt-64 w-[500px] h-[500px] bg-turf-green/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Pitches & Services</h2>
            <p className="text-slate-400 text-lg">Choose from our premium selection of sports facilities. Available for hourly booking.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="group bg-turf-800 rounded-3xl overflow-hidden border border-white/5 hover:border-turf-green/50 transition-all hover:shadow-[0_0_30px_rgba(0,255,135,0.1)] flex flex-col">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <div className="absolute inset-0 bg-turf-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={
                      service.name.toLowerCase().includes('cricket') 
                        ? "/cricket_nets.png"
                        : "/football_turf_nets.png"
                    } 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 z-20 bg-turf-900/90 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full text-turf-green font-bold text-sm">
                    ${service.price} / {service.duration_minutes}m
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-display font-bold text-white mb-3">{service.name}</h3>
                  <p className="text-slate-400 mb-8 flex-1">{service.description}</p>
                  
                  <Link 
                    to={`/book?service=${service.id}`}
                    className="w-full py-4 rounded-xl font-bold text-center border-2 border-turf-green text-turf-green hover:bg-turf-green hover:text-turf-900 transition-all"
                  >
                    Select Pitch
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-turf-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-turf-green/20 to-transparent rounded-3xl transform -translate-x-4 translate-y-4"></div>
              <img 
                src="/football_turf_nets.png" 
                alt="Players on turf" 
                className="relative rounded-3xl object-cover aspect-[4/5] md:aspect-square w-full shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Built for Players, By Players</h2>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                We know what makes a great game. That's why we invested in the highest quality 4G artificial grass, professional stadium lighting, and top-tier facilities.
              </p>
              <p className="text-lg text-slate-300 mb-10 leading-relaxed">
                Whether it's a competitive league match, a casual kickabout with friends, or serious net practice, {settings?.turf_name || 'our facility'} provides the ultimate environment for your game.
              </p>
              
              <Link 
                to="/book" 
                className="inline-flex items-center gap-2 text-turf-green font-bold text-lg hover:text-white transition-colors"
              >
                Book your next game <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
