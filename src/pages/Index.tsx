import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { DashboardCard } from "@/components/DashboardCard";
import {
  Pill,
  Calendar,
  MessageCircle,
  Activity,
  Heart,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [tarefasCompletas, setTarefasCompletas] = useState(0);
  const [pendencias, setPendencias] = useState(0);
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadStats(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadStats(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadStats = async (userId: string) => {
    const hoje = new Date().toISOString().split('T')[0];
    const agora = new Date();
    const proximasHoras = new Date(agora.getTime() + 3 * 60 * 60 * 1000); // próximas 3 horas

    // Contar tarefas completas (medicações tomadas + eventos concluídos)
    const { count: medicacoesTomadas } = await supabase
      .from("medicacoes")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("dia", hoje)
      .eq("ativo", false);

    const { count: eventosConcluidos } = await supabase
      .from("rotina_eventos")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("data", hoje)
      .eq("concluido", true);

    const totalCompletas = (medicacoesTomadas || 0) + (eventosConcluidos || 0);
    setTarefasCompletas(totalCompletas);

    // Contar pendências (medicações e eventos não concluídos nas próximas horas)
    const { data: medicacoesPendentes } = await supabase
      .from("medicacoes")
      .select("*")
      .eq("user_id", userId)
      .eq("dia", hoje)
      .eq("ativo", true)
      .lte("horario", proximasHoras.toTimeString().split(' ')[0]);

    const { data: eventosPendentes } = await supabase
      .from("rotina_eventos")
      .select("*")
      .eq("user_id", userId)
      .eq("data", hoje)
      .eq("concluido", false)
      .lte("horario", proximasHoras.toTimeString().split(' ')[0]);

    const totalPendencias = (medicacoesPendentes?.length || 0) + (eventosPendentes?.length || 0);
    setPendencias(totalPendencias);

    // Contar mensagens não lidas
    const { count: mensagensCount } = await supabase
      .from("mensagens")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("lida", false)
      .eq("enviado_por", "contato");

    setMensagensNaoLidas(mensagensCount || 0);
  };

  const handleCardClick = (title: string) => {
    toast({
      title: `${title}`,
      description: "Esta funcionalidade será implementada em breve.",
    });
  };

  const dashboardCards = [
    {
      title: "Medicação",
      description: "Gerencie horários, alertas e histórico de medicamentos",
      icon: Pill,
      pendingCount: 2,
      status: "warning" as const,
      onClick: () => navigate("/medicacao"),
    },
    {
      title: "Rotina & Calendário",
      description: "Organize atividades diárias e compromissos",
      icon: Calendar,
      pendingCount: 0,
      status: "success" as const,
      onClick: () => navigate("/rotina"),
    },
    {
      title: "Comunicação",
      description: "Chat entre cuidadores e atualizações importantes",
      icon: MessageCircle,
      pendingCount: 5,
      status: "urgent" as const,
      onClick: () => navigate("/comunicacao"),
    },
    {
      title: "Estado do Paciente",
      description: "Monitore humor, sintomas e bem-estar",
      icon: Activity,
      pendingCount: 0,
      status: "default" as const,
      onClick: () => navigate("/estado-paciente"),
    },
    {
      title: "Suporte Emocional",
      description: "Recursos e comunidade para cuidadores",
      icon: Heart,
      pendingCount: 0,
      status: "default" as const,
      onClick: () => navigate("/suporte-emocional"),
    },
    {
      title: "Configurações",
      description: "Perfil, preferências e gerenciamento de acesso",
      icon: Settings,
      pendingCount: 0,
      status: "default" as const,
      onClick: () => navigate("/configuracoes"),
    },
  ];

  const filteredCards = searchQuery
    ? dashboardCards.filter(
        (card) =>
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dashboardCards;

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-foreground mb-3 leading-tight">
            Bem-vindo ao AlzheimerCare
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Central de gerenciamento de cuidados para pacientes com Alzheimer
          </p>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-success/10 border-2 border-success/30 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-success flex items-center justify-center shadow-md">
                <span className="text-3xl font-bold text-white">{tarefasCompletas}</span>
              </div>
              <div>
                <p className="text-base text-muted-foreground font-medium">Tarefas Completas</p>
                <p className="text-xl font-semibold text-foreground">Hoje</p>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 border-2 border-warning/30 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-warning flex items-center justify-center shadow-md">
                <span className="text-3xl font-bold text-white">{pendencias}</span>
              </div>
              <div>
                <p className="text-base text-muted-foreground font-medium">Pendências</p>
                <p className="text-xl font-semibold text-foreground">Próximas 3 horas</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-md">
                <span className="text-3xl font-bold text-white">{mensagensNaoLidas}</span>
              </div>
              <div>
                <p className="text-base text-muted-foreground font-medium">Mensagens</p>
                <p className="text-xl font-semibold text-foreground">Não lidas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <DashboardCard key={card.title} {...card} />
          ))}
        </div>

        {/* No results message */}
        {searchQuery && filteredCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              Nenhum resultado encontrado para "{searchQuery}"
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
