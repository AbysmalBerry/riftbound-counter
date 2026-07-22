import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/layout/AppShell";
import { useApplyPreferences } from "@/hooks/useApplyPreferences";

// Lazy-loaded routes → the play table is a separate chunk from the hub.
const GamesPage = lazy(() => import("@/features/games/GamesPage"));
const RiftboundSetupPage = lazy(() => import("@/features/games/RiftboundSetupPage"));
const RiftboundCounterPage = lazy(() => import("@/features/games/RiftboundCounterPage"));
const QuizPage = lazy(() => import("@/features/quiz/QuizPage"));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage"));

const Loading = () => (
  <div className="flex h-40 items-center justify-center">
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-edge border-t-brand" />
  </div>
);

const page = (el: React.ReactNode) => <Suspense fallback={<Loading />}>{el}</Suspense>;

export default function App() {
  // Reduce-motion flag → <html data-motion>, plus the accent theme.
  useApplyPreferences();

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={page(<GamesPage />)} />
        <Route path="/setup" element={page(<RiftboundSetupPage />)} />
        <Route path="/quiz" element={page(<QuizPage />)} />
        <Route path="/settings" element={page(<SettingsPage />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      {/* Full-screen table tool — outside the shell so the whole viewport is the counter */}
      <Route path="/play" element={page(<RiftboundCounterPage />)} />
    </Routes>
  );
}
