import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../app/api.js";
import { toast } from "sonner";
import {
  ArrowRight, Check, AlertCircle, Eye, EyeOff, User, Mail,
  CreditCard, Phone, Sparkles, CheckCircle2, ShieldCheck, QrCode
} from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    phone: "",
    semester: 1
  });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // Normalizing email input to handle common typos like iiit.bh-ac.in
    const normalizedEmail = form.email.trim().toLowerCase();
    
    try {
      await register({
        ...form,
        email: normalizedEmail,
        studentId: form.studentId.trim().toUpperCase()
      }).unwrap();
      
      toast.success("Account created successfully! You can now sign in.");
      setDone(true);
    } catch (err) {
      const msg = err?.data?.message || err?.error || "Registration failed. Please verify your details.";
      setError(msg);
      toast.error(msg);
    }
  };

  if (done) {
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
            <span className="carousel-tag" style={{ marginBottom: 16 }}>ONBOARDING COMPLETE</span>
            <h2>Welcome to IIIT Mess Portal</h2>
            <p>Your student profile is active and ready for smart dining.</p>
          </div>
          <p className="auth-side-foot">&copy; {new Date().getFullYear()} IIIT Bhubaneswar</p>
        </div>

        <div className="auth-main">
          <div className="auth-card" style={{ textAlign: "center", padding: "40px 32px" }}>
            <div className="auth-success-icon" style={{ width: 72, height: 72, marginBottom: 20 }}>
              <CheckCircle2 size={40} />
            </div>
            <span className="carousel-badge" style={{ marginBottom: 12 }}>STUDENT ACCOUNT ACTIVE</span>
            <h1 style={{ margin: "12px 0 8px", fontSize: 26, color: "var(--text-primary)" }}>
              Registration Successful!
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
              Your account for <strong>{form.email}</strong> is ready. You can now sign in to browse today's menu, reserve meals, and generate your personal QR pass.
            </p>
            <Link
              to="/login"
              className="landing-btn landing-btn-solid landing-btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Sign In to Your Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            STUDENT REGISTRATION
          </div>
          <h2>
            Smarter Meals.<br />
            Seamless Campus Living.
          </h2>
          <p>
            Join over 1,200 resident students. Reserve your daily meals, generate sub-second QR passes,
            and monitor your itemized mess bills transparently.
          </p>

          <div className="auth-side-points">
            <div>
              <Check size={18} />
              <span>Instant smartphone QR meal passes</span>
            </div>
            <div>
              <Check size={18} />
              <span>Chef-curated daily menus with allergen labels</span>
            </div>
            <div>
              <Check size={18} />
              <span>Transparent itemized ledger & instant digital payments</span>
            </div>
            <div>
              <Check size={18} />
              <span>Direct leave application for mess rebate</span>
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
              NEW STUDENT ENROLLMENT
            </span>
            <h1>Create Student Account</h1>
            <p>Enter your institutional credentials to activate your meal pass.</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <div>
                <strong>Registration Notice:</strong>
                <div>{error}</div>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={submit}>
            <label>
              <span>Full Name</span>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ayush Kumar"
                  required
                  disabled={isLoading}
                />
              </div>
            </label>

            <label>
              <span>Institutional Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="b423015@iiit-bh.ac.in"
                required
                disabled={isLoading}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                Accepts @iiit-bh.ac.in or official student email aliases
              </span>
            </label>

            <div className="auth-form-row">
              <label>
                <span>Student ID / Roll No.</span>
                <input
                  type="text"
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value.toUpperCase() })}
                  placeholder="IIITB423015"
                  required
                  disabled={isLoading}
                />
              </label>

              <label>
                <span>Current Semester</span>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                  disabled={isLoading}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span>Contact Phone (Optional)</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                disabled={isLoading}
              />
            </label>

            <label>
              <span>Password (Minimum 8 Characters)</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
                  required
                  disabled={isLoading}
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
                "Creating your profile..."
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-info-note" style={{ textAlign: "center", marginTop: 24 }}>
            Already have an active account?{" "}
            <Link to="/login" style={{ color: "var(--luxury-gold-dark)", fontWeight: 700 }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
