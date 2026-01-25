export default function ForgotPasswordModal() {
  return (
    <>
      <div className="modal fade" id="forgotModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
              />
              <button type="button" className="btn btn-primary mt-3">
                Send reset link
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
