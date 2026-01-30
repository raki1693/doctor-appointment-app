import React, { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import TopBar from "../components/TopBar";
import SectionCard from "../components/SectionCard";
import IconTile from "../components/IconTile";
import ChatbotWidget from "../components/ChatbotWidget";
import {
  User,
  IdCard,
  CreditCard,
  FileText,
  Calendar,
  Pill,
  Stethoscope,
  ClipboardList,
  PackageSearch,
  PhoneCall,
  LifeBuoy,
  BookOpen,
  Video,
  Activity,
} from "lucide-react";


function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

function yyyymmdd(dateStr) {
  return (dateStr || "").replaceAll("-", "");
}


export default function Home() {
  const [currentToken, setCurrentToken] = useState({ current: 0, lastIssued: 0, dateKey: "" });
  const [tokenAnimKey, setTokenAnimKey] = useState(0);
  const lastTokenRef = useRef("");

  const tokenText = currentToken.dateKey
    ? `OPD-${currentToken.dateKey}-${String(currentToken.current || 0).padStart(4, "0")}`
    : "-";

  useEffect(() => {
    let alive = true;

    const fetchToken = async () => {
      try {
        const date = todayISO();
        const { data } = await api.get(`/appointments/current-token?date=${encodeURIComponent(date)}`);
        if (!alive) return;
        const next = {
          current: data.current || 0,
          lastIssued: data.lastIssued || 0,
          dateKey: data.date || yyyymmdd(date),
        };

        const nextTokenText = next.dateKey
          ? `OPD-${next.dateKey}-${String(next.current || 0).padStart(4, "0")}`
          : "";

        // Trigger animation only when token value changes (not on very first load)
        if (nextTokenText) {
          if (lastTokenRef.current && nextTokenText !== lastTokenRef.current) {
            setTokenAnimKey((k) => k + 1);
          }
          lastTokenRef.current = nextTokenText;
        }

        setCurrentToken(next);
      } catch {
        // ignore
      }
    };

    // initial load + keep the display updated (useful when admin changes the current token)
    fetchToken();
    const id = setInterval(fetchToken, 5000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-5xl mx-auto p-4 space-y-4">

<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
  <div>
    <div className="text-xs text-slate-500">Currently Serving Token</div>
    <div className="text-xl font-extrabold text-slate-900 overflow-hidden marquee-pause-on-hover">
      {/* ✅ Continuous running token (right → left) */}
      <div className="overflow-hidden">
        <div
          key={`${tokenText}-${tokenAnimKey}`}
          className="inline-flex w-max whitespace-nowrap animate-marquee-loop-fast"
        >
          <span className="pr-16">{tokenText}</span>
          <span className="pr-16" aria-hidden="true">{tokenText}</span>
        </div>
      </div>
    </div>
    <div className="text-xs text-slate-500 mt-1">Last issued today: {currentToken.lastIssued || 0}</div>
  </div>
  <div className="text-xs text-slate-500 text-right">
    Update by Admin
  </div>
</div>

        <SectionCard title="My Profile">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <IconTile to="/profile" icon={<User size={22} />} label="My Profile" />
            <IconTile to="/profile" icon={<IdCard size={22} />} label="My CRN" />
            <IconTile to="/profile" icon={<CreditCard size={22} />} label="UMID Card" />
            <IconTile to="/orders" icon={<ClipboardList size={22} />} label="My Orders" />
            <IconTile to="/appointments" icon={<Calendar size={22} />} label="Appointment Status" />
            <IconTile to="/orders" icon={<FileText size={22} />} label="Bills" />
          </div>
        </SectionCard>

        <SectionCard title="Services">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <IconTile to="/doctors" icon={<Stethoscope size={22} />} label="OPD Appointment" />
            <IconTile to="/symptom-checker" icon={<Activity size={22} />} label="AI Symptom Checker" />
            <IconTile to="/medicines" icon={<Pill size={22} />} label="Medicines" />
            <IconTile to="/orders" icon={<PackageSearch size={22} />} label="Medicines Received" />
            <IconTile to="/appointments" icon={<Calendar size={22} />} label="My Appointments" />
          </div>
        </SectionCard>

        <SectionCard title="Enquiry">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <IconTile to="/doctors" icon={<Stethoscope size={22} />} label="Availability of Specialities" />
            <IconTile to="/medicines" icon={<Pill size={22} />} label="Availability of Drugs" />
            <IconTile to="/help" icon={<PhoneCall size={22} />} label="24x7 Emergency Helpline" />
            <IconTile to="/help" icon={<LifeBuoy size={22} />} label="Health Information" />
          </div>
        </SectionCard>

        <SectionCard title="User Support">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <IconTile to="/help" icon={<LifeBuoy size={22} />} label="HMIS Help Desk" />
            <IconTile to="/help" icon={<Video size={22} />} label="Videos" />
            <IconTile to="/help" icon={<BookOpen size={22} />} label="User Manuals" />
            <IconTile to="/help" icon={<FileText size={22} />} label="Handouts" />
          </div>
        </SectionCard>
      </div>

      <ChatbotWidget />
    </div>
  );
}
