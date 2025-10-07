import React, { useState } from "react";
import { useAuth } from "../AuthContext"; // make sure AuthContext is set up
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import "./LoginPage.css"; // optional CSS import

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);

    try {
      await login(email, password);
      setEmail("");
      setPassword("");
      navigate("/admin/home", { replace: true });
    } catch (error) {
      setErr( 
        error.response?.data?.message ||
          error.message ||
          "Login failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-xl">
      <div className="authentication-wrapper authentication-basic container-p-y justify-content-center">
        <div className="authentication-inner">
          <div className="card">
            <div className="card-body">
              <h4 className="mb-2">Welcome to Geteziplug! 👋</h4>
              <p className="mb-4">Please sign in to your account</p>

              <form className="mb-3" onSubmit={handleSubmit}>
                {err && (
                  <div className="alert alert-danger">{err}</div>
                )}

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="mb-3 form-password-toggle">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group input-group-merge">
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      name="password"
                      placeholder="••••••••••••"
                      aria-describedby="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="input-group-text cursor-pointer">
                      <i className="bx bx-hide"></i>
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember-me"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="remember-me"
                    >
                      Remember Me
                    </label>
                  </div>
                </div>

                <div className="mb-3">
                  <button
                    className="btn btn-primary d-grid w-100"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Signing in..." : "Login"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
