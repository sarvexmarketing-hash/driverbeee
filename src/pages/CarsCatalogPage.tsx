import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, ArrowRight, Sparkles, Filter, CheckCircle2, ChevronRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getAllBrands, getAllVehicles } from '../services/slugService';
import { Brand, VehicleListing } from '../types/seo';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const CarsCatalogPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [selectedBodyType, setSelectedBodyType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [b, v] = await Promise.all([getAllBrands(), getAllVehicles()]);
        setBrands(b);
        setVehicles(v);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredVehicles = selectedBodyType === 'all'
    ? vehicles
    : vehicles.filter((v) => v.body_type.toLowerCase().includes(selectedBodyType.toLowerCase()));

  const breadcrumbs = [
    { label: 'Cars', url: '/cars', current: true },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SeoHead
        title="Car Brands & Supported Models — DriverBee"
        description="Browse supported car brands and vehicle models on DriverBee. Hire verified, background-checked personal car drivers and chauffeurs for your car."
        canonicalUrl="https://driverbee.in/cars"
        ogTitle="Car Brands & Supported Models | DriverBee"
        ogDescription="Hire professional drivers for your Toyota, Hyundai, Honda, Tata, Mahindra, BMW, and Mercedes personal car."
        breadcrumbs={breadcrumbs}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Supported Car Brands on DriverBee',
          itemListElement: brands.map((b, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: b.name,
            url: `https://driverbee.in/cars/${b.slug}`,
          })),
        }}
      />

      <Header selectedCity="Warangal, Telangana" onOpenCitySelector={() => {}} />

      <main className="flex-1 max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-6 sm:p-10 mb-10 relative overflow-hidden shadow-xl border border-navy-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-bee-400 via-transparent to-transparent" />
          
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bee-500/20 text-bee-400 font-bold text-xs uppercase tracking-wider mb-4 border border-bee-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chauffeur Support For All Vehicles</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              Explore Supported Car Brands &amp; Models
            </h1>
            <p className="text-sm sm:text-base text-navy-200 leading-relaxed">
              DriverBee provides background-verified, experienced chauffeurs certified for manual, automatic, SUV, sedan, and luxury transmissions. Select your vehicle to view specialized driver profiles and instant doorstep booking.
            </p>
          </div>
        </section>

        {/* Popular Brands Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-950">Featured Car Brands</h2>
              <p className="text-xs text-navy-500">Select a brand to view compatible models and expert driver dispatch</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/cars/${brand.slug}`}
                className="group bg-white p-4 rounded-2xl border border-navy-100 hover:border-bee-400 hover:shadow-card transition-all flex flex-col items-center text-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform overflow-hidden">
                  <Car className="w-6 h-6 text-navy-700 group-hover:text-bee-600" />
                </div>
                <h3 className="text-sm font-bold text-navy-900 group-hover:text-bee-600 transition-colors">
                  {brand.name}
                </h3>
                <span className="text-[11px] text-navy-400 font-medium mt-0.5">
                  {brand.models_count || 'Multiple'} models
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Vehicle Catalog with Body Type Filters */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-navy-950">Popular Personal Vehicles</h2>
              <p className="text-xs text-navy-500">Verified drivers available on demand at flat ₹10/km</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'suv', 'sedan', 'luxury'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedBodyType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    selectedBodyType === type
                      ? 'bg-bee-600 text-white shadow-xs'
                      : 'bg-white text-navy-700 hover:bg-navy-50 border border-navy-200'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 bg-navy-100 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => {
                const brandSlug = vehicle.model?.brand?.slug || 'cars';
                const modelSlug = vehicle.model?.slug || 'model';
                const vehicleUrl = `/cars/${brandSlug}/${modelSlug}/${vehicle.slug}`;

                return (
                  <div
                    key={vehicle.id}
                    className="bg-white rounded-2xl border border-navy-200 overflow-hidden shadow-xs hover:shadow-card transition-all flex flex-col group"
                  >
                    <div className="relative h-44 bg-navy-900 overflow-hidden">
                      <img
                        src={vehicle.image_url}
                        alt={vehicle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        {vehicle.body_type} • {vehicle.transmission}
                      </div>
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-bee-700 mb-1">
                          {vehicle.model?.brand?.name || 'Brand'}
                        </div>
                        <h3 className="text-base font-extrabold text-navy-950 mb-1.5 group-hover:text-bee-600 transition-colors">
                          {vehicle.title}
                        </h3>
                        <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">
                          {vehicle.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-navy-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-navy-400 font-semibold block uppercase">Driver Fare</span>
                          <span className="text-sm font-black text-navy-950">₹{vehicle.hourly_driver_rate || 150} <span className="text-xs font-normal text-navy-500">/ hr</span></span>
                        </div>

                        <Link
                          to={vehicleUrl}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bee-50 hover:bg-bee-600 text-navy-950 hover:text-white font-bold text-xs transition-all shadow-xs"
                        >
                          <span>View Chauffeurs</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};
