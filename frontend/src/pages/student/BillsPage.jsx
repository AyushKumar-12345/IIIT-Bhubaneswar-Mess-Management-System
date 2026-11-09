import { useState } from "react";
import {
  useRunningBillQuery,
  usePayDirectMutation,
  useMyPaymentsQuery,
  useMeQuery
} from "../../app/api.js";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  X, CreditCard, Smartphone, Building2, CheckCircle2, Copy,
  Sparkles, ShieldCheck, Lock, IndianRupee, Check, Receipt,
  ArrowRight, Landmark, AlertCircle
} from "lucide-react";

const METHODS = [
  { value: "upi", label: "Direct UPI & QR", icon: Smartphone, desc: "Instant QR Scanner & Apps" },
  { value: "card", label: "Direct Card", icon: CreditCard, desc: "Debit & Credit Simulator" },
  { value: "netbanking", label: "Direct Net Banking", icon: Building2, desc: "Major Institutional Banks" }
];

const UPI_APPS = [
  { name: "Google Pay", id: "gpay" },
  { name: "PhonePe", id: "phonepe" },
  { name: "Paytm", id: "paytm" },
  { name: "BHIM UPI", id: "bhim" }
];

const BANKS = [
  { code: "SBI", name: "State Bank of India" },
  { code: "HDFC", name: "HDFC Bank" },
  { code: "ICICI", name: "ICICI Bank" },
  { code: "Axis", name: "Axis Bank" },
  { code: "Kotak", name: "Kotak Mahindra" },
  { code: "PNB", name: "Punjab National Bank" }
];

