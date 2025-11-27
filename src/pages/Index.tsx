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
  const [medicacoesPendentes, setMedicacoesPendentes] = useState(0);
  const [eventosPendentes, setEventosPendentes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
          await loadStats(session.user.id);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

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

  // Realtime updates para recarregar stats automaticamente
  useEffect(() => {
    if (!user) return;

    const medicacoesChannel = supabase
      .channel('medicacoes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medicacoes' }, () => {
        loadStats(user.id);
      })
      .subscribe();

    const rotinaChannel = supabase
      .channel('rotina-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rotina_eventos' }, () => {
        loadStats(user.id);
      })
      .subscribe();

    const mensagensChannel = supabase
      .channel('mensagens-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mensagens' }, () => {
        loadStats(user.id);
      })
      .subscribe();

    return () => {
      medicacoesChannel.unsubscribe();
      rotinaChannel.unsubscribe();
      mensagensChannel.unsubscribe();
    };
  }, [user]);

  const loadStats = async (userId: string) => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const agora = new Date();
      const horaAtual = agora.toTimeString().split(' ')[0].substring(0, 8);

      console.log("Carregando stats para:", { userId, hoje, horaAtual });

      // Contar tarefas completas (medicações tomadas + eventos concluídos HOJE)
      try {
        const { count: medicacoesTomadas, error: medError } = await supabase
          .from("medicacoes")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId)
          .eq("dia", hoje)
          .eq("ativo", false);

        if (medError) console.error("Erro medicações tomadas:", medError);

        const { count: eventosConcluidos, error: eventError } = await supabase
          .from("rotina_eventos")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId)
          .eq("data", hoje)
          .eq("concluido", true);

        if (eventError) console.error("Erro eventos concluídos:", eventError);

        const totalCompletas = (medicacoesTomadas || 0) + (eventosConcluidos || 0);
        console.log("Tarefas completas:", { medicacoesTomadas, eventosConcluidos, totalCompletas });
        setTarefasCompletas(totalCompletas);
      } catch (error) {
        console.error("Erro ao carregar tarefas completas:", error);
      }

      // Contar TODAS as pendências de hoje (não apenas próximas 3 horas)
      try {
        const { count: medicacoesPendentesCount, error: medPendError } = await supabase
          .from("medicacoes")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId)
          .eq("dia", hoje)
          .eq("ativo", true);

        if (medPendError) console.error("Erro medicações pendentes:", medPendError);

        const { count: eventosPendentesCount, error: eventPendError } = await supabase
          .from("rotina_eventos")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId)
          .eq("data", hoje)
          .eq("concluido", false);

        if (eventPendError) console.error("Erro eventos pendentes:", eventPendError);

        const medPendentes = medicacoesPendentesCount || 0;
        const evtPendentes = eventosPendentesCount || 0;
        const totalPendencias = medPendentes + evtPendentes;

        console.log("Pendências:", { medicacoesPendentes: medPendentes, eventosPendentes: evtPendentes, totalPendencias });

        setMedicacoesPendentes(medPendentes);
        setEventosPendentes(evtPendentes);
        setPendencias(totalPendencias);
      } catch (error) {
        console.error("Erro ao carregar pendências:", error);
      }

      // Contar mensagens não lidas
      try {
        const { count: mensagensCount, error: msgError } = await supabase
          .from("mensagens")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId)
          .eq("lida", false)
          .eq("enviado_por", "contato");

        if (msgError) console.error("Erro mensagens:", msgError);

        console.log("Mensagens não lidas:", mensagensCount);
        setMensagensNaoLidas(mensagensCount || 0);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      }
    } catch (error) {
      console.error("Erro geral ao carregar estatísticas:", error);
    }
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
      pendingCount: medicacoesPendentes,
      status: medicacoesPendentes > 0 ? ("warning" as const) : ("success" as const),
      onClick: () => navigate("/medicacao"),
    },
    {
      title: "Rotina & Calendário",
      description: "Organize atividades diárias e compromissos",
      icon: Calendar,
      pendingCount: eventosPendentes,
      status: eventosPendentes > 0 ? ("warning" as const) : ("success" as const),
      onClick: () => navigate("/rotina"),
    },
    {
      title: "Comunicação",
      description: "Chat entre cuidadores e atualizações importantes",
      icon: MessageCircle,
      pendingCount: mensagensNaoLidas,
      status: mensagensNaoLidas > 0 ? ("urgent" as const) : ("success" as const),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

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
                <p className="text-xl font-semibold text-foreground">Hoje</p>
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
