'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function Navigation() {
  const pathname = usePathname();
  const t = useTranslations();

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  return (
    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
      <li className="nav-item">
        <a 
          className={`nav-link ${isActive('/how-it-works') ? 'active' : ''}`} 
          href="/how-it-works"
        >
          {t("menu.how_it_works")}
        </a>
      </li>
      <li className="nav-item">
        <a 
          className={`nav-link ${isActive('/exchanges') ? 'active' : ''}`} 
          href="/exchanges"
        >
          {t("menu.exchanges")}
        </a>
      </li>
      <li className="nav-item">
        <a 
          className={`nav-link ${isActive('/calculator') ? 'active' : ''}`} 
          href="/calculator"
        >
          {t("menu.calculator")}
        </a>
      </li>
      <li className="nav-item">
        <a 
          className={`nav-link ${isActive('/campaigns') ? 'active' : ''}`} 
          href="/campaigns"
        >
          {t("menu.campaigns")}
        </a>
      </li>
      <li className="nav-item">
        <a 
          className={`nav-link ${isActive('/about-us') ? 'active' : ''}`} 
          href="/about-us"
        >
          {t("menu.about_us")}
        </a>
      </li>
    </ul>
  );
}
