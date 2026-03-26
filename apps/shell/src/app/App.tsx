import { BrowserRouter, Routes } from "react-router-dom";
import { ShellLayout } from "@/widgets/layout";

export function App() {
  return (
    <BrowserRouter>
      <ShellLayout>
        <Routes></Routes>
      </ShellLayout>
    </BrowserRouter>
  );
}
