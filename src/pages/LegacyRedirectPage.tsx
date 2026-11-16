import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { resolveSlugRedirect, getAllVehicles, getAllDealers } from '../services/slugService';
import { NotFoundPage } from './NotFoundPage';

interface LegacyRedirectProps {
  entityType: 'vehicle' | 'dealer' | 'city' | 'brand';
}

export const LegacyRedirectPage: React.FC<LegacyRedirectProps> = ({ entityType }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function resolve() {
      if (!id) {
        setNotFound(true);
        return;
      }

      // 1. Check if ID matches an old slug or target redirect
      const redirect = await resolveSlugRedirect(entityType, id);
      if (redirect) {
        navigate(redirect.targetUrl, { replace: true });
        return;
      }

      // 2. Check if ID matches an internal vehicle ID (e.g. v-fortuner-2024)
      if (entityType === 'vehicle') {
        const vehicles = await getAllVehicles();
        const matched = vehicles.find((v) => v.id === id || v.slug === id.toLowerCase());
        if (matched) {
          const brandSlug = matched.model?.brand?.slug || 'cars';
          const modelSlug = matched.model?.slug || 'model';
          navigate(`/cars/${brandSlug}/${modelSlug}/${matched.slug}`, { replace: true });
          return;
        }
      }

      // 3. Check if ID matches an internal dealer ID
      if (entityType === 'dealer') {
        const dealers = await getAllDealers();
        const matched = dealers.find((d) => d.id === id || d.slug === id.toLowerCase());
        if (matched) {
          const citySlug = matched.city_name.toLowerCase().replace(/\s+/g, '-');
          navigate(`/dealers/${citySlug}/${matched.slug}`, { replace: true });
          return;
        }
      }

      setNotFound(true);
    }

    resolve();
  }, [id, entityType, navigate]);

  if (notFound) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 text-white">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-bee-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-navy-200">Redirecting to canonical DriverBee URL...</p>
      </div>
    </div>
  );
};
