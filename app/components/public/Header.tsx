import Image from "next/image";
import {getTranslations} from "next-intl/server";

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
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                      <li className="nav-item">
                        <a className="nav-link" href="/how-it-works">
                          {t("menu.how_it_works")}
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="/exchanges">
                          {t("menu.exchanges")}
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="/calculator">
                          {t("menu.calculator")}
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="/campaigns">
                          {t("menu.campaigns")}
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="/about-us">
                          {t("menu.about_us")}
                        </a>
                      </li>
                    </ul>
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

              <a href="/login" className="btn btn-login">
                {t("menu.login")}
              </a>
              <a href="/register" className="btn btn-register">
                {t("menu.register")}
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