export default function BillsPage() {
  const { data: meData } = useMeQuery();
  const { data: runningData, refetch: refetchRunning, isLoading: loadingBill } = useRunningBillQuery();
  const { data: paymentsData, refetch: refetchPayments } = useMyPaymentsQuery();
  const [payDirect, { isLoading: payingDirect }] = usePayDirectMutation();

  const user = meData?.data?.user;

  const [showPay, setShowPay] = useState(false);
  const [method, setMethod] = useState("upi");
  const [amount, setAmount] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("SBI");
  const [selectedApp, setSelectedApp] = useState("Google Pay");

  const running = runningData?.data?.bill;
  const payments = paymentsData?.data?.payments || [];
  const total = running?.total || 0;
  const totalPaid = running?.totalPaid || 0;
  const owed = running?.outstanding || 0;
  const busy = payingDirect;

  const upiUrl = `upi://pay?pa=iiitmess@iiitbh&pn=IIIT%20Bhubaneswar%20Mess&am=${amount || owed || 0}&cu=INR&tn=MessBillSettlement`;

  const openPay = () => {
    setAmount(owed > 0 ? String(owed) : "");
    setMethod("upi");
    setCardNum("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setSelectedBank("SBI");
    setSelectedApp("Google Pay");
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

  const handlePay = async (e) => {
    e?.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Please enter a valid payment amount");
    if (amt > owed + 0.01) return toast.error(`Amount exceeds outstanding Rs. ${owed}`);

    // Flow 1: Direct Card Simulation
    if (method === "card") {
      const cleanNum = cardNum.replace(/\s/g, "");
      if (cleanNum.length < 12) return toast.error("Please enter a valid 16-digit card number");
      if (!cardExpiry || cardExpiry.length < 5) return toast.error("Please enter card expiry as MM/YY");
      if (cardCvv.length < 3) return toast.error("Please enter 3 or 4 digit CVV");
      if (!cardName.trim()) return toast.error("Please enter cardholder name");
    }

    // Flow 3: Direct Net Banking Simulation
    if (method === "netbanking" && !selectedBank) {
      return toast.error("Please select your bank");
    }

    // Flow 4: Direct Simulator Settlement
    try {
      await payDirect({ amount: amt, method }).unwrap();
      toast.success(`Payment of Rs. ${amt.toLocaleString("en-IN")} verified & recorded successfully!`);
      setShowPay(false);
      setAmount("");
      await Promise.all([refetchRunning(), refetchPayments()]);
    } catch (err) {
      toast.error(err?.data?.message || err?.error || "Payment transaction could not be completed");
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>My Bills</h1>
          <p className="muted">Live itemized mess ledger, payment records, and integrated checkout</p>
        </div>
      </header>

      {loadingBill && !running ? (
        <div className="card" style={{ textAlign: "center", padding: 36 }}>
          <p className="muted" style={{ margin: 0 }}>Loading your live bill ledger...</p>
        </div>
      ) : total === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 44 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(197, 160, 89, 0.12)",
            color: "var(--luxury-gold-dark)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 14px"
          }}>
            <Sparkles size={28} />
          </div>
          <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "var(--text-primary)" }}>No active charges this month</h3>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            Go to <strong>Menu</strong> and register for a meal session to start your monthly dining account.
          </p>
        </div>
      ) : (
        <div className="bill-summary">
          <div className="bill-summary-head">
            <div className="bill-summary-info">
              <div className="bill-summary-label">
                {running?.month && running?.year
                  ? new Date(running.year, running.month - 1).toLocaleString("en-IN", { month: "long", year: "numeric" })
                  : "Current Billing Cycle"}
              </div>
              <div className="bill-summary-amounts">
                <div>
                  <div className="bill-amt-label">Consumed Total</div>
                  <div className="bill-amt-value">Rs. {total.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <div className="bill-amt-label">Total Paid</div>
                  <div className="bill-amt-value" style={{ color: "#059669" }}>
                    Rs. {totalPaid.toLocaleString("en-IN")}
                  </div>
                  {payments.length > 0 && (
                    <div className="bill-amt-sub">
                      {payments.length} payment{payments.length > 1 ? "s" : ""} recorded
                    </div>
                  )}
                </div>
                <div>
                  <div className="bill-amt-label">Outstanding Due</div>
                  <div className="bill-amt-value" style={{ color: owed > 0 ? "#dc2626" : "#059669" }}>
                    Rs. {owed.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>

            {owed > 0 ? (
              <button
                type="button"
                className="pay-now-btn"
                onClick={openPay}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer"
                }}
              >
                <Lock size={16} /> Pay Rs. {owed.toLocaleString("en-IN")}
              </button>
            ) : (
              <div className="bill-status-badge">
                <CheckCircle2 size={16} /> Paid in full
              </div>
            )}
          </div>

          {running?.items && running.items.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ marginTop: 20 }}>
                <thead>
                  <tr>
                    <th>Meal Session</th>
                    <th>Count</th>
                    <th>Unit Rate</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {running.items.map((it, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{it.label}</td>
                      <td>{it.quantity}</td>
                      <td>Rs. {it.unitPrice}</td>
                      <td style={{ fontWeight: 700, color: "var(--royal-navy)" }}>Rs. {it.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment History Section */}
      <h2 style={{ fontSize: 18, marginTop: 36, display: "flex", alignItems: "center", gap: 8 }}>
        <Receipt size={18} color="var(--luxury-gold-dark)" /> Payment History & Verified Receipts
      </h2>
      {payments.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 28, marginTop: 12 }}>
          <p className="muted" style={{ margin: 0 }}>No payment transactions recorded for this account yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Gateway / Method</th>
                <th>Transaction Ref</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontSize: 12 }}>
                    {new Date(p.paidAt || p.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td style={{ fontWeight: 800, color: "var(--royal-navy)" }}>
                    Rs. {Number(p.amount).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span className="pill pill-muted" style={{ textTransform: "capitalize" }}>
                      {p.method}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {p.providerRef || p._id}
                  </td>
                  <td>
                    <span className={"pill " + (p.status === "success" ? "pill-green" : "pill-amber")}>
                      {p.status === "success" ? "Paid Verified" : p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Level-Next Luxury Checkout Modal */}
      {showPay && running && (
        <div className="modal-overlay" onClick={() => !busy && setShowPay(false)}>
          <div
            className="payment-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 530,
              borderRadius: 20,
              overflow: "hidden",
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh"
            }}
          >
            {/* Modal Top Banner */}
            <div className="payment-modal-top">
              <div>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--luxury-gold)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase"
                }}>
                  <Lock size={12} /> SECURE INTEGRATED GATEWAY
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 0", color: "#ffffff" }}>
                  Settle Mess Balance
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !busy && setShowPay(false)}
                disabled={busy}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  borderRadius: 999,
                  width: 36,
                  height: 36,
                  display: "grid",
                  placeItems: "center",
                  color: "#ffffff",
                  cursor: busy ? "not-allowed" : "pointer"
                }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="payment-modal-body" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {/* Order Due Summary Card */}
              <div style={{
                background: "linear-gradient(135deg, rgba(10, 17, 40, 0.03) 0%, rgba(197, 160, 89, 0.08) 100%)",
                border: "1.5px solid rgba(197, 160, 89, 0.3)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.05em" }}>
                    TOTAL OUTSTANDING DUE
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "var(--royal-navy)", marginTop: 2 }}>
                    Rs. {owed.toLocaleString("en-IN")}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    onClick={() => setAmount(String(owed))}
                    style={{
                      background: "rgba(10, 17, 40, 0.08)",
                      border: "1px solid rgba(10, 17, 40, 0.15)",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "var(--royal-navy)",
                      cursor: "pointer"
                    }}
                  >
                    Pay Full Due
                  </button>
                </div>
              </div>

              {/* Amount Custom Input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                  Amount to Settle (Rs.)
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontWeight: 700 }}>
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={owed}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={busy}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      fontSize: 18,
                      fontWeight: 800,
                      borderRadius: 10,
                      border: "1.5px solid var(--border-color)",
                      color: "var(--royal-navy)",
                      background: "#ffffff"
                    }}
                    placeholder={`Max ${owed}`}
                  />
                </div>
              </div>

              {/* Payment Method Switcher */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.05em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                  CHOOSE CHECKOUT METHOD
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {METHODS.map(({ value, label, icon: Icon, desc }) => {
                    const active = method === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMethod(value)}
                        disabled={busy}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 14px",
                          borderRadius: 12,
                          background: active ? "linear-gradient(135deg, #0a1128 0%, #162447 100%)" : "#ffffff",
                          color: active ? "#ffffff" : "var(--text-primary)",
                          border: active ? "2px solid #c5a059" : "1.5px solid var(--border-color)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          textAlign: "left",
                          boxShadow: active ? "0 6px 16px rgba(10, 17, 40, 0.2)" : "none"
                        }}
                      >
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: active ? "rgba(197, 160, 89, 0.2)" : "#f1f5f9",
                          color: active ? "#dfb76c" : "var(--royal-navy)",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0
                        }}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: 12.5, fontWeight: 700 }}>{label}</strong>
                          <span style={{ fontSize: 10, color: active ? "rgba(255, 255, 255, 0.75)" : "var(--text-muted)", display: "block", marginTop: 2 }}>
                            {desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method Detail Panels */}
              {method === "upi" && (
                <div style={{
                  background: "#f8fafc",
                  borderRadius: 14,
                  padding: 18,
                  border: "1px solid #e2e8f0",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--royal-navy)", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Smartphone size={14} color="var(--luxury-gold-dark)" /> Scan QR with Any UPI App
                  </div>

                  <div style={{
                    display: "inline-block",
                    padding: 12,
                    background: "#ffffff",
                    borderRadius: 14,
                    border: "2px solid var(--luxury-gold)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                    marginBottom: 12
                  }}>
                    <QRCodeSVG value={upiUrl} size={150} level="M" />
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "6px 14px",
                    maxWidth: 240,
                    margin: "0 auto 14px"
                  }}>
                    <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "var(--royal-navy)" }}>
                      iiitmess@iiitbh
                    </span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--luxury-gold-dark)",
                        fontWeight: 700,
                        fontSize: 11,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3
                      }}
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {UPI_APPS.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedApp(app.name)}
                        style={{
                          background: selectedApp === app.name ? "rgba(197, 160, 89, 0.15)" : "#ffffff",
                          border: selectedApp === app.name ? "1.5px solid var(--luxury-gold)" : "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "8px 4px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: selectedApp === app.name ? "var(--royal-navy)" : "var(--text-secondary)",
                          cursor: "pointer"
                        }}
                      >
                        {app.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {method === "card" && (
                <div style={{
                  background: "#f8fafc",
                  borderRadius: 14,
                  padding: 18,
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #0a1128 0%, #162447 100%)",
                    borderRadius: 12,
                    padding: 16,
                    color: "#ffffff",
                    marginBottom: 16,
                    boxShadow: "0 8px 20px rgba(10, 17, 40, 0.3)",
                    border: "1px solid rgba(197, 160, 89, 0.4)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#dfb76c", fontWeight: 800 }}>IIIT DEBIT / CREDIT</span>
                      <CreditCard size={18} color="#dfb76c" />
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: 15, letterSpacing: 2, marginBottom: 10 }}>
                      {cardNum || "•••• •••• •••• ••••"}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255, 255, 255, 0.8)" }}>
                      <span>{cardName || "STUDENT NAME"}</span>
                      <span>{cardExpiry || "MM/YY"}</span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                        CARD NUMBER
                      </label>
                      <input
                        value={cardNum}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                          setCardNum(v.replace(/(\d{4})(?=\d)/g, "$1 "));
                        }}
                        placeholder="4532 •••• •••• 8890"
                        disabled={busy}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: 13,
                          fontFamily: "monospace",
                          background: "#ffffff"
                        }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                          EXPIRY
                        </label>
                        <input
                          value={cardExpiry}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setCardExpiry(v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v);
                          }}
                          placeholder="MM/YY"
                          disabled={busy}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: "1px solid #cbd5e1",
                            fontSize: 13,
                            background: "#ffffff"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                          CVV
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="•••"
                          disabled={busy}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: "1px solid #cbd5e1",
                            fontSize: 13,
                            background: "#ffffff"
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                        CARDHOLDER NAME
                      </label>
                      <input
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Full Name as on card"
                        disabled={busy}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                          fontSize: 13,
                          background: "#ffffff"
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === "netbanking" && (
                <div style={{
                  background: "#f8fafc",
                  borderRadius: 14,
                  padding: 18,
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--royal-navy)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <Landmark size={14} color="var(--luxury-gold-dark)" /> Select Institutional Bank Account
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                    {BANKS.map((b) => {
                      const active = selectedBank === b.code;
                      return (
                        <button
                          key={b.code}
                          type="button"
                          onClick={() => setSelectedBank(b.code)}
                          disabled={busy}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "12px",
                            borderRadius: 10,
                            background: active ? "rgba(197, 160, 89, 0.15)" : "#ffffff",
                            border: active ? "2px solid var(--luxury-gold)" : "1px solid #e2e8f0",
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                        >
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: active ? "var(--royal-navy)" : "#f1f5f9",
                            color: active ? "#dfb76c" : "var(--royal-navy)",
                            display: "grid",
                            placeItems: "center",
                            fontSize: 10,
                            fontWeight: 800
                          }}>
                            {b.code.slice(0, 3)}
                          </div>
                          <div>
                            <strong style={{ display: "block", fontSize: 12, color: "var(--royal-navy)" }}>{b.name}</strong>
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Retail & Corporate</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Guaranteed Sticky Modal Footer */}
            <div className="payment-modal-footer" style={{
              padding: "16px 24px 20px",
              background: "#ffffff",
              borderTop: "1.5px solid var(--border-light)",
              boxShadow: "0 -8px 20px rgba(0, 0, 0, 0.05)"
            }}>
              <button
                type="button"
                className="payment-pay-btn"
                onClick={handlePay}
                disabled={busy || !amount || Number(amount) <= 0}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "15px 20px",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: busy || !amount || Number(amount) <= 0 ? "not-allowed" : "pointer",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #0a1128 0%, #162447 100%)",
                  color: "#ffffff",
                  border: "1.5px solid #c5a059",
                  boxShadow: "0 4px 14px rgba(10, 17, 40, 0.3)"
                }}
              >
                {busy ? (
                  "Communicating with Gateway..."
                ) : (
                  <>
                    <Lock size={16} /> Confirm & Settle Rs. {Number(amount || owed || 0).toLocaleString("en-IN")}
                  </>
                )}
              </button>
              <div style={{
                marginTop: 8,
                fontSize: 11,
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5
              }}>
                <ShieldCheck size={13} color="#059669" />
                <span>256-bit encrypted checkout • Automatic ledger reconciliation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
