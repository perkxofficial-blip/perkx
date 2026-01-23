export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row py-4">
          <div className="col-md-6">
            <img src="/images/logo.png" alt="PerkX" />
            <p className="mt-3">
              © {new Date().getFullYear()} PerkX. All rights reserved.
            </p>
          </div>

          <div className="col-md-6 text-end">
            <a href="#" className="me-3">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
