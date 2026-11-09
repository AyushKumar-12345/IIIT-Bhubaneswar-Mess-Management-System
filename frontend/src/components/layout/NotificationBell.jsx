import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Bell, X, Check, CheckCheck, Clock, Megaphone, AlertCircle,
  Info, Sparkles, Trash2, Utensils, CreditCard, ShieldCheck
} from "lucide-react";
import {
  useMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useClearReadNotificationsMutation,
  useClearAllNotificationsMutation,
  useDeleteNotificationMutation
} from "../../app/api.js";
import { toast } from "sonner";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const { data } = useMyNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const [clearRead, { isLoading: clearingRead }] = useClearReadNotificationsMutation();
  const [clearAll, { isLoading: clearingAll }] = useClearAllNotificationsMutation();
  const [deleteNotif] = useDeleteNotificationMutation();

  const ref = useRef(null);
  const panelRef = useRef(null);

  const notifications = data?.data?.notifications || [];
  const unreadList = notifications.filter((n) => !n.readAt);
  const readList = notifications.filter((n) => !!n.readAt);
  const unread = unreadList.length;

  const displayList = filter === "unread" ? unreadList : notifications;

  useEffect(() => {
    const handler = (e) => {
      if (
        ref.current && !ref.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const keyHandler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      document.addEventListener("keydown", keyHandler);
    }
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [open]);

  const handleMarkOne = async (id, e) => {
    e?.stopPropagation();
    try {
      await markRead(id).unwrap();
    } catch {
      // quiet fail
    }
  };

  const handleDeleteOne = async (id, e) => {
    e?.stopPropagation();
    try {
      await deleteNotif(id).unwrap();
      toast.success("Notification cleared");
    } catch {
      toast.error("Could not remove notification");
    }
  };

  const handleMarkAll = async () => {
    if (unread === 0) return;
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Could not mark notifications as read");
    }
  };

  const handleClearRead = async () => {
    if (readList.length === 0) return;
    try {
      const res = await clearRead().unwrap();
      toast.success(`Cleared ${res.data?.deletedCount || readList.length} read alert${readList.length > 1 ? "s" : ""}`);
    } catch {
      toast.error("Could not clear read notifications");
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    try {
      await clearAll().unwrap();
      toast.success("All notifications cleared");
    } catch {
      toast.error("Could not clear notifications");
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "announcement":
        return <Megaphone size={14} color="var(--royal-navy)" />;
      case "menu_published":
        return <Utensils size={14} color="#059669" />;
      case "payment_update":
        return <CreditCard size={14} color="var(--luxury-gold-dark)" />;
      case "leave_decision":
        return <ShieldCheck size={14} color="#0284c7" />;
      default:
        return <Info size={14} color="var(--text-secondary)" />;
    }
  };

  const panel = open && (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10, 17, 40, 0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 9998
        }}
      />
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(460px, calc(100vw - 28px))",
          maxHeight: "min(600px, calc(100vh - 60px))",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 25px 70px -15px rgba(10, 17, 40, 0.4), 0 0 0 1px rgba(197, 160, 89, 0.35)",
          overflow: "hidden",
          zIndex: 9999,
          animation: "authModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #0a1128 0%, #162447 100%)",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1.5px solid #c5a059"
        }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#dfb76c", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              <Bell size={12} /> Live Updates Feed
            </div>
            <h4 style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: "#ffffff" }}>
              Notifications
            </h4>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: 999,
              width: 32,
              height: 32,
              display: "grid",
              placeItems: "center",
              color: "#ffffff",
              cursor: "pointer"
            }}
            aria-label="Close notifications"
          >
            <X size={17} />
          </button>
        </div>

        {/* Filter and Global Action Toolbar */}
        <div style={{
          padding: "10px 16px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => setFilter("all")}
              style={{
                background: filter === "all" ? "var(--royal-navy)" : "transparent",
                color: filter === "all" ? "#ffffff" : "var(--text-secondary)",
                border: "none",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              style={{
                background: filter === "unread" ? "var(--royal-navy)" : "transparent",
                color: filter === "unread" ? "#ffffff" : "var(--text-secondary)",
                border: "none",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              Unread ({unread})
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={markingAll}
                style={{
                  background: "rgba(197, 160, 89, 0.18)",
                  border: "1px solid rgba(197, 160, 89, 0.45)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--royal-navy)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
                title="Mark all as read"
              >
                <CheckCheck size={12} /> {markingAll ? "..." : "Mark read"}
              </button>
            )}

            {readList.length > 0 && (
              <button
                type="button"
                onClick={handleClearRead}
                disabled={clearingRead}
                style={{
                  background: "rgba(100, 116, 139, 0.1)",
                  border: "1px solid rgba(100, 116, 139, 0.2)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#475569",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4
                }}
                title="Clear already read notifications"
              >
                <Trash2 size={12} /> {clearingRead ? "..." : "Clear read"}
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={clearingAll}
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 6px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94a3b8",
                  cursor: "pointer"
                }}
                title="Clear all notifications"
              >
                {clearingAll ? "..." : "Clear all"}
              </button>
            )}
          </div>
        </div>

        {/* Notification list */}
        <div style={{
          padding: "10px 14px",
          overflowY: "auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}>
          {displayList.length === 0 ? (
            <div style={{ padding: "44px 20px", textAlign: "center" }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(197, 160, 89, 0.12)",
                color: "var(--luxury-gold-dark)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 12px"
              }}>
                <Sparkles size={22} />
              </div>
              <strong style={{ display: "block", fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>
                {filter === "unread" ? "No unread alerts" : "No notifications"}
              </strong>
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary)" }}>
                {filter === "unread"
                  ? "All alerts caught up! Toggle 'All' to review previous updates."
                  : "You're all caught up! New menu releases, bill updates, and rebate approvals will appear here."}
              </p>
            </div>
          ) : (
            displayList.slice(0, 30).map((n) => {
              const isUnread = !n.readAt;
              return (
                <div
                  key={n._id}
                  onClick={() => isUnread && handleMarkOne(n._id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: isUnread ? "rgba(197, 160, 89, 0.08)" : "#ffffff",
                    border: isUnread ? "1.5px solid rgba(197, 160, 89, 0.4)" : "1px solid #e2e8f0",
                    cursor: isUnread ? "pointer" : "default",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    position: "relative"
                  }}
                  title={isUnread ? "Click to mark as read" : undefined}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: isUnread ? "rgba(197, 160, 89, 0.2)" : "#f1f5f9",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0
                      }}>
                        {getNotifIcon(n.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {isUnread && (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "var(--luxury-gold)",
                                boxShadow: "0 0 8px rgba(197, 160, 89, 0.6)",
                                flexShrink: 0
                              }}
                              title="Unread"
                            />
                          )}
                          <strong style={{
                            fontSize: 13.5,
                            fontWeight: isUnread ? 800 : 600,
                            color: isUnread ? "var(--royal-navy)" : "var(--text-primary)"
                          }}>
                            {n.title}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <Clock size={10} />
                        {new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>

                      {isUnread ? (
                        <button
                          type="button"
                          onClick={(e) => handleMarkOne(n._id, e)}
                          style={{
                            background: "rgba(10, 17, 40, 0.06)",
                            border: "none",
                            borderRadius: 6,
                            padding: "3px 6px",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--royal-navy)",
                            cursor: "pointer"
                          }}
                          title="Mark read"
                        >
                          Mark read
                        </button>
                      ) : (
                        <span title="Read" style={{ color: "#059669", display: "inline-flex" }}>
                          <Check size={13} />
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteOne(n._id, e)}
                        style={{
                          background: "transparent",
                          border: "none",
                          borderRadius: 4,
                          padding: 3,
                          color: "#94a3b8",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center"
                        }}
                        title="Dismiss notification"
                        aria-label="Dismiss notification"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {n.message && (
                    <p style={{
                      margin: "2px 0 0",
                      paddingLeft: 34,
                      color: isUnread ? "var(--text-primary)" : "var(--text-secondary)",
                      fontSize: 12.5,
                      lineHeight: 1.45
                    }}>
                      {n.message}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: open ? "rgba(197, 160, 89, 0.15)" : "transparent",
          border: open ? "1.5px solid var(--luxury-gold)" : "1.5px solid transparent",
          color: "var(--text-primary)",
          cursor: "pointer",
          padding: 8,
          borderRadius: 10,
          position: "relative",
          display: "grid",
          placeItems: "center",
          transition: "all 0.2s ease"
        }}
        aria-label="Notifications"
        title={unread > 0 ? `${unread} unread notifications` : "Notifications"}
      >
        <Bell size={19} color={unread > 0 ? "var(--luxury-gold)" : "currentColor"} />
        {unread > 0 && (
          <span style={{
            position: "absolute",
            top: 2,
            right: 2,
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            color: "white",
            fontSize: 10,
            fontWeight: 800,
            borderRadius: 999,
            minWidth: 16,
            height: 16,
            display: "grid",
            placeItems: "center",
            padding: "0 4px",
            border: "1.5px solid #ffffff",
            boxShadow: "0 2px 6px rgba(220, 38, 38, 0.4)"
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {typeof document !== "undefined" ? createPortal(panel, document.body) : null}
    </div>
  );
}
