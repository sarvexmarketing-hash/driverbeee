import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Star, ShieldCheck, ArrowRight, Clock, Award } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getDealerBySlug, resolveSlugRedirect } from '../services/slugService';
import { Dealer } from '../types/seo';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NotFoundPage } from './NotFoundPage';

export const DealerPage: React.FC = () => {
  const { citySlug, dealerSlug } = useParams<{ citySlug: string; dealerSlug: string }>();
  const navigate = useNavigate();

  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolve() {
      if (!citySlug || !dealerSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Check lowercase normalization
      const lowerC = citySlug.toLowerCase();
      const lowerD = dealerSlug.toLowerCase();
      if (citySlug !== lowerC || dealerSlug !== lowerD) {
        navigate(`/dealers/${lowerC}/${lowerD}`, { replace: true });
        return;
      }

      // Check historical 301 redirect
      const redirect = await resolveSlugRedirect('dealer', dealerSlug);
      if (redirect) {
        navigate(redirect.targetUrl, { replace: true });
        return;
      }

      const fetchedDealer = await getDealerBySlug(citySlug, dealerSlug);
      if (!fetchedDealer) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setDealer(fetchedDealer);
      setLoading(false);
    }

    resolve();
  }, [citySlug, dealerSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950 text-white">
        <div className="w-10 h-10 border-4 border-bee-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !dealer) {
    return <NotFoundPage />;
  }

  const breadcrumbs = [
    { label: 'Dealers & Hubs', url: '/#dealers' },
    { label: dealer.city_name, url: `/city/${citySlug}` },
    { label: dealer.name, url: `/dealers/${citySlug}/${dealer.slug}`, current: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SeoHead
        title={`${dealer.name} — ${dealer.city_name} Chauffeur & Driver Hub | DriverBee`}
        description={`${dealer.name} in ${dealer.city_name}. Authorized DriverBee driver dispatch, personal car chauffeur partner, and verified driver deployment.`}
        canonicalUrl={`https://driverbee.in/dealers/${citySlug}/${dealer.slug}`}
        breadcrumbs={breadcrumbs}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AutoDealer',
          name: dealer.name,
          url: `https://driverbee.in/dealers/${citySlug}/${dealer.slug}`,
          telephone: dealer.phone || '+917569402288',
          email: dealer.email || 'support@driverbee.in',
          address: {
            '@type': 'PostalAddress',
            streetAddress: dealer.address,
            addressLocality: dealer.city_name,
            addressCountry: 'IN',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(dealer.rating || 4.9),
            reviewCount: '150',
          },
        }}
      />

      <Header selectedCity={dealer.city_name} onOpenCitySelector={() => {}} />

      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <Breadcrumbs items={breadcrumbs} />

        <div className="bg-white rounded-3xl border border-navy-200 p-6 sm:p-10 mb-10 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-navy-100 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-bee-700 bg-bee-50 px-2.5 py-1 rounded-lg">
                  Authorized Partner Hub
                </span>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{dealer.rating} / 5.0 Rating</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
                {dealer.name}
              </h1>
              <p className="text-sm text-navy-600 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-bee-600 shrink-0" />
                <span>{dealer.address}</span>
              </p>
            </div>

            <Link
              to="/"
              className="px-6 py-3.5 rounded-2xl bg-bee-600 hover:bg-bee-700 text-white font-extrabold text-sm shadow-cta transition-all flex items-center gap-2 shrink-0"
            >
              <span>Book Driver At This Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-navy-50 rounded-2xl">
              <span className="text-[11px] text-navy-400 font-bold uppercase block mb-1">Direct Phone</span>
              <a href={`tel:${dealer.phone || '+917569402288'}`} className="text-sm font-extrabold text-navy-950 hover:text-bee-600 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{dealer.phone || '+91 75694 02288'}</span>
              </a>
            </div>

            <div className="p-4 bg-navy-50 rounded-2xl">
              <span className="text-[11px] text-navy-400 font-bold uppercase block mb-1">Email Support</span>
              <a href={`mailto:${dealer.email || 'support@driverbee.in'}`} className="text-sm font-extrabold text-navy-950 hover:text-bee-600 flex items-center gap-1.5 truncate">
                <Mail className="w-4 h-4 text-bee-600" />
                <span className="truncate">{dealer.email || 'support@driverbee.in'}</span>
              </a>
            </div>

            <div className="p-4 bg-navy-50 rounded-2xl">
              <span className="text-[11px] text-navy-400 font-bold uppercase block mb-1">Operating Hours</span>
              <div className="text-sm font-extrabold text-navy-950 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-navy-600" />
                <span>24/7 Dispatch Available</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
