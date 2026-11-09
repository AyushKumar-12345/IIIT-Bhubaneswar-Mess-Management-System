import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useGroundFloorInfoQuery,
  useGroundFloorEnrollMutation,
  useMeQuery
} from "../../app/api.js";
import { setUser } from "../../features/auth/authSlice.js";
import { toast } from "sonner";
import {
  Check, CreditCard, Building2, Smartphone, Copy, ShieldCheck, X,
  Printer, ArrowLeft, Sunrise, Utensils, Coffee, Moon, Sparkles,
  CheckCircle2, Calculator, ArrowRight, Lock, Info
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const MEAL_META = {
  breakfast: { label: "Breakfast", time: "8:00 - 10:00 AM", defaultPrice: 40, icon: Sunrise, color: "#d97706" },
  lunch: { label: "Lunch", time: "12:00 - 2:00 PM", defaultPrice: 80, icon: Utensils, color: "#059669" },
  snacks: { label: "Snacks", time: "5:00 - 6:00 PM", defaultPrice: 30, icon: Coffee, color: "#0284c7" },
  dinner: { label: "Dinner", time: "7:30 - 9:30 PM", defaultPrice: 90, icon: Moon, color: "#6366f1" }
};

const MIN_MEALS = 3;

const METHODS = [
  { value: "upi", label: "Direct UPI / QR", icon: Smartphone, desc: "GPay, PhonePe, Paytm" },
  { value: "card", label: "Direct Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { value: "netbanking", label: "Net Banking", icon: Building2, desc: "All major banks" }
];

const UPI_APPS = ["Google Pay", "PhonePe", "Paytm", "BHIM UPI"];
const BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak", "PNB"];

export default function GroundFloorEnrollPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: meData, refetch: refetchMe } = useMeQuery();
  const { data, isLoading, refetch } = useGroundFloorInfoQuery();
  const [enroll, { isLoading: enrolling }] = useGroundFloorEnrollMutation();
  const busy = enrolling;

  const [selected, setSelected] = useState(["breakfast", "lunch", "dinner"]);
  const [showPay, setShowPay] = useState(false);
  const [method, setMethod] = useState("upi");
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [selectedApp, setSelectedApp] = useState("Google Pay");
  const [justEnrolled, setJustEnrolled] = useState(null);
  const [showPassOnly, setShowPassOnly] = useState(true);

  const user = meData?.data?.user;
  const info = data?.data;
  const enrollment = justEnrolled?.enrollment || info?.enrollment;

  // Amount Calculation Formula:
  // Base 3-meal semester package: info.fee || 25000
  // All 4-meals package: info.fee4Meals || 30000 (adds the 4th meal for entire semester at bundle discount)
  const baseFee = Number(info?.fee) || 25000;
  const isAllMeals = selected.length === 4;
  const fee = isAllMeals ? (Number(info?.fee4Meals) || 30000) : baseFee;

  const perMealPrices = info?.perMealPrice || { breakfast: 40, lunch: 80, snacks: 30, dinner: 90 };
  const dailyRate = selected.reduce((sum, m) => sum + (Number(perMealPrices[m]) || MEAL_META[m]?.defaultPrice || 50), 0);
  const totalDays = Number(info?.totalDays) || 61;
  const standardDailyCost = dailyRate * totalDays;
  const savings = Math.max(0, standardDailyCost - fee);

  const toggle = (meal) => {
    setSelected((prev) => {
      if (prev.includes(meal)) {
        return prev.filter((m) => m !== meal);
      } else {
        return [...prev, meal];
      }
    });
  };

  const openPay = () => {
    if (selected.length < MIN_MEALS) {
      return toast.error(`Please select at least ${MIN_MEALS} meals to continue`);
    }
    setMethod("upi");
    setShowPay(true);
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText("iiitmess@iiitbh");
      toast.success("UPI ID copied: iiitmess@iiitbh");
    } catch {
      toast.info("UPI ID: iiitmess@iiitbh");
    }
  };

  const validatePay = () => {
    if (method === "card") {
      if (cardNum.replace(/\s/g, "").length < 12) {
        toast.error("Please enter a valid card number");
        return false;
      }
      if (!cardExpiry) {
        toast.error("Please enter expiry date");
        return false;
      }
      if (cardCvv.length < 3) {
        toast.error("Please enter CVV");
        return false;
      }
      if (!cardName.trim()) {
        toast.error("Please enter name on card");
        return false;
      }
    }
    if (method === "netbanking" && !selectedBank) {
      toast.error("Please select a bank");
      return false;
    }
    return true;
  };

  const handlePay = async () => {
    if (!validatePay()) return;
    try {
      const res = await enroll({ meals: selected, method }).unwrap();
      toast.success(`Payment verified! Rs. ${res.data.enrollment.amount.toLocaleString("en-IN")} received.`);
      setJustEnrolled(res.data);
      setShowPay(false);
      await refetch();
      const me = await refetchMe();
      if (me.data?.data?.user) dispatch(setUser(me.data.data.user));
    } catch (err) {
      toast.error(err?.data?.message || "Enrollment failed. Please try again.");
    }
  };

  const upiUrl = `upi://pay?pa=iiitmess@iiitbh&pn=IIIT%20Bhubaneswar%20Mess&am=${fee}&cu=INR&tn=GroundFloorSemesterPass`;

  if (isLoading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <div className="auth-spinner" style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading Ground Floor plan details...</p>
      </div>
    );
  }

  // Show pass if already enrolled
  if (enrollment && showPassOnly) {
    return (
      <EnrollmentPass
        enrollment={enrollment}
        user={user}
        onBack={() => navigate("/dashboard")}
        onModifyPlan={() => setShowPassOnly(false)}
      />
    );
  }

  return (
    <div style={{ maxWidth: 840, margin: "40px auto", padding: "0 24px" }}>
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(197, 160, 89, 0.12)", border: "1px solid rgba(197, 160, 89, 0.3)", color: "var(--luxury-gold-dark)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
          <Sparkles size={13} /> ALL-INCLUSIVE RESIDENTIAL DINING
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", color: "var(--royal-navy)", letterSpacing: "-0.03em" }}>
          Ground Floor Semester Enrollment
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: 15, lineHeight: 1.6 }}>
          Enjoy hassle-free dining for the entire semester. Pick your preferred meal combination, pay once with zero daily registrations, and receive your digital mess pass instantly.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 12, padding: "6px 14px", background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)" }}>
          <span><strong>Semester Window:</strong> {info?.semesterStart ? new Date(info.semesterStart).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Today"} to {info?.semesterEnd ? new Date(info.semesterEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "End of Term"}</span>
          <span style={{ color: "var(--border-color)" }}>|</span>
          <span><strong>Total Duration:</strong> {totalDays} Days</span>
        </div>
      </header>

      {/* Card 1: Choose Your Meals */}
      <div className="card" style={{ padding: 28, borderRadius: 18, marginBottom: 24, boxShadow: "0 4px 20px -2px rgba(10, 17, 40, 0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--royal-navy)" }}>
              Step 1: Choose Your Daily Meals
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
              Select at least 3 meals of your choice. You can also pick all 4 meals for full all-day dining.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className={`pill ${selected.length >= MIN_MEALS ? "pill-green" : "pill-amber"}`}
              style={{ fontSize: 12, padding: "6px 14px", fontWeight: 700 }}
            >
              {selected.length}/4 Selected {selected.length < MIN_MEALS ? `(Need ${MIN_MEALS - selected.length} more)` : selected.length === 4 ? "👑 Full 4-Meal Plan" : "✓ Standard 3-Meal Plan"}
            </span>
          </div>
        </div>

        {/* Meal Options Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 20 }}>
          {(info?.meals || ["breakfast", "lunch", "snacks", "dinner"]).map((meal) => {
            const meta = MEAL_META[meal] || { label: meal, time: "Flexible", icon: Utensils, defaultPrice: 50 };
            const Icon = meta.icon;
            const isSel = selected.includes(meal);
            const price = Number(perMealPrices[meal]) || meta.defaultPrice;

            return (
              <div
                key={meal}
                onClick={() => toggle(meal)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "18px 20px",
                  borderRadius: 14,
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  border: isSel ? "2px solid var(--luxury-gold)" : "1.5px solid var(--border-color)",
                  background: isSel
                    ? "linear-gradient(135deg, rgba(197, 160, 89, 0.12) 0%, #ffffff 100%)"
                    : "#ffffff",
                  boxShadow: isSel
                    ? "0 8px 24px -4px rgba(197, 160, 89, 0.22)"
                    : "0 2px 8px rgba(0, 0, 0, 0.02)",
                  transform: isSel ? "translateY(-2px)" : "none",
                  position: "relative"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: isSel ? "linear-gradient(135deg, var(--royal-navy) 0%, var(--royal-navy-light) 100%)" : "rgba(10, 17, 40, 0.04)",
                      color: isSel ? "var(--luxury-gold)" : "var(--royal-navy)",
                      display: "grid",
                      placeItems: "center",
                      transition: "all 0.2s ease"
                    }}>
                      <Icon size={22} />
                    </div>

                    <div style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: isSel ? "var(--luxury-gold)" : "transparent",
                      color: isSel ? "var(--royal-navy)" : "var(--text-muted)",
                      border: isSel ? "none" : "1px solid var(--border-color)"
                    }}>
                      {isSel ? <><Check size={12} strokeWidth={3} /> INCLUDED</> : "+ SELECT"}
                    </div>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 4px", color: "var(--royal-navy)" }}>
                    {meta.label}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>
                    {meta.time}
                  </p>
                </div>

                <div style={{ paddingTop: 12, borderTop: "1px dashed var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Session Rate</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--royal-navy)" }}>Rs. {price}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selection requirement warning */}
        {selected.length < MIN_MEALS && (
          <div style={{ marginTop: 20, padding: "12px 16px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
            <Info size={18} />
            <span>You currently have <strong>{selected.length}</strong> meals selected. Please pick at least <strong>3 meals</strong> to activate payment.</span>
          </div>
        )}
      </div>

      {/* Card 2: Transparent Formula & Cost Summary */}
      <div className="card" style={{ padding: 28, borderRadius: 18, borderLeft: "5px solid var(--luxury-gold)", marginBottom: 28, background: "linear-gradient(180deg, #ffffff 0%, #faf8f5 100%)", boxShadow: "0 8px 30px -4px rgba(197, 160, 89, 0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div style={{ flex: "1 1 380px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Calculator size={18} color="var(--luxury-gold-dark)" />
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--luxury-gold-dark)" }}>
                AMOUNT CALCULATION FORMULA & BREAKDOWN
              </span>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px", color: "var(--royal-navy)" }}>
              {isAllMeals ? "Full All-Inclusive 4-Meal Plan" : "Standard 3-Meal Semester Plan"}
            </h3>

            {/* Formula table */}
            <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: 12, padding: "14px 18px", marginTop: 12, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Selected Daily Meals:</span>
                <strong>{selected.map(m => MEAL_META[m]?.label || m).join(" + ") || "None"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Combined Daily Rate:</span>
                <span><strong>Rs. {dailyRate}</strong> / day</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Semester Duration ({totalDays} Days):</span>
                <span>Rs. {dailyRate} × {totalDays} = <del style={{ color: "var(--text-muted)" }}>Rs. {standardDailyCost.toLocaleString("en-IN")}</del></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 2px", color: "var(--luxury-emerald)", fontWeight: 700 }}>
                <span>Ground Floor Discounted Package:</span>
                <span>Rs. {fee.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "12px 0 0", lineHeight: 1.5 }}>
              * <strong>Pricing Formula:</strong> Base 3-Meal Semester Plan is fixed at <strong>Rs. {baseFee.toLocaleString("en-IN")}</strong>. Upgrading to all 4 meals adds full-day dining for just <strong>Rs. 5,000 extra</strong> (Total Rs. {(baseFee + 5000).toLocaleString("en-IN")}), saving you over Rs. {savings.toLocaleString("en-IN")} compared to individual meal vouchers.
            </p>
          </div>

          {/* Right Action Box */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", minWidth: 220 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
              TOTAL PAYABLE
            </span>
            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--royal-navy)", letterSpacing: "-0.03em", margin: "4px 0" }}>
              Rs. {fee.toLocaleString("en-IN")}
            </div>
            <span style={{ fontSize: 12, color: "var(--luxury-emerald)", fontWeight: 700, marginBottom: 16 }}>
              ✓ All mess dues & taxes included
            </span>

            <button
              className="landing-btn landing-btn-solid landing-btn-lg"
              onClick={openPay}
              disabled={selected.length < MIN_MEALS}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "16px 28px",
                fontSize: 15,
                opacity: selected.length < MIN_MEALS ? 0.5 : 1,
                cursor: selected.length < MIN_MEALS ? "not-allowed" : "pointer"
              }}
            >
              <CreditCard size={18} /> Proceed to Pay <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Redesigned Luxury Checkout Modal */}
      {showPay && (
        <div className="modal-overlay" onClick={() => !enrolling && setShowPay(false)}>
          <div
            className="payment-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 520, borderRadius: 20, overflow: "hidden", background: "#ffffff" }}
          >
            {/* Modal Top Banner */}
            <div className="payment-modal-top">
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--luxury-gold)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <Lock size={12} /> SECURE MESS CHECKOUT
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 0", color: "#ffffff" }}>
                  Ground Floor Semester Pass
                </h2>
              </div>
              <button
                onClick={() => !enrolling && setShowPay(false)}
                disabled={enrolling}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  borderRadius: 999,
                  width: 36,
                  height: 36,
                  display: "grid",
                  placeItems: "center",
                  color: "#ffffff",
                  cursor: enrolling ? "not-allowed" : "pointer"
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="payment-modal-body">
              {/* Order Summary Strip */}
              <div style={{
                background: "linear-gradient(135deg, rgba(10, 17, 40, 0.04) 0%, rgba(197, 160, 89, 0.08) 100%)",
                border: "1px solid rgba(197, 160, 89, 0.3)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.04em" }}>
                    {user?.name} ({user?.studentId || "Student"})
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--royal-navy)", marginTop: 2 }}>
                    {selected.map(m => MEAL_META[m]?.label || m).join(", ")}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                    Valid for {totalDays} days across semester
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>AMOUNT DUE</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--royal-navy)", letterSpacing: "-0.02em" }}>
                    Rs. {fee.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 10 }}>
                  CHOOSE PAYMENT METHOD
                </div>
                <div className="payment-methods" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {METHODS.map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      className={"method-tile" + (method === value ? " is-active" : "")}
                      onClick={() => setMethod(value)}
                      disabled={busy}
                      style={{ padding: "12px 10px", borderRadius: 12 }}
                    >
                      <Icon size={20} />
                      <div style={{ textAlign: "center", marginTop: 4 }}>
                        <strong style={{ display: "block", fontSize: 13 }}>{label}</strong>
                        <span style={{ fontSize: 10 }}>{desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI Tab */}
              {method === "upi" && (
                <div>
                  <div className="payment-qr-block" style={{ padding: "18px", borderRadius: 14, background: "#f8fafc", border: "1px solid var(--border-color)" }}>
                    <div className="payment-qr-label" style={{ fontSize: 11, color: "var(--royal-navy)" }}>
                      <Smartphone size={14} /> SCAN WITH GPAY, PHONEPE, OR PAYTM
                    </div>
                    <div className="payment-qr-canvas" style={{ padding: 12, background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}>
                      <QRCodeSVG value={upiUrl} size={140} level="M" />
                    </div>
                    <div className="payment-upi-id" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "var(--royal-navy)", background: "#ffffff", padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                        iiitmess@iiitbh
                      </span>
                      <button onClick={copyUpiId} className="payment-copy-btn" style={{ padding: "6px 12px", borderRadius: 8 }}>
                        <Copy size={13} /> Copy ID
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <p className="payment-section-label" style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Or pay with installed UPI app</p>
                    <div className="app-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                      {UPI_APPS.map((app) => (
                        <button
                          key={app}
                          type="button"
                          className={"app-tile" + (selectedApp === app ? " is-active" : "")}
                          onClick={() => setSelectedApp(app)}
                          disabled={enrolling}
                          style={{ padding: "10px 4px", fontSize: 12, textAlign: "center", borderRadius: 10 }}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {method === "card" && (
                <div className="payment-card-form" style={{ gap: 12 }}>
                  <label>
                    <span>Card Number</span>
                    <input
                      value={cardNum}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                        setCardNum(v.replace(/(\d{4})(?=\d)/g, "$1 "));
                      }}
                      placeholder="4532 •••• •••• 8910"
                      disabled={enrolling}
                      style={{ fontSize: 15 }}
                    />
                  </label>
                  <div className="card-row" style={{ gap: 12 }}>
                    <label>
                      <span>Valid Thru</span>
                      <input
                        value={cardExpiry}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setCardExpiry(v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v);
                        }}
                        placeholder="MM/YY"
                        disabled={enrolling}
                      />
                    </label>
                    <label>
                      <span>CVV / CVC</span>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="•••"
                        disabled={enrolling}
                      />
                    </label>
                  </div>
                  <label>
                    <span>Cardholder Full Name</span>
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Ayush Kumar"
                      disabled={enrolling}
                    />
                  </label>
                </div>
              )}

              {/* Net Banking Tab */}
              {method === "netbanking" && (
                <div className="payment-banks">
                  <p className="payment-section-label" style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Select Bank</p>
                  <div className="bank-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {BANKS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={"bank-tile" + (selectedBank === b ? " is-active" : "")}
                        onClick={() => setSelectedBank(b)}
                        disabled={enrolling}
                        style={{ padding: "12px 8px", fontSize: 13, borderRadius: 10, textAlign: "center" }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Modal Footer */}
            <div className="payment-modal-footer">
              <button
                className="payment-pay-btn"
                onClick={handlePay}
                disabled={busy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "16px",
                  fontSize: 16
                }}
              >
                {busy ? (
                  "Communicating with Gateway..."
                ) : (
                  <>
                    <Lock size={16} /> Confirm & Settle Rs. {fee.toLocaleString("en-IN")}
                  </>
                )}
              </button>
              <div className="payment-secure" style={{ marginTop: 10, fontSize: 11 }}>
                <ShieldCheck size={14} color="var(--luxury-emerald)" /> Institutional test gateway - automatic verification
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EnrollmentPass({ enrollment, user, onBack, onModifyPlan }) {
  if (!enrollment) {
    return (
      <div style={{ maxWidth: 640, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
        <p className="muted">Enrollment not found.</p>
        <button className="btn-primary" onClick={onBack}>Back to Dashboard</button>
      </div>
    );
  }

  const payment = enrollment.paymentId;
  const ref = payment?.providerRef || "-";
  const methodLabel = payment?.method ? payment.method.toUpperCase() : "UPI";

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 24px" }}>
      <div className="no-print" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={onBack} className="btn-small" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px" }}>
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          {onModifyPlan && (
            <button onClick={onModifyPlan} className="btn-small" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px" }}>
              <Calculator size={15} /> Modify Meals / Upgrade Plan
            </button>
          )}
          <button onClick={() => window.print()} className="landing-btn landing-btn-solid" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px" }}>
            <Printer size={16} /> Print / Save PDF Pass
          </button>
        </div>
      </div>

      <div className="ground-floor-pass-wrapper">
        <div className="ground-floor-pass" style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 14px 40px -4px rgba(10, 17, 40, 0.12)" }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, var(--royal-navy) 0%, #162447 100%)", padding: "30px 32px", color: "white", borderBottom: "3px solid var(--luxury-gold)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--luxury-gold)", fontWeight: 700 }}>
                  <Sparkles size={13} /> IIIT BHUBANESWAR - MESS PORTAL
                </div>
                <h1 style={{ margin: "8px 0 4px", fontSize: 28, color: "white", letterSpacing: -0.5 }}>
                  Ground Floor Semester Dining Pass
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255, 255, 255, 0.8)" }}>
                  All-inclusive residential semester access
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", opacity: 0.7, letterSpacing: 1 }}>PASS STATUS</div>
                <div style={{ fontSize: 13, fontWeight: 800, padding: "6px 18px", background: "var(--luxury-gold)", color: "var(--royal-navy)", borderRadius: 20, display: "inline-block", marginTop: 4, letterSpacing: 1 }}>
                  ACTIVE
                </div>
              </div>
            </div>
          </div>

          {/* Pass Body */}
          <div style={{ background: "white", padding: "32px", border: "1px solid #e5e7eb", borderTop: "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.8, fontWeight: 700 }}>STUDENT NAME</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--royal-navy)", marginTop: 4 }}>{user?.name || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.8, fontWeight: 700 }}>STUDENT ID</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--royal-navy)", marginTop: 4 }}>{user?.studentId || "-"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.8, fontWeight: 700 }}>HOSTEL & ROOM</div>
                <div style={{ fontSize: 15, color: "var(--text-primary)", marginTop: 4 }}>{user?.hostel?.name || "-"}{user?.roomNumber ? " / Room " + user.roomNumber : ""}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.8, fontWeight: 700 }}>REGISTERED EMAIL</div>
                <div style={{ fontSize: 14, color: "var(--text-primary)", marginTop: 4, wordBreak: "break-all" }}>{user?.email || "-"}</div>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border-color)", margin: "24px 0" }} />

            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.8, fontWeight: 700, marginBottom: 12 }}>
                AUTHORIZED MEALS INCLUDED
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {enrollment.meals.map((m) => {
                  const meta = MEAL_META[m] || { label: m, icon: Utensils };
                  const Icon = meta.icon;
                  return (
                    <span
                      key={m}
                      style={{
                        padding: "8px 18px",
                        background: "rgba(197, 160, 89, 0.12)",
                        color: "var(--luxury-gold-dark)",
                        border: "1.5px solid rgba(197, 160, 89, 0.4)",
                        borderRadius: 20,
                        fontSize: 14,
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8
                      }}
                    >
                      <Icon size={16} /> {meta.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.8, fontWeight: 700 }}>SEMESTER COMMENCEMENT</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {new Date(enrollment.semesterStart).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.8, fontWeight: 700 }}>VALID THROUGH</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {new Date(enrollment.semesterEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border-color)", margin: "24px 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.8, fontWeight: 700 }}>AMOUNT PAID</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--royal-navy)", marginTop: 4 }}>
                  Rs. {enrollment.amount.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.8, fontWeight: 700 }}>PAYMENT METHOD</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>{methodLabel}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: 0.8, fontWeight: 700 }}>DATE OF PAYMENT</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {new Date(enrollment.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: "14px 18px", background: "#f8fafc", borderRadius: 10, fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace", wordBreak: "break-all", border: "1px solid var(--border-color)" }}>
              <strong>Transaction Reference ID:</strong> {ref}
            </div>
          </div>

          <div style={{ background: "#f8fafb", padding: "16px 32px", borderRadius: "0 0 20px 20px", border: "1px solid #e2e8e6", borderTop: "none", textAlign: "center", fontSize: 12, color: "#64748b" }}>
            This digital pass grants uninterrupted dining at the Ground Floor dining facility. Present to mess counter supervisor on request.
            <br />Official Institutional Verification &bull; {new Date().toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <p className="no-print" style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
        Click <strong>Print / Save PDF Pass</strong> to download an official institutional receipt.
      </p>
    </div>
  );
}
