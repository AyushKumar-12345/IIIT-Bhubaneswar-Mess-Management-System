import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../app/api.js";
import { toast } from "sonner";
import {
  ArrowRight, Lock, AlertCircle, Users, ShieldCheck, ChefHat,
  GraduationCap, Eye, EyeOff, Sparkles, CheckCircle2
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "student",
    name: "Ayush Kumar",
    icon: GraduationCap,
    email: "b423015@iiit.bh-ac.in",
    password: "Password@123",
    badge: "Student (Ayush)"
  },
  {
    role: "student",
    name: "Student (Rahul)",
    icon: GraduationCap,
    email: "rahul.sharma@iiit-bh.ac.in",
    password: "Student@123",
    badge: "Student Access"
  },
  {
    role: "admin",
    name: "Mess Admin",
    icon: ShieldCheck,
    email: "admin@gmail.com",
    password: "admin@123",
    badge: "Full Control"
  },
  {
    role: "mess_committee",
    name: "Mess Secretary",
    icon: Users,
    email: "mess.secretary@gmail.com",
    password: "secretary@123",
    badge: "Committee"
  },
  {
    role: "staff",
    name: "Kitchen Staff",
    icon: ChefHat,
    email: "staff@gmail.com",
    password: "staff@123",
    badge: "Counter Scanner"
  }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email: email.trim().toLowerCase(), password }).unwrap();
      toast.success("Welcome back to IIIT Mess Portal");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.data?.message || err?.error || "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
    }
  };

  const fillCredentials = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
    toast.info(`Filled credentials for ${acc.name}`);
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <Link to="/" className="auth-brand">
          <div className="landing-brand-logo-wrap" style={{ width: 36, height: 36 }}>
            <img src="/favicon.svg" alt="Logo" width="26" height="26" />
          </div>
          <span>IIIT MESS</span>
        </Link>

        <div className="auth-side-content">
          <div className="carousel-tag" style={{ marginBottom: 16, width: "fit-content" }}>
            AUTHENTICATED PORTAL
          </div>
          <h2>
            Smarter Meals.<br />
            Better Campus Living.
          </h2>
          <p>
            Sign in to access daily menus, your cryptographic QR meal passes, itemized ledger statements,
            and 24x7 grievance tracking.
          </p>

          <div className="auth-side-points">
            <div>
              <Lock size={16} />
              <span>Multi-tier role authorization (Student, Admin, Warden, Staff)</span>
            </div>
            <div>
              <Lock size={16} />
              <span>Cryptographic single-use QR pass generation</span>
            </div>
            <div>
              <Lock size={16} />
              <span>Secure HttpOnly cookie rotation & JWT authentication</span>
            </div>
          </div>
        </div>

        <p className="auth-side-foot">
          IIIT Bhubaneswar &bull; Central Dining Division &bull; {new Date().getFullYear()}
        </p>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <div className="auth-card-head">
            <span className="role-eyebrow" style={{ color: "var(--luxury-gold-dark)", marginBottom: 4 }}>
              PORTAL ACCESS
            </span>
            <h1>Welcome Back</h1>
            <p>Enter your credentials to enter the Mess Portal</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <div>
                <strong>Authentication Notice:</strong>
                <div>{error}</div>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@iiit-bh.ac.in or admin@gmail.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </label>

            <label>
              <span>Password</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "grid",
                    placeItems: "center",
                    padding: 4
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? (
                "Verifying credentials..."
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Logins */}
          <div className="auth-info" style={{ marginTop: 24, paddingTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>Quick Demo Logins (1-Click Fill)</h4>
              <span style={{ fontSize: 11, color: "var(--luxury-gold-dark)", fontWeight: 700 }}>Click to fill</span>
            </div>

            <div className="auth-info-grid">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillCredentials(acc)}
                    className="auth-info-item"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      border: isSelected ? "1.5px solid var(--luxury-gold)" : "1px solid var(--border)",
                      background: isSelected ? "var(--luxury-gold-light)" : "var(--bg-surface)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <Icon size={18} style={{ color: isSelected ? "var(--luxury-gold-dark)" : "var(--royal-navy)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>{acc.name}</strong>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{acc.badge}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="auth-info-note" style={{ textAlign: "center", marginTop: 20 }}>
              <strong>New student?</strong>{" "}
              <Link to="/register" style={{ color: "var(--luxury-gold-dark)", fontWeight: 700 }}>
                Create an account
              </Link>{" "}
              for instant meal registration and QR passes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
