import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import "./LandingAuth.css";
import veggiesImg from "../assets/veggies.png";

const STORE_NAME = "Vyapari";
const TAGLINE = "Fresh from the seller's stall to your door.";

function AuthStall({ role, mode, setMode, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TEMPORARY MOCK — remove once the real backend is ready
    setTimeout(() => {
      onSuccess({ role, token: "mock-token" }, role);
      setLoading(false);
    }, 300);

    // Real version (restore this once backend is live):
    // try {
    //   const result =
    //     mode === "login"
    //       ? await api.login(email, password, role)
    //       : await api.signup(email, password, role);
    //   onSuccess(result, role);
    // } catch (err) {
    //   setError(err.message || "Something went wrong. Try again.");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className={`stall stall--${role}`}>
      <div className="stall__awning" aria-hidden="true">
        <span className="stall__awning-label">
          {role === "seller" ? "Seller entrance" : "Customer entrance"}
        </span>
      </div>

      <div className="stall__interior">
        <h3 className="stall__title">
          {role === "seller" ? "Run your stall" : "Shop the stalls"}
        </h3>

        <div className="stall__toggle">
          <button
            type="button"
            className={mode === "login" ? "is-active" : ""}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={mode === "signup" ? "is-active" : ""}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stall__form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={8}
            />
          </label>

          {error && <p className="stall__error">{error}</p>}

          <button type="submit" className="stall__submit" disabled={loading}>
            {loading
              ? "One moment…"
              : mode === "login"
              ? "Log in"
              : `Sign up as ${role}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LandingAuth() {
  const navigate = useNavigate();
  const revealRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [customerMode, setCustomerMode] = useState("login");
  const [sellerMode, setSellerMode] = useState("login");

  useEffect(() => {
    const node = revealRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleAuthSuccess = (result, role) => {
    // Expecting backend to return { role, token } (or similar) on success.
    const resolvedRole = result?.role || role;
    localStorage.setItem("vyapari_role", resolvedRole);
    if (result?.token) localStorage.setItem("vyapari_token", result.token);
    navigate(resolvedRole === "seller" ? "/dashboard/seller" : "/dashboard/customer");
  };

  return (
    <div className="landing">
      <section className="landing__hero">
        <div className="landing__hero-leaf" aria-hidden="true" />
        <div className="landing__hero-content">
          <h1 className="landing__store-name">{STORE_NAME}</h1>
          <p className="landing__tagline">{TAGLINE}</p>
        </div>
        <img src={veggiesImg} alt="Fresh vegetables" className="landing__hero-image" />
        <div className="landing__scroll-cue">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section
        ref={revealRef}
        className={`landing__auth ${revealed ? "is-revealed" : ""}`}
      >
        <AuthStall
          role="customer"
          mode={customerMode}
          setMode={setCustomerMode}
          onSuccess={handleAuthSuccess}
        />
        <AuthStall
          role="seller"
          mode={sellerMode}
          setMode={setSellerMode}
          onSuccess={handleAuthSuccess}
        />
      </section>
      <section className="landing__contact">
        <h2 className="landing__contact-title">Get in touch</h2>
        <div className="contact-grid">
          <div className="contact-card">
            <span className="contact-card__label">Email</span>
            <p>hello@vyapari.com</p>
          </div>
          <div className="contact-card">
            <span className="contact-card__label">Phone</span>
            <p>+91 00000 00000</p>
          </div>
          <div className="contact-card">
            <span className="contact-card__label">Find us</span>
            <p>aapke pink bra k andar</p>
          </div>
        </div>
      </section>
    </div>
  );
}