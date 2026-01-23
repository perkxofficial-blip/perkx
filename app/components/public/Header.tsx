export default function Header() {
  return (
    <div className="hero-banner">
      <div className="container menu-section">
        <div className="row align-items-center">
          <div className="menu-block col-md-8">
            <nav className="navbar navbar-expand-lg navbar-light">
              <div className="container-fluid">
                <a className="navbar-brand" href="#">
                  <img src="/images/logo.png" className="logo" alt="perkx" />
                </a>

                <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarSupportedContent"
                >
                  <span className="navbar-toggler-icon" />
                </button>

                <div
                  className="collapse navbar-collapse"
                  id="navbarSupportedContent"
                >
                  <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                      <a className="nav-link active" href="#">
                        How it Works
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">Exchanges</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">Calculator</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">Campaigns</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#">About us</a>
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
                className="btn btn-language dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                <img
                  src="/images/global-line.png"
                  className="me-1"
                  alt="English"
                />
                English
              </button>

              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">English</a></li>
                <li><a className="dropdown-item" href="#">Chinese</a></li>
              </ul>
            </div>

            <a href="#" className="btn btn-login">Login</a>
            <a href="#" className="btn btn-register">Register</a>
          </div>
        </div>
      </div>
    </div>
  )
}
