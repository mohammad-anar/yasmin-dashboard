"use client";

import { useState } from "react";
import {
  useGetWorkoutsQuery,
  useCreateWorkoutMutation,
  useDeleteWorkoutMutation,
  Workout,
  Exercise,
} from "@/lib/store/api/workoutsApi";
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Dumbbell, Trash2, Eye } from "lucide-react";

const PHASES = ["menstrual", "follicular", "ovulatory", "luteal", "all"];
const INTENSITIES = ["low", "moderate", "high"];

function CreateWorkoutModal({
  open,
  onClose,
  onCreate,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: Partial<Workout>) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [intensity, setIntensity] = useState("low");
  const [duration, setDuration] = useState("15-30");
  const [durationMins, setDurationMins] = useState("20");
  const [bodypart, setBodypart] = useState("full body");
  const [equipment, setEquipment] = useState("no equipment");
  const [phaseNote, setPhaseNote] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", sets: [{ reps: "10" }] },
  ]);

  if (!open) return null;

  const togglePhase = (phase: string) => {
    if (selectedPhases.includes(phase)) {
      setSelectedPhases(selectedPhases.filter((p) => p !== phase));
    } else {
      setSelectedPhases([...selectedPhases, phase]);
    }
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: [{ reps: "10" }] }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseNameChange = (index: number, val: string) => {
    const updated = [...exercises];
    updated[index].name = val;
    setExercises(updated);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ reps: "10" });
    setExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    setExercises(updated);
  };

  const handleSetRepsChange = (exerciseIndex: number, setIndex: number, val: string) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex].reps = val;
    setExercises(updated);
  };

  const handleSubmit = () => {
    if (!name || !desc || selectedPhases.length === 0 || !durationMins || !phaseNote) {
      alert("Please fill in all required fields and select at least one phase.");
      return;
    }

    const cleanExercises = exercises.filter((ex) => ex.name.trim() !== "");
    if (cleanExercises.length === 0) {
      alert("Please add at least one exercise.");
      return;
    }

    onCreate({
      name,
      desc,
      phase: selectedPhases,
      intensity,
      duration,
      duration_mins: parseInt(durationMins) || 20,
      bodypart,
      equipment,
      phaseNote,
      exercises: cleanExercises,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-2xl p-6 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ background: "white" }}>
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <h3 className="font-bold text-lg" style={{ color: "var(--brand-text-primary)" }}>Add New Workout</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: "var(--brand-text-muted)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
                Workout Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Upper Body Strength"
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
                Intensity *
              </label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none capitalize"
                style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
              >
                {INTENSITIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
              Description *
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Provide a description of the workout flow and goal..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
                Duration Range (e.g. 15-30) *
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
                Duration Mins *
              </label>
              <input
                type="number"
                value={durationMins}
                onChange={(e) => setDurationMins(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
                Body Part *
              </label>
              <input
                type="text"
                value={bodypart}
                onChange={(e) => setBodypart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
                Equipment *
              </label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
                Phase Note *
              </label>
              <input
                type="text"
                value={phaseNote}
                onChange={(e) => setPhaseNote(e.target.value)}
                placeholder="Why is this workout good for this phase?"
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ border: "1.5px solid var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--brand-text-secondary)" }}>
              Phases (Select at least one) *
            </label>
            <div className="flex flex-wrap gap-2">
              {PHASES.map((p) => {
                const selected = selectedPhases.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePhase(p)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all"
                    style={{
                      background: selected ? "var(--brand-accent)" : "var(--brand-surface)",
                      color: selected ? "white" : "var(--brand-text-muted)",
                      borderColor: selected ? "var(--brand-accent)" : "var(--brand-border)",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm" style={{ color: "var(--brand-text-primary)" }}>Exercises</h4>
              <button
                type="button"
                onClick={handleAddExercise}
                className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-all"
                style={{ background: "var(--brand-surface)", color: "var(--brand-accent)", border: "1px solid var(--brand-border)" }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Exercise
              </button>
            </div>

            <div className="space-y-4">
              {exercises.map((exercise, exIdx) => (
                <div key={exIdx} className="p-3 rounded-xl border relative" style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)" }}>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="absolute top-3 right-3 p-1 rounded-lg text-red-500 hover:bg-red-50 transition-all font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1" style={{ color: "var(--brand-text-secondary)" }}>
                        Exercise Name
                      </label>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => handleExerciseNameChange(exIdx, e.target.value)}
                        placeholder="e.g. Squat"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none bg-white font-medium"
                        style={{ border: "1px solid var(--brand-border)", color: "var(--brand-text-primary)" }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold" style={{ color: "var(--brand-text-secondary)" }}>
                          Sets & Reps
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddSet(exIdx)}
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          + Add Set
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {exercise.sets.map((set, setIdx) => (
                          <div key={setIdx} className="flex items-center gap-1 bg-white px-2 py-1 rounded border" style={{ borderColor: "var(--brand-border)" }}>
                            <input
                              type="text"
                              value={set.reps}
                              onChange={(e) => handleSetRepsChange(exIdx, setIdx, e.target.value)}
                              className="w-12 text-center text-xs font-semibold focus:outline-none"
                              placeholder="10"
                            />
                            {exercise.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exIdx, setIdx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--brand-surface)", color: "var(--brand-text-primary)", border: "1px solid var(--brand-border)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "var(--brand-accent)" }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Save Workout
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewWorkoutModal({
  workout,
  onClose,
}: {
  workout: Workout | null;
  onClose: () => void;
}) {
  if (!workout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-2xl p-6 max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" style={{ background: "white" }}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="font-bold text-lg" style={{ color: "var(--brand-text-primary)" }}>Workout Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: "var(--brand-text-muted)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-grow">
          <div>
            <h4 className="text-xs font-bold text-gray-400 capitalize">Workout Name</h4>
            <p className="text-base font-semibold" style={{ color: "var(--brand-text-primary)" }}>{workout.name}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 capitalize">Description</h4>
            <p className="text-sm" style={{ color: "var(--brand-text-secondary)" }}>{workout.desc}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-gray-400 capitalize">Intensity</h4>
              <p className="text-sm font-medium capitalize" style={{ color: "var(--brand-text-primary)" }}>{workout.intensity}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 capitalize">Duration</h4>
              <p className="text-sm font-medium" style={{ color: "var(--brand-text-primary)" }}>{workout.duration_mins} mins ({workout.duration})</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-gray-400 capitalize">Body Part</h4>
              <p className="text-sm font-medium capitalize" style={{ color: "var(--brand-text-primary)" }}>{workout.bodypart}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-400 capitalize">Equipment</h4>
              <p className="text-sm font-medium capitalize" style={{ color: "var(--brand-text-primary)" }}>{workout.equipment}</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 capitalize">Phases</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {workout.phase.map((p) => (
                <span key={p} className="px-2 py-0.5 rounded bg-gray-100 text-xs font-semibold capitalize text-gray-600">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 capitalize">Phase Note</h4>
            <p className="text-xs italic" style={{ color: "var(--brand-text-muted)" }}>{workout.phaseNote}</p>
          </div>

          <div className="border-t pt-3 mt-2">
            <h4 className="text-sm font-bold text-gray-500 mb-2">Exercises ({workout.exercises.length})</h4>
            <div className="space-y-2">
              {workout.exercises.map((ex, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded bg-gray-50 border border-gray-100">
                  <span className="text-xs font-semibold text-gray-700">{ex.name}</span>
                  <span className="text-xs text-gray-500 font-mono">
                    {ex.sets.map((s) => s.reps).join(" · ")} ({ex.sets.length} sets)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
          style={{ background: "var(--brand-surface)", color: "var(--brand-text-primary)", border: "1px solid var(--brand-border)" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function WorkoutsPage() {
  const { data: workouts, isFetching, refetch } = useGetWorkoutsQuery();
  const [createWorkout, { isLoading: isCreating }] = useCreateWorkoutMutation();
  const [deleteWorkout] = useDeleteWorkoutMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreate = async (workoutData: Partial<Workout>) => {
    try {
      await createWorkout(workoutData).unwrap();
      setCreateOpen(false);
      setToastMessage("Workout added to library successfully!");
      setTimeout(() => setToastMessage(null), 3000);
      refetch();
    } catch (e: any) {
      alert(`Error: ${e?.data?.message || "Failed to create workout"}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this workout from the library?")) {
      try {
        await deleteWorkout(id).unwrap();
        setToastMessage("Workout deleted successfully!");
        setTimeout(() => setToastMessage(null), 3000);
        refetch();
      } catch (e: any) {
        alert(`Error: ${e?.data?.message || "Failed to delete workout"}`);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {toastMessage && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{
            background: "var(--brand-accent)",
            color: "white",
          }}
        >
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--brand-text-primary)" }}>
            <Dumbbell className="w-6 h-6" style={{ color: "var(--brand-accent)" }} />
            Workout Library
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--brand-text-muted)" }}>
            {workouts?.length ?? 0} total workouts available in the system
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all self-start sm:self-auto cursor-pointer"
          style={{ background: "var(--brand-accent)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-accent-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-accent)"; }}
        >
          <Plus className="w-4 h-4" />
          Add Workout
        </button>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "var(--brand-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--brand-surface)" }}>
                {["Workout", "Phases", "Intensity", "Duration", "Bodypart", "Equipment", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold whitespace-nowrap" style={{ color: "var(--brand-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isFetching && !workouts && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{ color: "var(--brand-accent)" }} />
                  </td>
                </tr>
              )}
              {workouts?.map((workout) => {
                const tcColor: Record<string, string> = {
                  low: "var(--status-success)",
                  moderate: "#D4821A",
                  high: "var(--status-danger)",
                };
                const tcBg: Record<string, string> = {
                  low: "var(--status-success-bg)",
                  moderate: "#fdf4e7",
                  high: "#fdf2f2",
                };

                return (
                  <tr
                    key={workout.id}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--brand-border)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--brand-surface)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--brand-text-primary)" }}>{workout.name}</p>
                        <p className="text-xs truncate max-w-xs" style={{ color: "var(--brand-text-muted)" }}>{workout.desc}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {workout.phase.map((p) => (
                          <span key={p} className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-gray-100 text-gray-600">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: tcBg[workout.intensity] || "#f4f4f5", color: tcColor[workout.intensity] || "#71717a" }}>
                        {workout.intensity}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium" style={{ color: "var(--brand-text-primary)" }}>
                      {workout.duration_mins} mins
                    </td>
                    <td className="px-5 py-4 text-xs font-medium capitalize" style={{ color: "var(--brand-text-muted)" }}>
                      {workout.bodypart}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium capitalize" style={{ color: "var(--brand-text-muted)" }}>
                      {workout.equipment}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingWorkout(workout)}
                          className="p-1.5 rounded-lg transition-all border cursor-pointer"
                          style={{ borderColor: "var(--brand-border)", background: "var(--brand-surface)", color: "var(--brand-text-secondary)" }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(workout.id)}
                          className="p-1.5 rounded-lg transition-all border hover:bg-red-50 text-red-500 cursor-pointer"
                          style={{ borderColor: "var(--brand-border)" }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {workouts?.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--brand-text-muted)" }} />
                    <p className="text-sm" style={{ color: "var(--brand-text-muted)" }}>No workouts found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateWorkoutModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        isLoading={isCreating}
      />

      <ViewWorkoutModal
        workout={viewingWorkout}
        onClose={() => setViewingWorkout(null)}
      />
    </div>
  );
}
