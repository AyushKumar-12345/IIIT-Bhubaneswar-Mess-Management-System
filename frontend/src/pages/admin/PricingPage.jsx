import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useListSettingsQuery, useUpsertSettingMutation } from "../../app/api.js";
import { toast } from "sonner";
import { Save, Egg, Utensils, Cookie, Moon, Building2, IndianRupee, ShieldAlert } from "lucide-react";

const MEAL_KEYS = ["breakfast", "lunch", "snacks", "dinner"];
const MEAL_META = {
  breakfast: { label: "Breakfast", icon: Egg, time: "8:00 - 10:00 AM" },
  lunch: { label: "Lunch", icon: Utensils, time: "12:00 - 2:00 PM" },
  snacks: { label: "Snacks", icon: Cookie, time: "5:00 - 6:00 PM" },
  dinner: { label: "Dinner", icon: Moon, time: "7:30 - 9:30 PM" }
};

export default function PricingPage() {
  const user = useSelector((s) => s.auth.user);
  const { data, isLoading, refetch } = useListSettingsQuery(undefined, {
    skip: user?.role !== "admin"
  });
  const [upsert, { isLoading: saving }] = useUpsertSettingMutation();

  const [perMeal, setPerMeal] = useState({ breakfast: 40, lunch: 80, snacks: 30, dinner: 90 });
  const [gfFee, setGfFee] = useState(25000);
  const [loaded, setLoaded] = useState(false);

  const applySettings = (settingsList) => {
    if (!settingsList) return;
    const pm = settingsList.find((x) => x.key === "billing.perMealPrice");
    const gf = settingsList.find((x) => x.key === "groundFloor.fee");
    if (pm && pm.value) {
      setPerMeal({
        breakfast: Number(pm.value.breakfast ?? 40),
        lunch: Number(pm.value.lunch ?? 80),
        snacks: Number(pm.value.snacks ?? 30),
        dinner: Number(pm.value.dinner ?? 90)
      });
    }
    if (gf && gf.value) setGfFee(Number(gf.value) || 25000);
  };

  useEffect(() => {
    if (data?.data?.settings && !loaded) {
      applySettings(data.data.settings);
      setLoaded(true);
    }
  }, [data, loaded]);

  const updateMeal = (key, value) => {
    setPerMeal((prev) => ({ ...prev, [key]: value === "" ? "" : Number(value) }));
  };

  const save = async () => {
    for (const k of MEAL_KEYS) {
      if (perMeal[k] === "" || Number(perMeal[k]) < 0) {
        toast.error(`Invalid ${k} price`);
        return;
      }
    }
    if (gfFee === "" || Number(gfFee) < 0) {
      toast.error("Invalid ground floor fee");
      return;
    }

    try {
      await upsert({
        key: "billing.perMealPrice",
        value: {
          breakfast: Number(perMeal.breakfast),
          lunch: Number(perMeal.lunch),
          snacks: Number(perMeal.snacks),
          dinner: Number(perMeal.dinner)
        },
        category: "billing",
        description: "Per-meal price (INR)"
      }).unwrap();

      await upsert({
        key: "groundFloor.fee",
        value: Number(gfFee),
        category: "billing",
        description: "Ground floor semester fee (INR)"
      }).unwrap();

      toast.success("Prices updated successfully");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save prices");
    }
  };

  if (isLoading && !loaded) {
    return <div className="page"><p>Loading...</p></div>;
  }

  const totalMonthly = Object.values(perMeal).reduce((s, v) => s + (Number(v) || 0), 0);

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <header className="page-header">
        <h1>Pricing Settings</h1>
        <p className="muted">
          Set per-meal prices for 1st Floor (register &amp; pay daily) and one-time fee for Ground Floor semester.
          <br />
          <span style={{ color: "#a06800", fontSize: 12 }}>Only the Admin can change these prices.</span>
        </p>
      </header>

      <section className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Utensils size={18} color="#0e7c66" />
          <h2 style={{ margin: 0, fontSize: 16 }}>1st Floor - Per Meal Prices</h2>
        </div>
        <p style={{ margin: "4px 0 16px", fontSize: 12, color: "#64748b" }}>
          These prices are used when students register for individual meals.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          {MEAL_KEYS.map((key) => {
            const meta = MEAL_META[key];
            const Icon = meta.icon;
            return (
              <div key={key} style={{ padding: 14, border: "1px solid #e2e8e6", borderRadius: 10, background: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Icon size={16} color="#0e7c66" />
                  <strong style={{ fontSize: 13 }}>{meta.label}</strong>
                </div>
                <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.4 }}>{meta.time}</div>
                <label style={{ display: "block", marginTop: 10 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginBottom: 4 }}>Price (INR)</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <IndianRupee size={14} color="#64748b" />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={perMeal[key]}
                      onChange={(e) => updateMeal(key, e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #e2e8e6", borderRadius: 8, fontSize: 15, fontWeight: 600, color: "#000000" }}
                    />
                  </div>
                </label>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, padding: "10px 14px", background: "#f8fafb", borderRadius: 8, fontSize: 12, color: "#4b5563" }}>
          If a student eats all 4 meals in one day, they would pay <strong style={{ color: "#000000" }}>Rs. {totalMonthly}</strong>.
        </div>
      </section>

      <section className="card" style={{ marginBottom: 20, borderLeft: "3px solid var(--luxury-gold)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Building2 size={18} color="var(--royal-navy)" />
          <h2 style={{ margin: 0, fontSize: 16, color: "var(--royal-navy)" }}>Ground Floor - One-Time Semester Fee</h2>
        </div>
        <p style={{ margin: "4px 0 16px", fontSize: 12, color: "var(--text-secondary)" }}>
          Student pays this once to enroll in the ground floor semester plan. Min 3 meals required at enrollment.
        </p>

        <label style={{ display: "block", maxWidth: 320 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>Semester Fee (INR)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
            <IndianRupee size={20} color="var(--royal-navy)" />
            <input
              type="number"
              min="0"
              step="100"
              value={gfFee}
              onChange={(e) => setGfFee(e.target.value === "" ? "" : Number(e.target.value))}
              style={{ flex: 1, padding: "12px 14px", border: "2px solid var(--royal-navy)", borderRadius: 10, fontSize: 20, fontWeight: 800, color: "var(--royal-navy)" }}
            />
          </div>
        </label>
      </section>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="landing-btn landing-btn-solid" onClick={save} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", fontSize: 15 }}>
          <Save size={16} /> {saving ? "Saving..." : "Save Prices"}
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#64748b", marginTop: 16 }}>
        Last saved values are shown. Changes take effect immediately for new registrations and ground floor enrollments.
      </p>
    </div>
  );
}