import Image from "next/image";

export default function Header() {
  return (
    <header className="hero-banner">
      <div className="container menu-section">
        <div className="row align-items-center">
          <div className="menu-block col-md-8">
            <nav className="navbar navbar-expand-lg navbar-light" aria-label="Main navigation">
              <div className="container-fluid">
                {/* Logo */}
                <a className="navbar-brand" href="/">
                  <Image
                    src="/images/logo.png"
                    alt="Perkx - Your Rewards Platform"
                    width={150} // chỉnh theo kích thước logo thực tế
                    height={50}
                    priority // load sớm cho SEO/LCP
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
                      <a className="nav-link active" href="/how-it-works">How it Works</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/exchanges">Exchanges</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/calculator">Calculator</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/campaigns">Campaigns</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/about-us">About Us</a>
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
                <span className="ms-1">English</span>
              </button>


              <ul className="dropdown-menu" aria-label="Language selection">
                <li>
                  <a className="dropdown-item" href="/en">English</a>
                </li>
                <li>
                  <a className="dropdown-item" href="/ko">Korea</a>
                </li>
              </ul>
            </div>

            <a href="/login" className="btn btn-login">Login</a>
            <a href="/register" className="btn btn-register">Register</a>
          </div>
        </div>
      </div>
    </header>
  );
}
