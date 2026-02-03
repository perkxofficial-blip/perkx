import Image from "next/image";
import {getTranslations} from "next-intl/server";
import AuthButtons from "./AuthButtons";
import Navigation from "./Navigation";

const LANGUAGES = [
  { code: 'en', key: 'language.en' },
  { code: 'ko', key: 'language.ko' },
  { code: 'zh', key: 'language.zh' },
  { code: 'ja', key: 'language.ja' },
  { code: 'id', key: 'language.id' },
  { code: 'es', key: 'language.es' },
] as const;

export default async function Header() {
  const t = await getTranslations();
  return (
    <>
      <div id="hero-sentinel"></div>
      <header id="site-header" className="hero-banner site-header">
        <div className="container menu-section">
          <div className="row align-items-center">
            <div className="menu-block col-md-8">
              <nav className="navbar navbar-expand-lg navbar-light" aria-label="Main navigation">
                <div className="container-fluid">
                  {/* Logo */}
                  <a className="navbar-brand" href="/">
                    <Image
                      src="/images/logo.png"
                      alt={t('meta.home.title')}
                      width={123}
                      height={41}
                      priority
                    />
                  </a>

                  {/* Navbar toggler */}
                  <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon" />
                  </button>

                  <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <Navigation />
                  </div>
                </div>
              </nav>
            </div>

            <div className="language-block col-md-4 d-flex justify-content-end">
              <div className="btn-group">
                <button
                  type="button"
                  className="btn btn-language dropdown-toggle d-inline-flex align-items-center"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <Image
                    src="/images/global-line.png"
                    alt="Language: English"
                    width={20}
                    height={20}
                  />
                  <span className="ms-1">{t("language.en")}</span>
                </button>


                <ul className="dropdown-menu" aria-label="Language selection">
                  {LANGUAGES.map((lang) => (
                    <li key={lang.code}>
                      <a className="dropdown-item" href={`/${lang.code}`}>
                        {t(lang.key)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <AuthButtons />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
