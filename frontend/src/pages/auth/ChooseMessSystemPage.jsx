import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateMyProfileMutation } from "../../app/api.js";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/auth/authSlice.js";
import { toast } from "sonner";
import {
  Building2, UtensilsCrossed, Check, ArrowRight, ShieldCheck,
  Sparkles, Zap, Clock, Receipt, IndianRupee
} from "lucide-react";

export default function ChooseMessSystemPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [update] = useUpdateMyProfileMutation();
  const [busy, setBusy] = useState(null);

  const pickFirstFloor = async () => {
    setBusy("1st_floor");
    try {
      const res = await update({ messSystem: "1st_floor" }).unwrap();
      dispatch(setUser(res.data.user));
      toast.success("Welcome to 1st Floor Flexible Mess!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to select 1st floor mess");
      setBusy(null);
    }
  };

  const pickGroundFloor = () => {
    navigate("/ground-floor/enroll", { replace: true });
  };

  return (
    <div style={{ maxWidth: 1080, margin: "50px auto", padding: "0 24px" }}>
      <header style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 18px",
          borderRadius: 9999,
          background: "rgba(197, 160, 89, 0.12)",
          border: "1px solid rgba(197, 160, 89, 0.35)",
          color: "var(--luxury-gold-dark)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 14
        }}>
          <Sparkles size={14} /> IIIT BHUBANESWAR DINING PORTAL
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12, color: "var(--royal-navy)", letterSpacing: "-0.03em" }}>
          Choose Your Mess Dining System
        </h1>
        <p style={{ color: "var(--text-secondary)", maxWidth: 640, margin: "0 auto", fontSize: 15, lineHeight: 1.6 }}>
          Both dining halls serve nutritious, high-grade chef-prepared meals with identical quality standards. Select the plan structure that aligns with your lifestyle and semester habits.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 32 }}>
        {/* 1st Floor Flexible Mess Card */}
        <div
          className="card"
          style={{
            padding: "36px 32px",
            border: "2px solid rgba(10, 17, 40, 0.15)",
            borderRadius: 22,
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            boxShadow: "0 16px 40px -6px rgba(10, 17, 40, 0.08)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            transition: "all 0.25s ease"
          }}
        >
          {/* Badge */}
          <div style={{
            position: "absolute",
            top: -12,
            left: 28,
            background: "linear-gradient(135deg, var(--royal-navy) 0%, #162447 100%)",
            color: "var(--luxury-gold)",
            border: "1px solid var(--luxury-gold)",
            padding: "4px 14px",
            borderRadius: 9999,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.06em",
            boxShadow: "0 4px 12px rgba(10, 17, 40, 0.25)",
            display: "inline-flex",
            alignItems: "center",
            gap: 5
          }}>
            <Zap size={12} /> MOST FLEXIBLE · STUDENT CHOICE
          </div>

          <div style={{
            width: 52,
            height: 52,
            background: "linear-gradient(135deg, rgba(10, 17, 40, 0.08) 0%, rgba(197, 160, 89, 0.12) 100%)",
            color: "var(--royal-navy)",
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            marginBottom: 20,
            border: "1px solid rgba(10, 17, 40, 0.1)"
          }}>
            <UtensilsCrossed size={26} color="var(--royal-navy)" />
          </div>

          <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--luxury-gold-dark)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            PAY-PER-MEAL AUTONOMY
          </span>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: "var(--royal-navy)", letterSpacing: "-0.02em" }}>
            1st Floor Mess
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 18, fontSize: 14, lineHeight: 1.6 }}>
            Total autonomy over your schedule and billing. Register on the days you eat, skip when away, and pay only for attended meals at verified rates.
          </p>

          {/* Rate Pills */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 22,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
            fontSize: 12
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Breakfast:</span>
              <strong style={{ color: "var(--royal-navy)" }}>Rs. 40</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Lunch:</span>
              <strong style={{ color: "var(--royal-navy)" }}>Rs. 80</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Snacks:</span>
              <strong style={{ color: "var(--royal-navy)" }}>Rs. 30</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Dinner:</span>
              <strong style={{ color: "var(--royal-navy)" }}>Rs. 90</strong>
            </div>
          </div>

          <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, display: "grid", gap: 12, fontSize: 13.5, color: "var(--text-primary)", flex: 1 }}>
            <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(5, 150, 105, 0.12)", color: "#059669", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                <Check size={13} />
              </div>
              <span><strong>Meal-by-Meal Registration:</strong> Book meals up to 30 days in advance via mobile or web</span>
            </li>
            <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(5, 150, 105, 0.12)", color: "#059669", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                <Check size={13} />
              </div>
              <span><strong>Free Cancellation:</strong> Cancel prior to the 2-hour cutoff window with zero penalty</span>
            </li>
            <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(5, 150, 105, 0.12)", color: "#059669", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                <Check size={13} />
              </div>
              <span><strong>Itemized Live Ledger:</strong> Real-time billing ledger with instant UPI, Card & Net Banking checkout</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={pickFirstFloor}
            disabled={busy === "1st_floor"}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "15px 20px",
              fontSize: 15,
              fontWeight: 800,
              borderRadius: 12,
              background: "linear-gradient(135deg, #0a1128 0%, #162447 100%)",
              color: "#ffffff",
              border: "1.5px solid var(--luxury-gold)",
              cursor: busy === "1st_floor" ? "not-allowed" : "pointer",
              boxShadow: "0 6px 18px rgba(10, 17, 40, 0.25)",
              transition: "all 0.2s ease"
            }}
          >
            {busy === "1st_floor" ? "Confirming..." : (
              <>
                Select 1st Floor Mess <ArrowRight size={16} color="var(--luxury-gold)" />
              </>
            )}
          </button>
        </div>

        {/* Ground Floor Semester Plan Card */}
        <div
          className="card"
          style={{
            padding: "36px 32px",
            border: "2px solid var(--luxury-gold)",
            borderRadius: 22,
            background: "linear-gradient(180deg, #ffffff 0%, #fdfbf7 100%)",
            boxShadow: "0 16px 40px -4px rgba(197, 160, 89, 0.2)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.25s ease"
          }}
        >
          {/* Badge */}
          <div style={{
            position: "absolute",
            top: -12,
            right: 28,
            background: "linear-gradient(135deg, var(--luxury-gold) 0%, var(--luxury-gold-dark) 100%)",
            color: "var(--royal-navy)",
            padding: "4px 14px",
            borderRadius: 9999,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.06em",
            boxShadow: "0 4px 12px rgba(197, 160, 89, 0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: 5
          }}>
            <Sparkles size={12} /> ALL-INCLUSIVE PASS
          </div>

          <div style={{
            width: 52,
            height: 52,
            background: "linear-gradient(135deg, var(--royal-navy) 0%, var(--royal-navy-light) 100%)",
            color: "var(--luxury-gold)",
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            marginBottom: 20,
            boxShadow: "0 4px 12px rgba(10, 17, 40, 0.15)"
          }}>
            <Building2 size={26} color="var(--luxury-gold)" />
          </div>

          <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--luxury-gold-dark)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
            ONE-TIME SEMESTER PLAN
          </span>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: "var(--royal-navy)", letterSpacing: "-0.02em" }}>
            Ground Floor Mess
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 18, fontSize: 14, lineHeight: 1.6 }}>
            One single payment for complete peace of mind. Choose 3 or 4 daily meals and walk in anytime with your verified digital semester pass.
          </p>

          {/* Pricing Highlight */}
          <div style={{
            background: "rgba(197, 160, 89, 0.1)",
            border: "1px solid rgba(197, 160, 89, 0.35)",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 22,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <span style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>SEMESTER TUITION</span>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--royal-navy)" }}>Flat Rs. 25,000 / term</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--luxury-gold-dark)", background: "#ffffff", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(197, 160, 89, 0.4)" }}>
              Save up to 30%
            </span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, display: "grid", gap: 12, fontSize: 13.5, color: "var(--text-primary)", flex: 1 }}>
            <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(197, 160, 89, 0.2)", color: "var(--luxury-gold-dark)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                <Check size={13} />
              </div>
              <span><strong>Entire Term Covered:</strong> One lump-sum payment covers all dining through term end</span>
            </li>
            <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(197, 160, 89, 0.2)", color: "var(--luxury-gold-dark)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                <Check size={13} />
              </div>
              <span><strong>Choose 3 or 4 Meals:</strong> Select your daily combination (Breakfast, Lunch, Snacks, Dinner)</span>
            </li>
            <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(197, 160, 89, 0.2)", color: "var(--luxury-gold-dark)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                <Check size={13} />
              </div>
              <span><strong>Zero Daily Registration:</strong> Instant QR digital mess pass ready on your dashboard</span>
            </li>
          </ul>

          <button
            type="button"
            onClick={pickGroundFloor}
            disabled={!!busy}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "15px 20px",
              fontSize: 15,
              fontWeight: 800,
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--luxury-gold) 0%, var(--luxury-gold-dark) 100%)",
              color: "var(--royal-navy)",
              border: "1.5px solid rgba(197, 160, 89, 0.6)",
              cursor: busy ? "not-allowed" : "pointer",
              boxShadow: "0 6px 18px rgba(197, 160, 89, 0.35)",
              transition: "all 0.2s ease"
            }}
          >
            Continue to Enroll <ArrowRight size={16} color="var(--royal-navy)" />
          </button>
        </div>
      </div>
    </div>
  );
}
