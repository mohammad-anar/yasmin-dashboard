"use client";

import { useState } from "react";
import {
  useGetOnboardingOptionsQuery,
  useSeedOnboardingStepMutation,
  useCreateContraceptionMutation,
  useDeleteContraceptionMutation,
  useCreateContraceptionDetailMutation,
  useDeleteContraceptionDetailMutation,
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useCreateSymptomMutation,
  useDeleteSymptomMutation,
  useCreateDailyCheckInMutation,
  useDeleteDailyCheckInMutation,
  ContraceptionOption,
  ContraceptionDetailOption,
  GoalOption,
  SymptomOption,
  DailyCheckInOption,
} from "@/lib/store/api/onboardingApi";
import { Plus, Trash2, Database, RefreshCw, Layers, CheckCircle2, AlertTriangle } from "lucide-react";

export default function OnboardingConfigPage() {
  const [activeTab, setActiveTab] = useState<"contraception" | "details" | "checkins" | "symptoms-goals">("contraception");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Queries & Mutations
  const { data, isFetching, refetch } = useGetOnboardingOptionsQuery();
  const [seedStep, { isLoading: isSeeding }] = useSeedOnboardingStepMutation();

  const [createContraception] = useCreateContraceptionMutation();
  const [deleteContraception] = useDeleteContraceptionMutation();

  const [createContraceptionDetail] = useCreateContraceptionDetailMutation();
  const [deleteContraceptionDetail] = useDeleteContraceptionDetailMutation();

  const [createGoal] = useCreateGoalMutation();
  const [deleteGoal] = useDeleteGoalMutation();

  const [createSymptom] = useCreateSymptomMutation();
  const [deleteSymptom] = useDeleteSymptomMutation();

  const [createDailyCheckIn] = useCreateDailyCheckInMutation();
  const [deleteDailyCheckIn] = useDeleteDailyCheckInMutation();

  // Form States
  const [contraForm, setContraForm] = useState({ key: "", icon: "", title: "", desc: "", tag: "", accent: "" });
  const [detailForm, setDetailForm] = useState({ contraceptionKey: "", questionKey: "", questionLabel: "", type: "select", value: "", label: "" });
  const [goalForm, setGoalForm] = useState({ value: "", label: "" });
  const [symptomForm, setSymptomForm] = useState({ name: "" });
  const [checkinForm, setCheckinForm] = useState({ icon: "", label: "", isDefault: false });

  // Notifications helper
  const triggerNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // Seeding trigger
  const handleSeed = async (stepNum: number) => {
    try {
      const res = await seedStep(stepNum).unwrap();
      triggerNotification(res.message || `Successfully seeded Step ${stepNum}!`);
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to seed onboarding step data.", true);
    }
  };

  // Contraception handlers
  const handleAddContraception = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contraForm.key || !contraForm.title) return;
    try {
      await createContraception(contraForm).unwrap();
      triggerNotification("Contraception option added successfully.");
      setContraForm({ key: "", icon: "", title: "", desc: "", tag: "", accent: "" });
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to add contraception option.", true);
    }
  };

  const handleDeleteContraception = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contraception option?")) return;
    try {
      await deleteContraception(id).unwrap();
      triggerNotification("Contraception option deleted successfully.");
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to delete contraception option.", true);
    }
  };

  // Contraception details handlers
  const handleAddDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailForm.contraceptionKey || !detailForm.questionKey || !detailForm.value || !detailForm.label) return;
    try {
      await createContraceptionDetail(detailForm).unwrap();
      triggerNotification("Contraception detail option added successfully.");
      setDetailForm({ ...detailForm, value: "", label: "" }); // keep question details for easy multi-adding
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to add detail option.", true);
    }
  };

  const handleDeleteDetail = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contraception detail option?")) return;
    try {
      await deleteContraceptionDetail(id).unwrap();
      triggerNotification("Contraception detail option deleted successfully.");
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to delete detail option.", true);
    }
  };

  // Goal handlers
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.value || !goalForm.label) return;
    try {
      await createGoal(goalForm).unwrap();
      triggerNotification("Goal option added successfully.");
      setGoalForm({ value: "", label: "" });
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to add goal option.", true);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal option?")) return;
    try {
      await deleteGoal(id).unwrap();
      triggerNotification("Goal option deleted successfully.");
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to delete goal option.", true);
    }
  };

  // Symptom handlers
  const handleAddSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomForm.name) return;
    try {
      await createSymptom(symptomForm).unwrap();
      triggerNotification("Symptom option added successfully.");
      setSymptomForm({ name: "" });
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to add symptom option.", true);
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this symptom option?")) return;
    try {
      await deleteSymptom(id).unwrap();
      triggerNotification("Symptom option deleted successfully.");
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to delete symptom option.", true);
    }
  };

  // Daily check-in handlers
  const handleAddCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinForm.label) return;
    try {
      await createDailyCheckIn(checkinForm).unwrap();
      triggerNotification("Daily check-in option added successfully.");
      setCheckinForm({ icon: "", label: "", isDefault: false });
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to add daily check-in option.", true);
    }
  };

  const handleDeleteCheckin = async (id: string) => {
    if (!confirm("Are you sure you want to delete this daily check-in option?")) return;
    try {
      await deleteDailyCheckIn(id).unwrap();
      triggerNotification("Daily check-in option deleted successfully.");
    } catch (err: any) {
      triggerNotification(err?.data?.message || "Failed to delete check-in option.", true);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Notifications */}
      {successMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-rose-500 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-fade-in font-semibold text-sm">
          <AlertTriangle className="w-5 h-5" />
          {errorMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--brand-text-primary)" }}>
            Onboarding Configuration & Seeding
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--brand-text-muted)" }}>
            Dynamically customize choices, parameters, and details for frontend onboarding screens.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all self-start sm:self-auto"
          style={{ background: "var(--brand-surface)", color: "var(--brand-accent)", border: "1px solid var(--brand-border)" }}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh Options
        </button>
      </div>

      {/* Steps/Tabs Selection */}
      <div className="flex border-b" style={{ borderColor: "var(--brand-border)" }}>
        {[
          { id: "contraception", label: "Step 1: Contraception options" },
          { id: "details", label: "Step 2: Contraception details" },
          { id: "checkins", label: "Step 3: Daily check-ins" },
          { id: "symptoms-goals", label: "Step 4: Symptoms & Goals" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap`}
            style={{
              borderColor: activeTab === tab.id ? "var(--brand-accent)" : "transparent",
              color: activeTab === tab.id ? "var(--brand-accent)" : "var(--brand-text-muted)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ────────────────── STEP 1: CONTRACEPTIONS ────────────────── */}
      {activeTab === "contraception" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main config list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--brand-border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base" style={{ color: "var(--brand-text-primary)" }}>
                  Registered Contraception Options
                </h3>
                <button
                  disabled={isSeeding}
                  onClick={() => handleSeed(1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 transition-all hover:bg-indigo-100 disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  Reset & Seed Step 1 Defaults
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ background: "var(--brand-surface)", color: "var(--brand-text-muted)" }}>
                      <th className="p-3 font-semibold rounded-l-xl">Option / Key</th>
                      <th className="p-3 font-semibold">Title / Description</th>
                      <th className="p-3 font-semibold">Tag</th>
                      <th className="p-3 font-semibold rounded-r-xl text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.contraceptions?.map((c) => (
                      <tr key={c.id} className="border-t" style={{ borderColor: "var(--brand-border)" }}>
                        <td className="p-3 font-medium">
                          <span className="mr-2">{c.icon || "•"}</span>
                          <code className="text-xs px-1.5 py-0.5 rounded bg-slate-100">{c.key}</code>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold" style={{ color: "var(--brand-text-primary)" }}>{c.title}</p>
                          <p className="text-xs opacity-60">{c.desc}</p>
                        </td>
                        <td className="p-3 text-xs">
                          <span
                            className="px-2 py-0.5 rounded font-medium"
                            style={{ background: c.accent || "#ede6dd", color: "var(--brand-text-primary)" }}
                          >
                            {c.tag || "—"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteContraception(c.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!data?.contraceptions?.length && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-xs" style={{ color: "var(--brand-text-muted)" }}>
                          No contraception options configured. Click the seed button above to add default options.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add Option Form */}
          <div className="rounded-2xl border p-5 bg-white h-fit" style={{ borderColor: "var(--brand-border)" }}>
            <h3 className="font-bold text-base mb-4" style={{ color: "var(--brand-text-primary)" }}>
              Add Contraception Option
            </h3>
            <form onSubmit={handleAddContraception} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Key (Unique slug)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pill, mirena"
                  value={contraForm.key}
                  onChange={(e) => setContraForm({ ...contraForm, key: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-semibold mb-1 block opacity-85">Emoji/Icon</label>
                  <input
                    type="text"
                    required
                    placeholder="💊"
                    value={contraForm.icon}
                    onChange={(e) => setContraForm({ ...contraForm, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none text-center"
                    style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold mb-1 block opacity-85">Accent Color</label>
                  <input
                    type="text"
                    placeholder="#e8927c"
                    value={contraForm.accent}
                    onChange={(e) => setContraForm({ ...contraForm, accent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                    style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Combined Pill"
                  value={contraForm.title}
                  onChange={(e) => setContraForm({ ...contraForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Tag</label>
                <input
                  type="text"
                  placeholder="e.g. COCP, POP"
                  value={contraForm.tag}
                  onChange={(e) => setContraForm({ ...contraForm, tag: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Description</label>
                <textarea
                  placeholder="Describe this hormonal contraception profile…"
                  value={contraForm.desc}
                  onChange={(e) => setContraForm({ ...contraForm, desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none h-20 resize-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-white bg-indigo-600 flex items-center justify-center gap-1 text-sm shadow hover:bg-indigo-700 transition-all mt-2"
              >
                <Plus className="w-4 h-4" />
                Add Contraception Option
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── STEP 2: DETAILS ────────────────── */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main config list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--brand-border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base" style={{ color: "var(--brand-text-primary)" }}>
                  Contraception Detail Options
                </h3>
                <button
                  disabled={isSeeding}
                  onClick={() => handleSeed(2)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 transition-all hover:bg-indigo-100 disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  Reset & Seed Step 2 Defaults
                </button>
              </div>

              {/* Grouped by Contraception Key */}
              <div className="flex flex-col gap-6">
                {data?.contraceptions?.map((c) => {
                  const items = data.details.filter((d) => d.contraceptionKey === c.key);
                  return (
                    <div
                      key={c.id}
                      className="rounded-xl border p-4"
                      style={{ background: "var(--brand-surface)", borderColor: "var(--brand-border)" }}
                    >
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--brand-text-primary)" }}>
                        <span>{c.icon}</span>
                        {c.title} (<code>{c.key}</code>)
                      </h4>

                      <div className="overflow-x-auto bg-white rounded-lg border" style={{ borderColor: "var(--brand-border)" }}>
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr style={{ background: "var(--brand-surface)", color: "var(--brand-text-muted)" }}>
                              <th className="p-2.5 font-semibold text-xs rounded-l-lg">Question Key / Label</th>
                              <th className="p-2.5 font-semibold text-xs">Render Type</th>
                              <th className="p-2.5 font-semibold text-xs">Value / Label</th>
                              <th className="p-2.5 font-semibold text-xs rounded-r-lg text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((detail) => (
                              <tr key={detail.id} className="border-t" style={{ borderColor: "var(--brand-border)" }}>
                                <td className="p-2.5">
                                  <p className="font-medium text-xs text-slate-500"><code>{detail.questionKey}</code></p>
                                  <p className="font-medium text-xs">{detail.questionLabel}</p>
                                </td>
                                <td className="p-2.5 text-xs capitalize">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{detail.type}</span>
                                </td>
                                <td className="p-2.5">
                                  <p className="text-xs font-semibold"><code>{detail.value}</code></p>
                                  <p className="text-xs opacity-75">{detail.label}</p>
                                </td>
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => handleDeleteDetail(detail.id)}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {!items.length && (
                              <tr>
                                <td colSpan={4} className="p-4 text-center text-xs opacity-50">
                                  No details configured for this contraception.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add Option Form */}
          <div className="rounded-2xl border p-5 bg-white h-fit" style={{ borderColor: "var(--brand-border)" }}>
            <h3 className="font-bold text-base mb-4" style={{ color: "var(--brand-text-primary)" }}>
              Add Detail Option
            </h3>
            <form onSubmit={handleAddDetail} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Target Contraception</label>
                <select
                  required
                  value={detailForm.contraceptionKey}
                  onChange={(e) => setDetailForm({ ...detailForm, contraceptionKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                >
                  <option value="">Select contraception Key...</option>
                  {data?.contraceptions?.map((c) => (
                    <option key={c.id} value={c.key}>
                      {c.icon} {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Question Key (Grouping ID)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pillType, iudPeriod"
                  value={detailForm.questionKey}
                  onChange={(e) => setDetailForm({ ...detailForm, questionKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Question Heading/Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pill formulation type"
                  value={detailForm.questionLabel}
                  onChange={(e) => setDetailForm({ ...detailForm, questionLabel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Input Type</label>
                <select
                  required
                  value={detailForm.type}
                  onChange={(e) => setDetailForm({ ...detailForm, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                >
                  <option value="select">Select list (BottomSheetSelect)</option>
                  <option value="toggle">Toggle button list (ToggleOption)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Option Code Value</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. monophasic, true, light"
                  value={detailForm.value}
                  onChange={(e) => setDetailForm({ ...detailForm, value: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Option Display Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monophasic (same dose every day)"
                  value={detailForm.label}
                  onChange={(e) => setDetailForm({ ...detailForm, label: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-white bg-indigo-600 flex items-center justify-center gap-1 text-sm shadow hover:bg-indigo-700 transition-all mt-2"
              >
                <Plus className="w-4 h-4" />
                Add Detail Option
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── STEP 3: DAILY CHECK-INS ────────────────── */}
      {activeTab === "checkins" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main config list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--brand-border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base" style={{ color: "var(--brand-text-primary)" }}>
                  Daily Check-in Options
                </h3>
                <button
                  disabled={isSeeding}
                  onClick={() => handleSeed(3)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 transition-all hover:bg-indigo-100 disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  Reset & Seed Step 3 Defaults
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr style={{ background: "var(--brand-surface)", color: "var(--brand-text-muted)" }}>
                      <th className="p-3 font-semibold rounded-l-xl">Icon</th>
                      <th className="p-3 font-semibold">Label</th>
                      <th className="p-3 font-semibold">Is Enabled By Default?</th>
                      <th className="p-3 font-semibold rounded-r-xl text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.checkins?.map((chk) => (
                      <tr key={chk.id} className="border-t" style={{ borderColor: "var(--brand-border)" }}>
                        <td className="p-3 font-semibold text-lg">{chk.icon || "•"}</td>
                        <td className="p-3 font-semibold" style={{ color: "var(--brand-text-primary)" }}>
                          {chk.label}
                        </td>
                        <td className="p-3">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: chk.isDefault ? "var(--status-success-bg)" : "var(--brand-surface)",
                              color: chk.isDefault ? "var(--status-success)" : "var(--brand-text-muted)",
                            }}
                          >
                            {chk.isDefault ? "Enabled" : "Disabled"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteCheckin(chk.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!data?.checkins?.length && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-xs" style={{ color: "var(--brand-text-muted)" }}>
                          No daily check-in options configured. Click seed button to add defaults.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add Option Form */}
          <div className="rounded-2xl border p-5 bg-white h-fit" style={{ borderColor: "var(--brand-border)" }}>
            <h3 className="font-bold text-base mb-4" style={{ color: "var(--brand-text-primary)" }}>
              Add Check-in Option
            </h3>
            <form onSubmit={handleAddCheckin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Icon / Emoji</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 😴"
                  value={checkinForm.icon}
                  onChange={(e) => setCheckinForm({ ...checkinForm, icon: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none text-center"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block opacity-85">Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sleep quality"
                  value={checkinForm.label}
                  onChange={(e) => setCheckinForm({ ...checkinForm, label: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none"
                  style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                />
              </div>
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="chk-default"
                  checked={checkinForm.isDefault}
                  onChange={(e) => setCheckinForm({ ...checkinForm, isDefault: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="chk-default" className="text-xs font-semibold select-none cursor-pointer opacity-85">
                  Checked by default in new user profile
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-white bg-indigo-600 flex items-center justify-center gap-1 text-sm shadow hover:bg-indigo-700 transition-all mt-2"
              >
                <Plus className="w-4 h-4" />
                Add Check-in Option
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── STEP 4: SYMPTOMS & GOALS ────────────────── */}
      {activeTab === "symptoms-goals" && (
        <div className="flex flex-col gap-6">
          {/* Seeding Control */}
          <div className="rounded-2xl border p-4 bg-white flex items-center justify-between" style={{ borderColor: "var(--brand-border)" }}>
            <div>
              <h4 className="font-bold text-sm" style={{ color: "var(--brand-text-primary)" }}>Seeding control</h4>
              <p className="text-xs opacity-75">Resets both symptoms and goals tables back to standard client defaults.</p>
            </div>
            <button
              disabled={isSeeding}
              onClick={() => handleSeed(4)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 transition-all hover:bg-indigo-100 disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5" />
              Reset & Seed Step 4 Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ─── SYMPTOMS SECTION ─── */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--brand-border)" }}>
                <h3 className="font-bold text-base mb-4" style={{ color: "var(--brand-text-primary)" }}>
                  Symptom Options
                </h3>

                {/* Form inline */}
                <form onSubmit={handleAddSymptom} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    required
                    placeholder="Add new symptom..."
                    value={symptomForm.name}
                    onChange={(e) => setSymptomForm({ name: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none"
                    style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-semibold text-white bg-indigo-600 flex items-center gap-1 text-sm shadow hover:bg-indigo-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </form>

                {/* List Chips */}
                <div className="flex flex-wrap gap-2.5">
                  {data?.symptoms?.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full border text-xs font-semibold transition-all"
                      style={{
                        background: "var(--brand-surface)",
                        borderColor: "var(--brand-border)",
                        color: "var(--brand-text-primary)",
                      }}
                    >
                      <span>{s.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSymptom(s.id)}
                        className="p-0.5 rounded-full text-rose-500 hover:bg-rose-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {!data?.symptoms?.length && (
                    <p className="text-xs opacity-50 p-4 w-full text-center">No symptoms registered.</p>
                  )}
                </div>
              </div>
            </div>

            {/* ─── GOALS SECTION ─── */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--brand-border)" }}>
                <h3 className="font-bold text-base mb-4" style={{ color: "var(--brand-text-primary)" }}>
                  Training Goal Options
                </h3>

                {/* Add Goal Form */}
                <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                  <input
                    type="text"
                    required
                    placeholder="value (e.g. lose_weight)"
                    value={goalForm.value}
                    onChange={(e) => setGoalForm({ ...goalForm, value: e.target.value })}
                    className="px-3 py-2 rounded-xl text-sm border focus:outline-none"
                    style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Display Label"
                    value={goalForm.label}
                    onChange={(e) => setGoalForm({ ...goalForm, label: e.target.value })}
                    className="px-3 py-2 rounded-xl text-sm border focus:outline-none"
                    style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}
                  />
                  <button
                    type="submit"
                    className="py-2 rounded-xl font-semibold text-white bg-indigo-600 flex items-center justify-center gap-1 text-sm shadow hover:bg-indigo-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Goal
                  </button>
                </form>

                {/* Goals Table */}
                <div className="overflow-x-auto border rounded-xl" style={{ borderColor: "var(--brand-border)" }}>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr style={{ background: "var(--brand-surface)", color: "var(--brand-text-muted)" }}>
                        <th className="p-2.5 font-semibold text-xs rounded-l-lg">Value / ID</th>
                        <th className="p-2.5 font-semibold text-xs">Display Label</th>
                        <th className="p-2.5 font-semibold text-xs rounded-r-lg text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.goals?.map((g) => (
                        <tr key={g.id} className="border-t" style={{ borderColor: "var(--brand-border)" }}>
                          <td className="p-2.5">
                            <code className="text-xs px-1.5 py-0.5 rounded bg-slate-100">{g.value}</code>
                          </td>
                          <td className="p-2.5 font-semibold" style={{ color: "var(--brand-text-primary)" }}>
                            {g.label}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => handleDeleteGoal(g.id)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!data?.goals?.length && (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-xs opacity-50">
                            No training goals configured.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
