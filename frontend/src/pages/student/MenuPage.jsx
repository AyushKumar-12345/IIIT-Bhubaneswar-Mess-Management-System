import { useState } from "react";
import { useSelector } from "react-redux";
import {
  useUpcomingMenusQuery,
  useRegisterMealMutation,
  useCancelRegistrationMutation,
  useMyRegistrationsQuery
} from "../../app/api.js";
import { toast } from "sonner";
import {
  Clock, Leaf, Flame, ChevronLeft, ChevronRight, Egg, Utensils,
  Coffee, Moon, CheckCircle2, Building2, Sparkles, AlertCircle,
  Calendar, Check, X, ShieldCheck
} from "lucide-react";
import { getMealVisual } from "../../constants/mealVisuals.js";

const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", snacks: "Snacks", dinner: "Dinner" };

export default function MenuPage() {
  const user = useSelector((s) => s.auth.user);
  const isGroundFloor = user?.messSystem === "ground_floor";
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useUpcomingMenusQuery({ page, limit: 3, days: 30 });
  const { data: regData, refetch: refetchRegs } = useMyRegistrationsQuery();
  const [register] = useRegisterMealMutation();
  const [cancel] = useCancelRegistrationMutation();
  const [busy, setBusy] = useState(null);

  const menus = data?.data?.menus || [];
  const meta = data?.meta || { page: 1, pages: 0, total: 0 };
  const allRegs = regData?.data?.registrations || [];

  // Extract meals included in GF plan from any myRegistration that has isGroundFloor
  const gfMeals = (() => {
    if (!isGroundFloor) return [];
    const meals = new Set();
    for (const menu of menus) {
      for (const s of menu.sessions || []) {
        if (s.myRegistration?.isGroundFloor && s.myRegistration?.status === "registered") {
          meals.add(s.category);
        }
      }
    }
    return [...meals];
  })();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingRegistered = allRegs.filter((r) => {
    const sessionDate = r.session?.date ? new Date(r.session.date) : new Date(r.date);
    sessionDate.setHours(0, 0, 0, 0);
    return r.status === "registered" && sessionDate >= today;
  });

  const handleRegister = async (sessionId) => {
    setBusy(sessionId);
    try {
      await register({ sessionId }).unwrap();
      toast.success("Meal registered successfully! Added to your live billing ledger.");
      await Promise.all([refetch(), refetchRegs()]);
    } catch (err) {
      toast.error(err?.data?.message || "Registration failed");
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async (registrationId) => {
    if (!confirm("Are you sure you want to cancel this meal registration?")) return;
    setBusy(registrationId);
    try {
      await cancel(registrationId).unwrap();
      toast.success("Registration cancelled and removed from your bill");
      await Promise.all([refetch(), refetchRegs()]);
    } catch (err) {
      toast.error(err?.data?.message || "Cancellation failed");
    } finally {
      setBusy(null);
    }
  };

  const isToday = (date) => new Date(date).toDateString() === new Date().toDateString();
  const isTomorrow = (date) => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return new Date(date).toDateString() === t.toDateString();
  };

  return (
    <div className="page">
      <header className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              color: "var(--luxury-gold-dark)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 4
            }}>
              <Sparkles size={13} /> {isGroundFloor ? "GROUND FLOOR SEMESTER PLAN" : "1ST FLOOR FLEXIBLE MESS"}
            </div>
            <h1>{isGroundFloor ? "Semester Dining Menu" : "Menu & Meal Registration"}</h1>
            <p className="muted" style={{ margin: 0 }}>
              {isGroundFloor
                ? "Your daily meals are pre-activated as part of your semester pass. Walk in and scan to dine."
                : "Register for meals in advance before the 2-hour cutoff. Cancel anytime prior to cutoff with 0 penalty."}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {!isGroundFloor && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "#ffffff",
                border: "1.5px solid rgba(197, 160, 89, 0.35)",
                borderRadius: 12,
                padding: "8px 16px",
                boxShadow: "0 4px 14px rgba(10, 17, 40, 0.04)"
              }}>
                <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 700 }}>FIXED RATES:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--royal-navy)" }}>B: ₹40</span>
                <span style={{ color: "#cbd5e1" }}>·</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--royal-navy)" }}>L: ₹80</span>
                <span style={{ color: "#cbd5e1" }}>·</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--royal-navy)" }}>S: ₹30</span>
                <span style={{ color: "#cbd5e1" }}>·</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--royal-navy)" }}>D: ₹90</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Ground Floor In-Plan Banner */}
      {isGroundFloor && gfMeals.length > 0 && (
        <div className="card" style={{
          marginBottom: 24,
          borderLeft: "4px solid var(--luxury-gold)",
          background: "linear-gradient(135deg, rgba(10, 17, 40, 0.03) 0%, rgba(197, 160, 89, 0.08) 100%)",
          borderRadius: 14,
          padding: "16px 20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Building2 size={18} color="var(--royal-navy)" />
            <strong style={{ fontSize: 14, color: "var(--royal-navy)" }}>Ground Floor Semester Pass Active</strong>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
            You are enrolled for: <strong>{gfMeals.map((m) => MEAL_LABELS[m] || m).join(", ")}</strong> daily. Just show your pass at the counter.
          </p>
        </div>
      )}

      {/* 1st Floor Registered Meals Panel */}
      {!isGroundFloor && upcomingRegistered.length > 0 && (
        <div className="card" style={{
          marginBottom: 28,
          borderLeft: "4px solid var(--luxury-gold)",
          background: "linear-gradient(135deg, #ffffff 0%, #faf8f5 100%)",
          borderRadius: 16,
          padding: "20px 24px",
          boxShadow: "0 4px 18px rgba(10, 17, 40, 0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(5, 150, 105, 0.12)",
                color: "#059669",
                display: "grid",
                placeItems: "center"
              }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--royal-navy)" }}>
                  Your Confirmed Meal Registrations
                </h3>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {upcomingRegistered.length} upcoming meal{upcomingRegistered.length > 1 ? "s" : ""} booked on your live ledger
                </span>
              </div>
            </div>

            <span className="pill pill-green" style={{ fontSize: 11.5, fontWeight: 700 }}>
              ✓ Billed & Active
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {upcomingRegistered.map((r) => {
              const sessionDate = r.session?.date ? new Date(r.session.date) : new Date(r.date);
              const category = r.session?.category || "meal";
              return (
                <div
                  key={r._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "#ffffff",
                    borderRadius: 12,
                    border: "1px solid rgba(197, 160, 89, 0.3)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(10, 17, 40, 0.05)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--royal-navy)"
                    }}>
                      {category === "breakfast" && <Egg size={15} />}
                      {category === "lunch" && <Utensils size={15} />}
                      {category === "snacks" && <Coffee size={15} />}
                      {category === "dinner" && <Moon size={15} />}
                    </div>
                    <div>
                      <strong style={{ textTransform: "capitalize", fontSize: 13, color: "var(--royal-navy)", display: "block" }}>
                        {category}
                      </strong>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {sessionDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                        {r.session?.startTime ? ` · ${r.session.startTime}` : ""}
                      </span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#059669",
                    background: "rgba(5, 150, 105, 0.1)",
                    padding: "3px 8px",
                    borderRadius: 6
                  }}>
                    Rs. {r.session?.unitPrice || 0}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p className="muted" style={{ margin: 0 }}>Loading published menus...</p>
        </div>
      ) : menus.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48, borderRadius: 18 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "rgba(197, 160, 89, 0.12)",
            color: "var(--luxury-gold-dark)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 14px"
          }}>
            <Calendar size={24} />
          </div>
          <h3 style={{ margin: "0 0 6px", fontSize: 17, color: "var(--text-primary)" }}>No menus published yet</h3>
          <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
            The mess admin publishes upcoming meal menus weekly. Please check back shortly.
          </p>
        </div>
      ) : (
        <>
          {menus.map((menu) => (
            <section key={menu._id} style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--royal-navy)" }}>
                  {new Date(menu.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </h2>
                {isToday(menu.date) && <span className="pill pill-green">Today's Menu</span>}
                {isTomorrow(menu.date) && <span className="pill pill-amber">Tomorrow</span>}
              </div>

              <div className="meal-grid">
                {menu.sessions.map((s) => {
                  const isGfReg = s.myRegistration?.isGroundFloor === true && s.myRegistration?.status === "registered";
                  const isReg = s.myRegistration?.status === "registered";
                  const isAttended = s.myRegistration?.status === "attended";
                  const isEnrolledMeal = isGroundFloor && (isGfReg || isAttended);
                  const visual = getMealVisual(s.category);

                  return (
                    <div
                      key={s._id}
                      className="meal-card"
                      style={{
                        padding: 0,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 18,
                        boxShadow: "0 6px 20px -2px rgba(10, 17, 40, 0.06)",
                        border: isReg || isEnrolledMeal ? "2px solid var(--luxury-gold)" : "1px solid var(--border-color)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {/* Food Photography Banner */}
                      <div className="meal-card-visual" style={{ position: "relative", height: 140, overflow: "hidden" }}>
                        <img
                          src={visual.image}
                          alt={visual.label}
                          className="meal-card-img"
                          onError={(e) => { e.currentTarget.src = visual.fallbackUrl; }}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div className="meal-card-overlay" style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(180deg, rgba(10, 17, 40, 0.1) 0%, rgba(10, 17, 40, 0.7) 100%)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                          padding: "10px 14px"
                        }}>
                          <span className="meal-badge-floating" style={{
                            background: "rgba(10, 17, 40, 0.75)",
                            backdropFilter: "blur(4px)",
                            color: "var(--luxury-gold)",
                            border: "1px solid rgba(197, 160, 89, 0.4)",
                            borderRadius: 6,
                            padding: "3px 8px",
                            fontSize: 11,
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4
                          }}>
                            {s.category === "breakfast" && <Egg size={12} />}
                            {s.category === "lunch" && <Utensils size={12} />}
                            {s.category === "snacks" && <Coffee size={12} />}
                            {s.category === "dinner" && <Moon size={12} />}
                            {visual.label}
                          </span>
                          <span className="meal-badge-time" style={{
                            background: "rgba(255, 255, 255, 0.9)",
                            color: "var(--royal-navy)",
                            borderRadius: 6,
                            padding: "3px 8px",
                            fontSize: 11,
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4
                          }}>
                            <Clock size={11} /> {s.startTime} - {s.endTime}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                          <h3 style={{ textTransform: "capitalize", margin: 0, fontSize: 17, fontWeight: 800, color: "var(--royal-navy)" }}>
                            {s.category}
                          </h3>
                          {!isGroundFloor && (
                            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--royal-navy)" }}>
                              Rs. {s.unitPrice}
                            </span>
                          )}
                          {isGroundFloor && (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--luxury-gold-dark)",
                              background: "rgba(197, 160, 89, 0.12)",
                              padding: "2px 8px",
                              borderRadius: 6,
                              border: "1px solid rgba(197, 160, 89, 0.3)"
                            }}>
                              IN SEMESTER PASS
                            </span>
                          )}
                        </div>

                        {/* Dish List with Dietary Dots */}
                        {s.items && s.items.length > 0 && (
                          <ul className="meal-items" style={{ margin: "8px 0 16px", padding: 0, listStyle: "none", flex: 1 }}>
                            {s.items.map((item, i) => (
                              <li key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, fontSize: 12.5, color: "var(--text-secondary)" }}>
                                {item.dietary === "non_veg" ? (
                                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#dc2626", flexShrink: 0 }} title="Non-Vegetarian" />
                                ) : (
                                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} title="Pure Vegetarian" />
                                )}
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Status Strip & Actions */}
                        <div style={{
                          marginTop: "auto",
                          paddingTop: 12,
                          borderTop: "1px solid var(--border-light)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div>
                            {isAttended ? (
                              <span className="pill pill-green">Attended</span>
                            ) : isGfReg ? (
                              <span className="pill pill-green">Pass Active</span>
                            ) : isReg ? (
                              <span className="pill pill-green">Registered</span>
                            ) : s.registrationOpen ? (
                              <span className="pill pill-muted">Open</span>
                            ) : (
                              <span className="pill pill-amber">Closed</span>
                            )}
                          </div>

                          {/* 1st floor actions */}
                          {!isGroundFloor && isReg && !isAttended && s.cancellationOpen && (
                            <button
                              type="button"
                              className="btn-danger"
                              disabled={busy === s.myRegistration._id}
                              onClick={() => handleCancel(s.myRegistration._id)}
                              style={{
                                border: "1px solid #f87171",
                                background: "#fee2e2",
                                color: "#b91c1c",
                                borderRadius: 8,
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              {busy === s.myRegistration._id ? "Cancelling..." : "Cancel"}
                            </button>
                          )}

                          {!isGroundFloor && !isReg && !isAttended && s.registrationOpen && (
                            <button
                              type="button"
                              disabled={busy === s._id}
                              onClick={() => handleRegister(s._id)}
                              style={{
                                background: "linear-gradient(135deg, var(--royal-navy) 0%, #162447 100%)",
                                color: "#ffffff",
                                border: "1px solid var(--luxury-gold)",
                                borderRadius: 8,
                                padding: "7px 14px",
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: busy === s._id ? "not-allowed" : "pointer",
                                boxShadow: "0 2px 8px rgba(10, 17, 40, 0.15)"
                              }}
                            >
                              {busy === s._id ? "Registering..." : `Register (Rs. ${s.unitPrice})`}
                            </button>
                          )}

                          {!isGroundFloor && !isReg && !isAttended && !s.registrationOpen && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                              Past cutoff
                            </span>
                          )}

                          {isGroundFloor && isEnrolledMeal && !isAttended && (
                            <span style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>
                              Walk-in with pass
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {meta.pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <button
                className="btn-small"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                Page {meta.page} of {meta.pages} ({meta.total} days)
              </span>
              <button
                className="btn-small"
                disabled={page >= meta.pages}
                onClick={() => setPage(page + 1)}
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
