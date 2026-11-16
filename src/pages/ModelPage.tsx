import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Award, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getModelBySlug, getAllVehicles, resolveSlugRedirect } from '../services/slugService';
import { CarModel, VehicleListing } from '../types/seo';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NotFoundPage } from './NotFoundPage';

export const ModelPage: React.FC = () => {
  const { brandSlug, modelSlug } = useParams<{ brandSlug: string; modelSlug: string }>();
  const navigate = useNavigate();

  const [model, setModel] = useState<CarModel | null>(null);
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolve() {
      if (!brandSlug || !modelSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Check lowercase normalization
      if (brandSlug !== brandSlug.toLowerCase() || modelSlug !== modelSlug.toLowerCase()) {
        navigate(`/cars/${brandSlug.toLowerCase()}/${modelSlug.toLowerCase()}`, { replace: true });
        return;
      }

      // Check for historical 301 redirect
      const redirect = await resolveSlugRedirect('model', modelSlug);
      if (redirect) {
        navigate(redirect.targetUrl, { replace: true });
        return;
      }

      const fetchedModel = await getModelBySlug(brandSlug, modelSlug);
      if (!fetchedModel) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setModel(fetchedModel);

      const v = await getAllVehicles({ brandSlug, modelSlug });
      setVehicles(v);
      setLoading(false);
    }

    resolve();
  }, [brandSlug, modelSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950 text-white">
        <div className="w-10 h-10 border-4 border-bee-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !model) {
    return <NotFoundPage />;
  }

  const brandName = model.brand?.name || 'Brand';
  const breadcrumbs = [
    { label: 'Cars', url: '/cars' },
    { label: brandName, url: `/cars/${model.brand?.slug || brandSlug}` },
    { label: model.name, url: `/cars/${brandSlug}/${model.slug}`, current: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SeoHead
        title={`${brandName} ${model.name} Drivers On Demand — Hire Chauffeur | DriverBee`}
        description={`Book verified, background-checked professional drivers for your ${brandName} ${model.name}. Experienced with ${model.transmission} transmission and long-distance highway travel.`}
        canonicalUrl={`https://driverbee.in/cars/${brandSlug}/${model.slug}`}
        breadcrumbs={breadcrumbs}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: `${brandName} ${model.name}`,
          description: model.description,
          image: model.image_url,
          brand: {
            '@type': 'Brand',
            name: brandName,
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: '150.00',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '150.00',
              priceCurrency: 'INR',
              unitText: 'HOUR',
            },
            availability: 'https://schema.org/InStock',
          },
        }}
      />

      <Header selectedCity="Warangal, Telangana" onOpenCitySelector={() => {}} />

      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <Breadcrumbs items={breadcrumbs} />

        {/* Model Hero */}
        <div className="bg-white rounded-3xl border border-navy-200 overflow-hidden shadow-xs mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="h-64 lg:h-auto bg-navy-900 relative">
              <img
                src={model.image_url}
                alt={`${brandName} ${model.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-navy-950/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-xl uppercase">
                {model.body_type}
              </div>
            </div>

            <div className="p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-bee-700 bg-bee-50 px-2.5 py-1 rounded-lg">
                    {brandName}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>7-Point Verified Driver</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-navy-950 tracking-tight mb-3">
                  {brandName} {model.name} Chauffeur Services
                </h1>

                <p className="text-sm text-navy-600 leading-relaxed mb-6">
                  {model.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-navy-50 rounded-xl">
                    <span className="text-[11px] text-navy-400 font-bold block uppercase">Transmission Support</span>
                    <span className="text-sm font-extrabold text-navy-900">{model.transmission}</span>
                  </div>
                  <div className="p-3 bg-navy-50 rounded-xl">
                    <span className="text-[11px] text-navy-400 font-bold block uppercase">Body Classification</span>
                    <span className="text-sm font-extrabold text-navy-900 uppercase">{model.body_type}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-navy-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-navy-400 block font-semibold">Starting Rate</span>
                  <span className="text-lg font-black text-navy-950">₹150 <span className="text-xs font-normal text-navy-500">/ hour</span></span>
                </div>

                <Link
                  to="/"
                  className="px-6 py-3 rounded-2xl bg-bee-600 hover:bg-bee-700 text-white font-bold text-sm shadow-cta transition-all flex items-center gap-2"
                >
                  <span>Book Driver For {model.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Available Vehicle Listings for this model */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-navy-950">
              Popular {model.name} Variations &amp; Driver Packages
            </h2>
            <p className="text-xs text-navy-500">
              Select your exact specification for customized driver assignment
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-navy-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-card transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-bee-700 mb-1">
                    <span>{v.year} Model</span>
                    <span>{v.transmission}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-navy-950 mb-2">{v.title}</h3>
                  <p className="text-xs text-navy-600 leading-relaxed mb-4">{v.description}</p>
                </div>

                <div className="pt-3 border-t border-navy-100 flex items-center justify-between">
                  <span className="text-sm font-black text-navy-950">₹{v.hourly_driver_rate} <span className="text-xs font-normal text-navy-500">/ hr</span></span>
                  <Link
                    to={`/cars/${brandSlug}/${modelSlug}/${v.slug}`}
                    className="px-4 py-2 rounded-xl bg-bee-600 hover:bg-bee-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>View Variant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
