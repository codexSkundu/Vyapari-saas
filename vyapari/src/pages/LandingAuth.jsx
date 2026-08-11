import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/api";
import "./LandingAuth.css";


const STORE_NAME = "Vyapari";
const TAGLINE = "Fresh from the seller's stall to your door.";

const GROCERY_ITEMS = ["🥕", "🍅", "🧅", "🥔", "🥬", "🌶️", "🍎", "🥭", "🥒", "🌽"];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18 },
  },
};

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
    <motion.div
      className={`stall stall--${role}`}
      variants={fadeUp}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
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
          <motion.button
            type="button"
            className={mode === "login" ? "is-active" : ""}
            onClick={() => setMode("login")}
            whileTap={{ scale: 0.95 }}
          >
            Log in
          </motion.button>
          <motion.button
            type="button"
            className={mode === "signup" ? "is-active" : ""}
            onClick={() => setMode("signup")}
            whileTap={{ scale: 0.95 }}
          >
            Sign up
          </motion.button>
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

          {error && (
            <motion.p
              className="stall__error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className="stall__submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {loading
              ? "One moment…"
              : mode === "login"
              ? "Log in"
              : `Sign up as ${role}`}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}

export default function LandingAuth() {
  const navigate = useNavigate();
  const authRef = useRef(null);

  const [customerMode, setCustomerMode] = useState("login");
  const [sellerMode, setSellerMode] = useState("login");
  const [introPhase, setIntroPhase] = useState("items");

  useEffect(() => {
    // Phase 1: grocery circle (1 second)
    const timer1 = setTimeout(() => {
      setIntroPhase("logo");
    }, 1000);

    // Phase 2: Vyapari + tagline (1 second total)
    const timer2 = setTimeout(() => {
      setIntroPhase("done");
    }, 2000);

    // Phase 3: scroll to auth
    const timer3 = setTimeout(() => {
      authRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleAuthSuccess = (result, role) => {
    const resolvedRole = result?.role || role;
    localStorage.setItem("vyapari_role", resolvedRole);
    if (result?.token) localStorage.setItem("vyapari_token", result.token);
    navigate(resolvedRole === "seller" ? "/dashboard/seller" : "/dashboard/customer");
  };

  return (
    <div className="landing">
      {/* ===== INTRO OVERLAY ===== */}
      <AnimatePresence>
        {introPhase !== "done" && (
          <motion.div
            className="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Grocery items rotating in a circle */}
            {introPhase === "items" && (
              <motion.div
                className="intro-circle"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "linear" }}
              >
                {GROCERY_ITEMS.map((item, index) => {
                  const angle = (index / GROCERY_ITEMS.length) * 360;
                  return (
                    <span
                      key={index}
                      className="intro-item"
                      style={{
                        transform: `rotate(${angle}deg) translate(100px) rotate(-${angle}deg)`,
                      }}
                    >
                      {item}
                    </span>
                  );
                })}
              </motion.div>
            )}

            {/* Big Vyapari + Tagline */}
            {introPhase === "logo" && (
              <div className="intro-text">
                <motion.h1
                  className="intro-logo"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                >
                  {STORE_NAME}
                </motion.h1>

                <motion.p
                  className="intro-tagline"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    delay: 0.5,
                    type: "spring",
                    stiffness: 200,
                    damping: 18,
                  }}
                >
                  {TAGLINE}
                </motion.p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== THIN TOP BANNER ===== */}
      {introPhase === "done" && (
        <motion.header
          className="landing__top-banner"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="landing__top-banner-content">
            <h1 className="landing__top-banner-name">{STORE_NAME}</h1>
            <p className="landing__top-banner-tagline">{TAGLINE}</p>
          </div>
        </motion.header>
      )}

      {/* ===== AUTH STALLS ===== */}
      <motion.section
        ref={authRef}
        className="landing__auth"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={staggerContainer}
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
      </motion.section>

      {/* ===== CONTACT ===== */}
      <section className="landing__contact">
        <motion.h2
          className="landing__contact-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Get in touch
        </motion.h2>

        <div className="contact-with-cat">
          <motion.div
            className="contact-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div className="contact-card" variants={fadeUp}>
              <span className="contact-card__label">Email</span>
              <p>hello@vyapari.com</p>
            </motion.div>

            <motion.div className="contact-card" variants={fadeUp}>
              <span className="contact-card__label">Phone</span>
              <p>+91 00000 00000</p>
            </motion.div>

            <motion.div className="contact-card" variants={fadeUp}>
              <span className="contact-card__label">Find us</span>
              <p>WEST BENGAL</p>
            </motion.div>
          </motion.div>

          
        </div>
      </section>
    </div>
  );
}