import { BrowserRouter, Routes } from "react-router-dom";
import { ShellLayout } from "@/widgets/layout";

export function App() {
  return (
    <BrowserRouter>
      <ShellLayout>
        <Routes>
          {/* <Route path="/teams" element={<Teams />} /> */}
          {/* <Route path="/boards" element={<Boards />} /> */}
          {/* <Route path="/plans" element={<Plans />} /> */}
          {/* <Route path="/chat" element={<Chat />} /> */}
          {/* <Route path="/settings" element={<Settings />} /> */}
          {/* <Route path="/profile" element={<Profile />} /> */}
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </ShellLayout>
    </BrowserRouter>
  );
}
