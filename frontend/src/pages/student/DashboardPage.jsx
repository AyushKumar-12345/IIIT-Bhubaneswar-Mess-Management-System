import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  useMeQuery,
  useTodayMenuQuery,
  useListAnnouncementsQuery,
  useUpcomingMenusQuery,
  useRunningBillQuery,
  useGroundFloorInfoQuery,
  useMyNotificationsQuery,
  useMyAttendanceQuery
} from "../../app/api.js";
import { Megaphone, Clock, Calendar, ArrowRight, Building2, Check, IndianRupee, Egg, Utensils, Coffee, Moon, Sparkles, Bell } from "lucide-react";
import { getMealVisual } from "../../constants/mealVisuals.js";

const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", snacks: "Snacks", dinner: "Dinner" };

export default function DashboardPage() {
  const [upcomingPage, setUpcomingPage] = useState(1);
  const { data: me, refetch: refetchMe } = useMeQuery();
  const { data: today, isLoading, refetch: refetchToday } = useTodayMenuQuery();
  const { data: annData, refetch: refetchAnn } = useListAnnouncementsQuery();
  const { data: upcomingData, refetch: refetchUpcoming } = useUpcomingMenusQuery({ page: upcomingPage, limit: 3, days: 30 });
  const isStudent = me?.data?.user?.role === "student";
  const isGroundFloor = me?.data?.user?.messSystem === "ground_floor";
  const { data: runningData, refetch: refetchRunning } = useRunningBillQuery(undefined, { skip: !isStudent || isGroundFloor });
  const { data: gfData, refetch: refetchGf } = useGroundFloorInfoQuery(undefined, { skip: !isGroundFloor });
  const { data: notifData, refetch: refetchNotifs } = useMyNotificationsQuery(undefined, { skip: !isStudent });
  const { data: attendanceData, refetch: refetchAtt } = useMyAttendanceQuery(undefined, { skip: !isStudent });

  const user = me?.data?.user;
  const ctx = user?.context || {};
  const sessions = today?.data?.sessions || [];
  const announcements = (annData?.data?.announcements || []).slice(0, 2);
  const upcoming = upcomingData?.data?.menus || [];
  const runningBill = runningData?.data?.bill;
  const groundFloor = gfData?.data;

  // Real-time unread notification calculation
  const notifications = notifData?.data?.notifications || [];
  const unreadNotifs = notifications.filter((n) => !n.readAt).length;
  const unreadCount = notifData ? unreadNotifs : (ctx.unreadNotifications ?? 0);

  // Real-time verified attendance count
  const attendances = attendanceData?.data?.attendance || [];
  const attendanceCount = attendanceData ? attendances.length : (ctx.attendanceThisMonth ?? 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Welcome, {user?.name?.split(" ")[0] || "there"}</h1>
          <p className="muted">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {user?.hostel && <> · {user.hostel.name} · Room {user.roomNumber}</>}
          </p>
        </div>
      </header>

      {/* Ground floor enrollment card */}
      {isGroundFloor && groundFloor && (
        <div className="card" style={{ marginBottom: 24, borderLeft: "4px solid var(--luxury-gold)", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Building2 size={20} color="var(--royal-navy)" />
                <strong style={{ fontSize: 16, color: "var(--text-primary)" }}>Ground Floor Semester Plan</strong>
              </div>
              {groundFloor.enrollment ? (
                <>
                  <p style={{ margin: "4px 0", fontSize: 13, color: "var(--text-secondary)" }}>
                    <strong>Meals:</strong> {groundFloor.enrollment.meals.map((m) => MEAL_LABELS[m]).join(", ")}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: 13, color: "var(--text-secondary)" }}>
                    <strong>Semester:</strong> {new Date(groundFloor.enrollment.semesterStart).toLocaleDateString("en-IN")} to {new Date(groundFloor.enrollment.semesterEnd).toLocaleDateString("en-IN")}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: 13, color: "var(--text-secondary)" }}>
                    <strong>Paid:</strong> <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontWeight: 700, color: "var(--royal-navy)" }}><IndianRupee size={12} /> {groundFloor.enrollment.amount}</span>
                  </p>
                  <p style={{ margin: "4px 0", fontSize: 12, color: "var(--text-muted)" }}>
                    Enrolled on {new Date(groundFloor.enrollment.paidAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>No active enrollment found. Contact admin.</p>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link to="/ground-floor/enroll" className="btn-primary" style={{ textDecoration: "none", background: "var(--royal-navy)", color: "#ffffff", padding: "8px 16px", fontSize: 13 }}>
                View Pass
              </Link>
              <Link to="/menu" className="btn-small" style={{ textDecoration: "none", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}>
                View menu
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats - 1st floor shows bill, ground floor shows enrollment */}
      {isStudent && !isGroundFloor && (
        <section className="stat-grid">
          <div className="stat-card" style={{ borderLeft: "4px solid var(--luxury-gold)" }}>
            <span>This month (live)</span>
            <strong>Rs. {runningBill?.total ?? 0}</strong>
            <small>Updates on registration</small>
          </div>
          <div className="stat-card">
            <span>Meals this month</span>
            <strong>{attendanceCount}</strong>
            <small>Verified attendances</small>
          </div>
          <div className="stat-card">
            <span>Current bill</span>
            <strong>Rs. {runningBill?.total ?? ctx.currentBill?.total ?? 0}</strong>
            <small>{runningBill?.outstanding > 0 ? `Rs. ${runningBill.outstanding} pending` : "Fully cleared"}</small>
          </div>
          <div className="stat-card">
            <span>Notifications</span>
            <strong style={{ color: unreadCount > 0 ? "var(--luxury-gold-dark)" : "var(--royal-navy)" }}>
              {unreadCount}
            </strong>
            <small>{unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}` : "All caught up"}</small>
          </div>
        </section>
      )}

      {/* Today's menu / 1st floor registration panel */}
      {!isGroundFloor && (
        <section>
          <h2>{isStudent ? "Today's meals" : "Today's menu"}</h2>
          {isLoading ? <p>Loading...</p> : sessions.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 24 }}>
              <p className="muted" style={{ margin: 0 }}>No menu published for today.</p>
            </div>
          ) : (
            <div className="meal-grid">
              {sessions.map((s) => {
                const visual = getMealVisual(s.category);
                const isRegistered = s.myRegistration?.status === "registered";
                const isAttended = s.myRegistration?.status === "attended";
                return (
                  <div key={s._id} className="meal-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div className="meal-card-visual">
                      <img
                        src={visual.image}
                        alt={visual.label}
                        className="meal-card-img"
                        onError={(e) => { e.currentTarget.src = visual.fallbackUrl; }}
                      />
                      <div className="meal-card-overlay">
                        <span className="meal-badge-floating">
                          {s.category === "breakfast" && <Egg size={12} />}
                          {s.category === "lunch" && <Utensils size={12} />}
                          {s.category === "snacks" && <Coffee size={12} />}
                          {s.category === "dinner" && <Moon size={12} />}
                          {visual.label}
                        </span>
                        <span className="meal-badge-time">
                          <Clock size={11} /> {s.startTime} - {s.endTime}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                        <h3 style={{ textTransform: "capitalize", margin: 0, fontSize: 16, fontWeight: 800, color: "var(--royal-navy)" }}>
                          {s.category}
                        </h3>
                        {s.unitPrice > 0 && !isGroundFloor && (
                          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--luxury-gold-dark)" }}>
                            Rs. {s.unitPrice}
                          </span>
                        )}
                      </div>
                      {s.items && s.items.length > 0 && (
                        <ul className="meal-items" style={{ margin: "6px 0 14px", flex: 1 }}>
                          {s.items.slice(0, 3).map((item, i) => (
                            <li key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, fontStyle: "normal", color: "var(--text-secondary)", fontSize: 12.5 }}>
                              {item.dietary === "non_veg" ? (
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#dc2626", flexShrink: 0 }} title="Non-Veg" />
                              ) : (
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} title="Pure Veg" />
                              )}
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                            </li>
                          ))}
                          {s.items.length > 3 && (
                            <li style={{ color: "var(--luxury-gold-dark)", fontSize: 11.5, fontWeight: 600, fontStyle: "italic" }}>
                              +{s.items.length - 3} more items
                            </li>
                          )}
                        </ul>
                      )}
                      <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        {isStudent && (
                          <span className={"pill " + (isAttended || isRegistered ? "pill-green" : "pill-muted")}>
                            {isAttended ? "Attended" : isRegistered ? "Registered" : "Not registered"}
                          </span>
                        )}
                        <Link to="/menu" style={{ fontSize: 12, fontWeight: 700, color: "var(--royal-navy)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {isRegistered ? "Manage" : "View / Register"} &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Upcoming menus - only for 1st floor students */}
      {isStudent && !isGroundFloor && upcoming.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h2 style={{ margin: 0 }}><Calendar size={20} style={{ display: "inline", verticalAlign: "middle" }} /> Upcoming menus</h2>
              <p className="muted" style={{ marginTop: 4, marginBottom: 12 }}>Register for future meals before cutoff</p>
            </div>
            <Link to="/menu" className="btn-small" style={{ textDecoration: "none" }}>Register now</Link>
          </div>
          <div className="list">
            {upcoming.map((m) => {
              const totalItems = (m.meals || []).reduce((sum, meal) => sum + (meal.items?.length || 0), 0);
              return (
                <div key={m._id} className="card" style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: 15 }}>
                        {new Date(m.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                      </h3>
                      <p className="muted" style={{ margin: "4px 0", fontSize: 13 }}>
                        {(m.sessions || []).map((s) => s.category).join(" / ")} - {totalItems} items
                      </p>
                    </div>
                    <Link to="/menu" className="btn-small" style={{ textDecoration: "none" }}>View</Link>
                  </div>
                </div>
              );
            })}
          </div>
          {upcomingData?.meta?.pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 16 }}>
              <button className="btn-small" disabled={upcomingPage <= 1} onClick={() => setUpcomingPage(upcomingPage - 1)}>Previous</button>
              <span style={{ fontSize: 13, color: "#64748b" }}>{upcomingData.meta.page} / {upcomingData.meta.pages}</span>
              <button className="btn-small" disabled={upcomingPage >= upcomingData.meta.pages} onClick={() => setUpcomingPage(upcomingPage + 1)}>Next</button>
            </div>
          )}
        </section>
      )}

      {announcements.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2><Megaphone size={20} style={{ display: "inline", verticalAlign: "middle" }} /> Announcements</h2>
          <div className="list">
            {announcements.map((a) => (
              <div key={a._id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 15 }}>{a.title}</h3>
                  <span className={"pill " + (a.priority === "urgent" || a.priority === "high" ? "pill-amber" : "pill-muted")}>{a.priority || "normal"}</span>
                </div>
                <p style={{ margin: "6px 0", fontSize: 14 }}>{a.body}</p>
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>{new Date(a.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}