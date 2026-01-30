import React, { useState } from "react";
import TopBar from "../components/TopBar";
import { useAuth } from "../state/auth";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [contacts, setContacts] = useState(() => {
    const base = Array.isArray(user?.emergencyContacts) ? user.emergencyContacts.slice(0, 3) : [];
    const filled = base.map((c) => ({
      name: c?.name || "",
      relation: c?.relation || "",
      phone: c?.phone || "",
    }));
    while (filled.length < 3) filled.push({ name: "", relation: "", phone: "" });
    return filled;
  });
  const [msg, setMsg] = useState("");

  async function save() {
    setMsg("");
    try {
      await updateProfile({
        name,
        phone,
        address,
        emergencyContacts: contacts
          .map((c) => ({
            name: (c.name || "").trim(),
            relation: (c.relation || "").trim(),
            phone: (c.phone || "").trim(),
          }))
          .filter((c) => c.phone)
          .slice(0, 3),
      });
      setMsg("✅ Profile updated");
    } catch {
      setMsg("Update failed");
    }
  }

  function setContact(i, patch) {
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h1 className="text-xl font-bold">My Profile</h1>
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs text-slate-600 mb-1">Name</div>
              <input className="w-full px-3 py-2 rounded-xl border border-slate-300" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Phone</div>
              <input className="w-full px-3 py-2 rounded-xl border border-slate-300" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-slate-600 mb-1">Address</div>
              <textarea className="w-full min-h-[90px] px-3 py-2 rounded-xl border border-slate-300" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="pt-3">
              <div className="text-sm font-semibold text-slate-800">Emergency Contacts (max 3)</div>
              <div className="text-xs text-slate-600 mt-1">
                These relatives will get an <b>on-screen Emergency Alert</b> in the app when you press the Emergency button (works when they are logged in).
              </div>

              <div className="mt-3 grid gap-3">
                {contacts.map((c, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Contact {idx + 1}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        placeholder="Name"
                        value={c.name}
                        onChange={(e) => setContact(idx, { name: e.target.value })}
                      />
                      <input
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        placeholder="Relation (e.g., Father)"
                        value={c.relation}
                        onChange={(e) => setContact(idx, { relation: e.target.value })}
                      />
                    </div>
                    <input
                      className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      placeholder="Phone (10 digits or +91...)"
                      value={c.phone}
                      onChange={(e) => setContact(idx, { phone: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {msg && <div className="text-sm">{msg}</div>}

            <button className="px-5 py-2 rounded-xl bg-slate-800 text-white" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
