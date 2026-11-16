import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../types/seo';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`py-3 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 text-xs font-semibold text-navy-600">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-bee-600 transition-colors text-navy-500"
            title="DriverBee Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.url} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-navy-300 flex-shrink-0" />
              {isLast || item.current ? (
                <span
                  aria-current="page"
                  className="text-navy-950 font-bold max-w-[200px] sm:max-w-xs truncate"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.url}
                  className="hover:text-bee-600 transition-colors max-w-[160px] sm:max-w-none truncate"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
