import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Clock, CheckCircle2, ArrowRight, Phone, Car } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getCityBySlug, resolveSlugRedirect } from '../services/slugService';
import { CityHub } from '../types/seo';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NotFoundPage } from './NotFoundPage';

export const CityHubPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();

  const [city, setCity] = useState<CityHub | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolve() {
      if (!citySlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Check lowercase normalization
      if (citySlug !== citySlug.toLowerCase()) {
        navigate(`/city/${citySlug.toLowerCase()}`, { replace: true });
        return;
      }

      // Check historical 301 redirect
      const redirect = await resolveSlugRedirect('city', citySlug);
      if (redirect) {
        navigate(redirect.targetUrl, { replace: true });
        return;
      }

      const fetchedCity = await getCityBySlug(citySlug);
      if (!fetchedCity) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCity(fetchedCity);
      setLoading(false);
    }

    resolve();
  }, [citySlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950 text-white">
        <div className="w-10 h-10 border-4 border-bee-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !city) {
    return <NotFoundPage />;
  }

  const breadcrumbs = [
    { label: 'Cities', url: '/#locations' },
    { label: city.name, url: `/city/${city.slug}`, current: true },
  ];

  const handleBookInCity = () => {
    try {
      localStorage.setItem('driverbee_user_location', `${city.name}, ${city.state}`);
      localStorage.setItem('driverbee_user_manual_city', 'true');
    } catch {}
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SeoHead
        title={`Hire Personal Drivers in ${city.name}, ${city.state} — DriverBee`}
        description={city.meta_description || `Book verified, background-checked professional drivers in ${city.name} on demand. 30-minute doorstep arrival for hourly city drives and outstation highway trips.`}
        canonicalUrl={`https://driverbee.in/city/${city.slug}`}
        breadcrumbs={breadcrumbs}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: `DriverBee ${city.name}`,
          description: city.meta_description,
          url: `https://driverbee.in/city/${city.slug}`,
          telephone: '+917569402288',
          areaServed: {
            '@type': 'City',
            name: city.name,
            containedInPlace: {
              '@type': 'State',
              name: city.state,
            },
          },
          priceRange: '₹₹',
        }}
      />

      <Header selectedCity={`${city.name}, ${city.state}`} onOpenCitySelector={() => {}} />

      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <Breadcrumbs items={breadcrumbs} />

        {/* City Hero */}
        <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-6 sm:p-12 mb-10 shadow-xl border border-navy-800 relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bee-500/20 text-bee-400 font-bold text-xs uppercase tracking-wider mb-4 border border-bee-500/30">
              <MapPin className="w-3.5 h-3.5" />
              <span>Active Service Hub • {city.state}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
              Hire Verified Personal Car Drivers in {city.name}
            </h1>

            <p className="text-sm sm:text-base text-navy-200 leading-relaxed mb-8">
              {city.meta_description}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleBookInCity}
                className="px-6 py-3.5 rounded-2xl bg-bee-600 hover:bg-bee-500 text-navy-950 font-black text-sm shadow-cta transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Book a Driver in {city.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="tel:+917569402288"
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Helpline</span>
              </a>
            </div>
          </div>
        </div>

        {/* Operating Localities */}
        {city.popular_areas && city.popular_areas.length > 0 && (
          <section className="bg-white rounded-3xl border border-navy-200 p-6 sm:p-8 mb-10 shadow-xs">
            <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 mb-2">
              Popular Operating Zones &amp; Localities in {city.name}
            </h2>
            <p className="text-xs text-navy-500 mb-6">
              Our drivers reach any doorstep in these areas within 30 minutes of booking.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {city.popular_areas.map((area) => (
                <div
                  key={area}
                  className="p-3 bg-navy-50/70 border border-navy-100 rounded-xl text-xs font-bold text-navy-800 flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-bee-600 flex-shrink-0" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Service Options in City */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-navy-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-bee-100 text-bee-800 flex items-center justify-center font-bold text-lg mb-3">
                🚗
              </div>
              <h3 className="text-base font-extrabold text-navy-950 mb-1.5">Within City Hourly Rides</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                Need a driver for shopping, family hospital visits, or attending weddings in {city.name}? Hire by the hour from ₹150/hr.
              </p>
            </div>
            <button
              onClick={handleBookInCity}
              className="mt-4 pt-3 border-t border-navy-100 text-xs font-bold text-bee-700 hover:text-bee-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Book Hourly Driver</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-navy-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg mb-3">
                🛣️
              </div>
              <h3 className="text-base font-extrabold text-navy-950 mb-1.5">Outstation &amp; Highway Trips</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                Highway-certified chauffeurs for round trips originating from {city.name} across Telangana and Andhra Pradesh.
              </p>
            </div>
            <button
              onClick={handleBookInCity}
              className="mt-4 pt-3 border-t border-navy-100 text-xs font-bold text-bee-700 hover:text-bee-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Book Outstation Chauffeur</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-navy-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg mb-3">
                🌙
              </div>
              <h3 className="text-base font-extrabold text-navy-950 mb-1.5">Late Night Safe Drops</h3>
              <p className="text-xs text-navy-600 leading-relaxed">
                Party late or dinner outings without worry. Our sober, verified driver drives you and your car home safely.
              </p>
            </div>
            <button
              onClick={handleBookInCity}
              className="mt-4 pt-3 border-t border-navy-100 text-xs font-bold text-bee-700 hover:text-bee-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Book Night Ride</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
