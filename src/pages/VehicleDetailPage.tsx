import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Clock, MapPin, Award, Star, ArrowRight, Zap, Phone } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getVehicleBySlug, resolveSlugRedirect } from '../services/slugService';
import { VehicleListing } from '../types/seo';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NotFoundPage } from './NotFoundPage';

export const VehicleDetailPage: React.FC = () => {
  const { brandSlug, modelSlug, vehicleSlug } = useParams<{
    brandSlug: string;
    modelSlug: string;
    vehicleSlug: string;
  }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<VehicleListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolve() {
      if (!brandSlug || !modelSlug || !vehicleSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Check lowercase normalization
      const lowerB = brandSlug.toLowerCase();
      const lowerM = modelSlug.toLowerCase();
      const lowerV = vehicleSlug.toLowerCase();
      if (brandSlug !== lowerB || modelSlug !== lowerM || vehicleSlug !== lowerV) {
        navigate(`/cars/${lowerB}/${lowerM}/${lowerV}`, { replace: true });
        return;
      }

      // Check historical 301 redirect
      const redirect = await resolveSlugRedirect('vehicle', vehicleSlug);
      if (redirect) {
        navigate(redirect.targetUrl, { replace: true });
        return;
      }

      const fetchedVehicle = await getVehicleBySlug(brandSlug, modelSlug, vehicleSlug);
      if (!fetchedVehicle) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setVehicle(fetchedVehicle);
      setLoading(false);
    }

    resolve();
  }, [brandSlug, modelSlug, vehicleSlug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950 text-white">
        <div className="w-10 h-10 border-4 border-bee-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !vehicle) {
    return <NotFoundPage />;
  }

  const brandName = vehicle.model?.brand?.name || 'Brand';
  const modelName = vehicle.model?.name || 'Model';

  const breadcrumbs = [
    { label: 'Cars', url: '/cars' },
    { label: brandName, url: `/cars/${vehicle.model?.brand?.slug || brandSlug}` },
    { label: modelName, url: `/cars/${brandSlug}/${modelSlug}` },
    { label: vehicle.title, url: `/cars/${brandSlug}/${modelSlug}/${vehicle.slug}`, current: true },
  ];

  const handleBookNow = () => {
    try {
      localStorage.setItem('driverbee_prefilled_car_model', vehicle.title);
      localStorage.setItem('driverbee_prefilled_car_type', vehicle.body_type.toLowerCase());
    } catch {}
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SeoHead
        title={`${vehicle.title} Driver On Demand — Verified Personal Chauffeur | DriverBee`}
        description={`Book certified personal car drivers for ${vehicle.title}. Professional ${vehicle.transmission} transmission specialist drivers arriving at your doorstep in 30 minutes.`}
        canonicalUrl={`https://driverbee.in/cars/${brandSlug}/${modelSlug}/${vehicle.slug}`}
        breadcrumbs={breadcrumbs}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Car',
          name: vehicle.title,
          description: vehicle.description,
          image: vehicle.image_url,
          vehicleModelDate: String(vehicle.year),
          vehicleTransmission: vehicle.transmission,
          fuelType: vehicle.fuel_type,
          bodyType: vehicle.body_type,
          brand: {
            '@type': 'Brand',
            name: brandName,
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: String(vehicle.hourly_driver_rate || 150),
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: String(vehicle.hourly_driver_rate || 150),
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column: Vehicle Image & Specs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-navy-200 overflow-hidden shadow-xs">
              <div className="h-72 sm:h-96 bg-navy-900 relative">
                <img
                  src={vehicle.image_url}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-navy-950/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                  {vehicle.year} Edition
                </div>
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Chauffeur Verified</span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="text-xs font-bold uppercase tracking-wider text-bee-700 mb-1">
                  {brandName} • {modelName}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 mb-3">
                  {vehicle.title}
                </h1>
                <p className="text-sm text-navy-600 leading-relaxed mb-6">
                  {vehicle.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-navy-100">
                  <div className="p-3 bg-navy-50 rounded-xl">
                    <span className="text-[10px] text-navy-400 font-bold uppercase block">Transmission</span>
                    <span className="text-sm font-extrabold text-navy-900">{vehicle.transmission}</span>
                  </div>
                  <div className="p-3 bg-navy-50 rounded-xl">
                    <span className="text-[10px] text-navy-400 font-bold uppercase block">Body Type</span>
                    <span className="text-sm font-extrabold text-navy-900">{vehicle.body_type}</span>
                  </div>
                  <div className="p-3 bg-navy-50 rounded-xl">
                    <span className="text-[10px] text-navy-400 font-bold uppercase block">Fuel Type</span>
                    <span className="text-sm font-extrabold text-navy-900">{vehicle.fuel_type}</span>
                  </div>
                  <div className="p-3 bg-navy-50 rounded-xl">
                    <span className="text-[10px] text-navy-400 font-bold uppercase block">Driver Fare</span>
                    <span className="text-sm font-black text-navy-950">₹{vehicle.hourly_driver_rate}/hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chauffeur Trust Pillars */}
            <div className="bg-white rounded-3xl border border-navy-200 p-6 sm:p-8">
              <h3 className="text-base font-extrabold text-navy-950 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-bee-600" />
                <span>Certified Chauffeur Standards for {vehicle.title}</span>
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-navy-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Transmission Mastery:</strong> Driver assessed for gentle {vehicle.transmission.toLowerCase()} gear shifts and progressive braking.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>7-Point Verification:</strong> Aadhaar KYC, Police criminal clearance, and driving license verified before dispatch.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Zero-Accident Record:</strong> Minimum 3+ years seasoned highway and city driving experience.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Instant Booking Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-navy-200 p-6 sm:p-8 shadow-card sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-navy-100 mb-6">
                <div>
                  <span className="text-xs text-navy-500 font-semibold block">Hourly Chauffeur Fare</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black text-navy-950">₹{vehicle.hourly_driver_rate}</span>
                    <span className="text-xs text-navy-500">/ hour</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
                    ⚡ 30 Mins Arrival
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-3.5 bg-bee-50/70 border border-bee-200 rounded-2xl flex items-start gap-3">
                  <Clock className="w-5 h-5 text-bee-700 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-navy-950">Your Car, Our Verified Driver</h4>
                    <p className="text-[11px] text-navy-600 mt-0.5">
                      Relax in your own car while a trusted professional driver takes the wheel for local errands or outstation getaways.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-navy-50 rounded-2xl flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-navy-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-navy-950">Doorstep Pickup Guarantee</h4>
                    <p className="text-[11px] text-navy-600 mt-0.5">
                      Available across Warangal, Hyderabad, and Visakhapatnam service hubs.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookNow}
                className="w-full py-4 rounded-2xl bg-bee-600 hover:bg-bee-700 text-white font-extrabold text-base shadow-cta transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Driver For This Vehicle</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-4 text-center">
                <a
                  href="tel:+917569402288"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-600 hover:text-bee-600 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Need Assistance? Call +91 75694 02288</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
