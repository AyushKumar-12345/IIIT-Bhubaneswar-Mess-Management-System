import { useState } from "react";
import { useMyComplaintsQuery, useCreateComplaintMutation } from "../../app/api.js";
import { toast } from "sonner";

const CATEGORIES = ["food_quality","hygiene","drinking_water","food_quantity","staff_behaviour","mess_cleanliness","billing","infrastructure","menu","other"];
const PRIORITIES = ["low","medium","high","urgent"];

export default function ComplaintsPage() {
  const { data, isLoading, refetch } = useMyComplaintsQuery();
  const [create, { isLoading: creating }] = useCreateComplaintMutation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "food_quality", title: "", description: "", priority: "medium" });

  const complaints = data?.data?.complaints || [];

  const submit = async (e) => {
    e.preventDefault();
    try {
      await create(form).unwrap();
      toast.success("Complaint submitted successfully");
      setShowForm(false);
      setForm({ category: "food_quality", title: "", description: "", priority: "medium" });
      refetch();
    } catch (err) {
      const errDetail = err?.data?.errors?.map((e) => (typeof e === "string" ? e : `${e.field ? e.field + ": " : ""}${e.message}`)).join("; ");
      toast.error(errDetail || err?.data?.message || "Failed to submit complaint");
    }
  };

  return (
    <div className="page">
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>My Complaints</h1>
          <p className="muted">Track and manage your mess complaints</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ New Complaint"}</button>
      </header>

      {showForm && (
        <form className="card" onSubmit={submit} style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label><span>Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ").replace("mess committee", "mess secretary")}</option>)}
              </select>
            </label>
            <label><span>Priority</span>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
          <label>
            <span>Title (min 3 chars)</span>
            <input required minLength={3} maxLength={150} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief title (e.g. Cold dinner served)" />
          </label>
          <label>
            <span>Description (min 3 chars)</span>
            <textarea required minLength={3} rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail..." />
          </label>
          <button type="submit" className="btn-primary" disabled={creating}>{creating ? "Submitting..." : "Submit Complaint"}</button>
        </form>
      )}

      {isLoading ? <p>Loading...</p> : complaints.length === 0 ? <p className="muted">No complaints yet.</p> : (
        <div className="list">
          {complaints.map((c) => (
            <div key={c._id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>{c.title}</h3>
                <span className={`pill ${c.status === "resolved" ? "pill-green" : c.status === "rejected" ? "pill-amber" : "pill-muted"}`}>{c.status}</span>
              </div>
              <p className="muted" style={{ margin: "6px 0" }}>{c.category?.replace(/_/g, " ").replace("mess committee", "mess secretary")} - {c.priority} priority</p>
              <p style={{ margin: "8px 0" }}>{c.description}</p>
              {c.resolutionNote && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(5, 150, 105, 0.08)", border: "1px solid rgba(5, 150, 105, 0.25)", borderRadius: 8, fontSize: 13, color: "var(--luxury-emerald)" }}>
                  <strong>Admin Resolution:</strong> {c.resolutionNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}