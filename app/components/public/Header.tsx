import Image from "next/image";
import {getTranslations} from "next-intl/server";
import AuthButtons from "./AuthButtons";
import Navigation from "./Navigation";

export default async function Header() {
  const t = await getTranslations();
  return (
    <>
      <div id="hero-sentinel"></div>
      <header id="site-header" className="hero-banner site-header">
        <div className="container menu-section">
          <div className="row align-items-center">
            <div className="menu-block col-md-12 col-lg-8">
              <nav className="navbar navbar-expand-lg navbar-light" aria-label="Main navigation">
                <div className="container-fluid">
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
                  {/* Mobile logo */}
                  <a className="navbar-brand mx-auto d-lg-none" href="/">
                    <Image
                      src="/images/logo.png"
                      alt={t('meta.home.title')}
                      width={97}
                      height={32}
                      priority
                    />
                  </a>

                  {/* Desktop logo */}
                  <a className="navbar-brand d-none d-lg-block" href="/">
                    <Image
                      src="/images/logo.png"
                      alt={t('meta.home.title')}
                      width={123}
                      height={41}
                      priority
                    />
                  </a>
                  <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <Navigation />
                  </div>
                </div>
              </nav>
            </div>

            <div className="language-block col-lg-4 d-flex justify-content-end">
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
                  <li>
                    <a className="dropdown-item" href="/en">
                      {t("language.en")}
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="/ko">
                      {t("language.ko")}
                    </a>
                  </li>
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
