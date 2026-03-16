import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Spec from "./pages/Spec";
import Crews from "./pages/Crews";
import Toolbox from "./pages/Toolbox";
import Prompts from "./pages/Prompts";
import Builder from "./pages/Builder";
import Share from "./pages/Share";
import Startup from "./pages/Startup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/spec" element={<Spec />} />
            <Route path="/crews" element={<Crews />} />
            <Route path="/toolbox" element={<Toolbox />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/share" element={<Share />} />
            <Route path="/startup" element={<Startup />} />
            {/* Legacy route redirect */}
            <Route path="/resources" element={<Toolbox />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
