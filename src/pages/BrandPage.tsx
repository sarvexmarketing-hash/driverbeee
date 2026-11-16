import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Car, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getBrandBySlug, getAllModels, getAllVehicles, resolveSlugRedirect } from '../services/slugService';
import { Brand, CarModel, VehicleListing } from '../types/seo';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NotFoundPage } from './NotFoundPage';

export const BrandPage: React.FC = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<CarModel[]>([]);
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolve() {
      if (!brandSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Check lowercase normalization: redirect if upper/mixed casing
      if (brandSlug !== brandSlug.toLowerCase()) {
        navigate(`/cars/${brandSlug.toLowerCase()}`, { replace: true });
        return;
      }

      // Check for historical 301 redirect
      const redirect = await resolveSlugRedirect('brand', brandSlug);
      if (redirect) {
        navigate(redirect.targetUrl, { replace: true });
        return;
      }

      const fetchedBrand = await getBrandBySlug(brandSlug);
      if (!fetchedBrand) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setBrand(fetchedBrand);

      const [m, v] = await Promise.all([
        getAllModels(brandSlug),
        getAllVehicles({ brandSlug }),
      ]);
      setModels(m);
      setVehicles(v);
      setLoading(false);
    }

    resolve();
  }, [brandSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950 text-white">
        <div className="w-10 h-10 border-4 border-bee-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !brand) {
    return <NotFoundPage />;
  }

  const breadcrumbs = [
    { label: 'Cars', url: '/cars' },
    { label: brand.name, url: `/cars/${brand.slug}`, current: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SeoHead
        title={`${brand.name} Drivers & Chauffeurs — Hire Verified Drivers | DriverBee`}
        description={`Hire certified personal car drivers for all ${brand.name} models in Telangana and Andhra Pradesh. Experienced chauffeurs for manual, automatic, and hybrid transmissions.`}
        canonicalUrl={`https://driverbee.in/cars/${brand.slug}`}
        breadcrumbs={breadcrumbs}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Brand',
          name: brand.name,
          description: brand.description,
          url: `https://driverbee.in/cars/${brand.slug}`,
          logo: brand.logo_url,
        }}
      />

      <Header selectedCity="Warangal, Telangana" onOpenCitySelector={() => {}} />

      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <Breadcrumbs items={breadcrumbs} />

        {/* Brand Header */}
        <div className="bg-white rounded-3xl border border-navy-200 p-6 sm:p-10 mb-10 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-bee-700 bg-bee-50 px-2.5 py-1 rounded-lg">
                  {brand.country || 'Automotive Manufacturer'}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Certified Drivers</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
                {brand.name} Drivers On Demand
              </h1>
              <p className="text-sm text-navy-600 mt-2 max-w-2xl leading-relaxed">
                {brand.description}
              </p>
            </div>

            <Link
              to="/"
              className="px-5 py-3 rounded-2xl bg-bee-600 hover:bg-bee-700 text-white font-bold text-sm shadow-cta transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Book Driver Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Compatible Models */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-950">
                {brand.name} Models Supported
              </h2>
              <p className="text-xs text-navy-500">
                Select your model to see specialized driver experience and hourly fares
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => {
              const modelUrl = `/cars/${brand.slug}/${model.slug}`;

              return (
                <div
                  key={model.id}
                  className="bg-white rounded-2xl border border-navy-200 overflow-hidden shadow-xs hover:shadow-card transition-all flex flex-col group"
                >
                  <div className="h-44 bg-navy-900 relative overflow-hidden">
                    <img
                      src={model.image_url}
                      alt={`${brand.name} ${model.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase">
                      {model.body_type}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-navy-950 mb-1 group-hover:text-bee-600 transition-colors">
                        {brand.name} {model.name}
                      </h3>
                      <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed mb-3">
                        {model.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs font-semibold text-navy-700">
                        <Award className="w-4 h-4 text-bee-600" />
                        <span>Transmission: {model.transmission}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-navy-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-navy-500">From ₹150 / hr</span>
                      <Link
                        to={modelUrl}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-bee-700 hover:text-bee-800"
                      >
                        <span>View Model Specs</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured Vehicles Under this Brand */}
        {vehicles.length > 0 && (
          <section>
            <div className="mb-5">
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-950">
                {brand.name} Vehicle Listings &amp; Packages
              </h2>
              <p className="text-xs text-navy-500">
                Direct booking for popular variants
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-white p-5 rounded-2xl border border-navy-200 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-navy-950 mb-1">{v.title}</h3>
                    <p className="text-xs text-navy-600 mb-3">{v.description}</p>
                    <div className="text-[11px] font-bold text-navy-500 flex gap-2">
                      <span>{v.year}</span>
                      <span>•</span>
                      <span>{v.transmission}</span>
                      <span>•</span>
                      <span>{v.fuel_type}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-navy-100 flex items-center justify-between">
                    <span className="text-sm font-black text-navy-950">₹{v.hourly_driver_rate} <span className="text-xs font-normal text-navy-500">/ hr</span></span>
                    <Link
                      to={`/cars/${brand.slug}/${v.model?.slug || 'model'}/${v.slug}`}
                      className="px-3 py-1.5 rounded-xl bg-bee-600 text-white font-bold text-xs hover:bg-bee-700 transition-colors"
                    >
                      Hire Driver
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};
