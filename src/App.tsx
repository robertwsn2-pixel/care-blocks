import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Medicacao from "./pages/Medicacao";
import Rotina from "./pages/Rotina";
import Comunicacao from "./pages/Comunicacao";
import EstadoPaciente from "./pages/EstadoPaciente";
import SuporteEmocional from "./pages/SuporteEmocional";
import Configuracoes from "./pages/Configuracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/medicacao" element={<Medicacao />} />
          <Route path="/rotina" element={<Rotina />} />
          <Route path="/comunicacao" element={<Comunicacao />} />
          <Route path="/estado-paciente" element={<EstadoPaciente />} />
          <Route path="/suporte-emocional" element={<SuporteEmocional />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
