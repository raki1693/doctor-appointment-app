import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api";
import TopBar from "../components/TopBar";
import SectionCard from "../components/SectionCard";
import { Camera, Mic, Send, Stethoscope } from "lucide-react";

const LANGS = [
  { key: "en", label: "English", speech: "en-IN" },
  { key: "hi", label: "हिन्दी", speech: "hi-IN" },
  { key: "te", label: "తెలుగు", speech: "te-IN" },
];

function pickL(item, lang) {
  if (!item) return "";
  return item[lang] || item.en || "";
}

function UrgencyBadge({ urgency }) {
  const text =
    urgency === "emergency"
      ? "EMERGENCY"
      : urgency === "same_day"
      ? "SAME DAY"
      : "ROUTINE";
  const cls =
    urgency === "emergency"
      ? "bg-red-100 text-red-700 border-red-200"
      : urgency === "same_day"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${cls}`}>
      {text}
    </span>
  );
}

export default function SymptomChecker() {
  const [tab, setTab] = useState("text");
  const [lang, setLang] = useState("en");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  // Voice
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  // Camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamOn, setStreamOn] = useState(false);
  const [capturedFile, setCapturedFile] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);

  const langSpeech = useMemo(
    () => LANGS.find((l) => l.key === lang)?.speech || "en-IN",
    [lang]
  );

  useEffect(() => {
    // setup speech recognition if supported
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.lang = langSpeech;

    r.onresult = (event) => {
      let full = "";
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setText((prev) => (prev ? `${prev} ${full}` : full));
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);

    recognitionRef.current = r;
  }, [langSpeech]);

  async function runText(mode = "text") {
    setErr("");
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post("/ai/symptom-check", {
        mode,
        text,
        languagePref: lang,
        save: true,
      });
      setResult(data.result);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to run symptom check");
    } finally {
      setLoading(false);
    }
  }

  async function runImage() {
    setErr("");
    setResult(null);
    setLoading(true);
    try {
      if (!capturedFile) {
        setErr("Please capture or upload an image");
        setLoading(false);
        return;
      }
      const fd = new FormData();
      fd.append("image", capturedFile);
      fd.append("text", text || "");
      fd.append("languagePref", lang);
      fd.append("save", "true");

      const { data } = await api.post("/ai/symptom-check-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data.result);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to run symptom check");
    } finally {
      setLoading(false);
    }
  }

  async function startCamera() {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreamOn(true);
    } catch {
      setErr("Camera permission denied or not available");
    }
  }

  function stopCamera() {
    const v = videoRef.current;
    const s = v?.srcObject;
    if (s && s.getTracks) s.getTracks().forEach((t) => t.stop());
    if (v) v.srcObject = null;
    setStreamOn(false);
  }

  function capture() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "symptom.jpg", { type: "image/jpeg" });
        setCapturedFile(file);
        const url = URL.createObjectURL(blob);
        setCapturedUrl(url);
      },
      "image/jpeg",
      0.85
    );
  }

  function onFilePick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setCapturedFile(f);
    setCapturedUrl(URL.createObjectURL(f));
  }

  function startVoice() {
    const r = recognitionRef.current;
    if (!r) {
      setErr("Voice input not supported in this browser. Please use Text mode.");
      return;
    }
    setErr("");
    setListening(true);
    r.lang = langSpeech;
    r.start();
  }

  function stopVoice() {
    const r = recognitionRef.current;
    try {
      r?.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }

  useEffect(() => {
    return () => {
      stopCamera();
      stopVoice();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <SectionCard title="AI Symptom Checker">
          <div className="text-xs text-slate-500">
            This tool is for guidance only. It does not diagnose. For emergencies, go to the nearest emergency department.
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={() => setTab("text")}
              className={`px-3 py-2 rounded-xl border text-sm ${tab === "text" ? "bg-white shadow-sm" : "bg-slate-100"}`}
            >
              Text
            </button>
            <button
              onClick={() => setTab("voice")}
              className={`px-3 py-2 rounded-xl border text-sm ${tab === "voice" ? "bg-white shadow-sm" : "bg-slate-100"}`}
            >
              Voice
            </button>
            <button
              onClick={() => setTab("camera")}
              className={`px-3 py-2 rounded-xl border text-sm ${tab === "camera" ? "bg-white shadow-sm" : "bg-slate-100"}`}
            >
              Camera
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-500">Language</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="border rounded-xl px-3 py-2 text-sm bg-white"
              >
                {LANGS.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 grid gap-3">
            <textarea
              className="w-full min-h-[110px] border rounded-2xl p-3 bg-white"
              placeholder="Describe symptoms (ex: fever 2 days, cough, headache). For camera: add symptom text here too."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {tab === "voice" && (
              <div className="flex items-center gap-2">
                {!listening ? (
                  <button
                    onClick={startVoice}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white"
                    type="button"
                  >
                    <Mic size={18} /> Start speaking
                  </button>
                ) : (
                  <button
                    onClick={stopVoice}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white"
                    type="button"
                  >
                    <Mic size={18} /> Stop
                  </button>
                )}
                <span className="text-xs text-slate-500">Voice converts to text (browser feature).</span>
              </div>
            )}

            {tab === "camera" && (
              <div className="grid md:grid-cols-2 gap-3">
                <div className="border rounded-2xl p-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Camera</div>
                    {!streamOn ? (
                      <button
                        onClick={startCamera}
                        type="button"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white"
                      >
                        <Camera size={18} /> Start
                      </button>
                    ) : (
                      <button
                        onClick={stopCamera}
                        type="button"
                        className="px-3 py-2 rounded-xl bg-slate-200"
                      >
                        Stop
                      </button>
                    )}
                  </div>

                  <div className="mt-2">
                    <video ref={videoRef} className="w-full rounded-xl bg-slate-200" playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={capture}
                      type="button"
                      disabled={!streamOn}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-700 text-white disabled:opacity-50"
                    >
                      <Camera size={18} /> Capture
                    </button>
                    <label className="text-sm text-slate-700">
                      or upload image
                      <input type="file" accept="image/*" onChange={onFilePick} className="ml-2" />
                    </label>
                  </div>
                </div>

                <div className="border rounded-2xl p-3 bg-white">
                  <div className="text-sm font-semibold">Preview</div>
                  {capturedUrl ? (
                    <img src={capturedUrl} alt="preview" className="mt-2 w-full rounded-xl border" />
                  ) : (
                    <div className="mt-2 text-xs text-slate-500">No image selected yet.</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {tab === "camera" ? (
                <button
                  onClick={runImage}
                  type="button"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white disabled:opacity-50"
                >
                  <Send size={18} /> {loading ? "Checking..." : "Check symptoms"}
                </button>
              ) : (
                <button
                  onClick={() => runText(tab === "voice" ? "voice" : "text")}
                  type="button"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white disabled:opacity-50"
                >
                  <Send size={18} /> {loading ? "Checking..." : "Check symptoms"}
                </button>
              )}

              <button
                onClick={() => {
                  setText("");
                  setResult(null);
                  setErr("");
                  setCapturedFile(null);
                  setCapturedUrl(null);
                }}
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-200"
              >
                Clear
              </button>
            </div>

            {err && <div className="text-sm text-red-700">{err}</div>}
          </div>
        </SectionCard>

        {result && (
          <SectionCard title="Result">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm">
                <div className="text-xs text-slate-500">Recommended Department</div>
                <div className="font-semibold flex items-center gap-2">
                  <Stethoscope size={18} /> {result.department}
                </div>
              </div>
              <UrgencyBadge urgency={result.urgency} />
            </div>

            <div className="mt-3 p-3 rounded-2xl border bg-white">
              <div className="text-xs text-slate-500">Summary</div>
              <div className="text-sm mt-1">{pickL(result.summary, lang)}</div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-2xl border bg-white">
                <div className="font-semibold text-sm">Possible causes (not diagnosis)</div>
                <ul className="list-disc ml-5 text-sm mt-2 space-y-1">
                  {result.possible_causes?.map((x, i) => (
                    <li key={i}>{pickL(x, lang)}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-2xl border bg-white">
                <div className="font-semibold text-sm">Red flags</div>
                <ul className="list-disc ml-5 text-sm mt-2 space-y-1">
                  {result.red_flags?.map((x, i) => (
                    <li key={i}>{pickL(x, lang)}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-2xl border bg-white">
                <div className="font-semibold text-sm">Self-care (if safe)</div>
                <ul className="list-disc ml-5 text-sm mt-2 space-y-1">
                  {result.self_care?.map((x, i) => (
                    <li key={i}>{pickL(x, lang)}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-2xl border bg-white">
                <div className="font-semibold text-sm">Next steps</div>
                <ul className="list-disc ml-5 text-sm mt-2 space-y-1">
                  {result.next_steps?.map((x, i) => (
                    <li key={i}>{pickL(x, lang)}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 rounded-2xl border bg-white mt-3">
              <div className="font-semibold text-sm">What to tell the doctor</div>
              <ul className="list-disc ml-5 text-sm mt-2 space-y-1">
                {result.questions_for_doctor?.map((x, i) => (
                  <li key={i}>{pickL(x, lang)}</li>
                ))}
              </ul>
            </div>

            <div className="text-xs text-slate-500 mt-3">{pickL(result.disclaimer, lang)}</div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
