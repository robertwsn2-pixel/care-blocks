import { useState } from "react";
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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

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
      onClick: () => handleCardClick("Medicação"),
    },
    {
      title: "Rotina & Calendário",
      description: "Organize atividades diárias e compromissos",
      icon: Calendar,
      pendingCount: 0,
      status: "success" as const,
      onClick: () => handleCardClick("Rotina & Calendário"),
    },
    {
      title: "Comunicação",
      description: "Chat entre cuidadores e atualizações importantes",
      icon: MessageCircle,
      pendingCount: 5,
      status: "urgent" as const,
      onClick: () => handleCardClick("Comunicação"),
    },
    {
      title: "Estado do Paciente",
      description: "Monitore humor, sintomas e bem-estar",
      icon: Activity,
      pendingCount: 0,
      status: "default" as const,
      onClick: () => handleCardClick("Estado do Paciente"),
    },
    {
      title: "Suporte Emocional",
      description: "Recursos e comunidade para cuidadores",
      icon: Heart,
      pendingCount: 0,
      status: "default" as const,
      onClick: () => handleCardClick("Suporte Emocional"),
    },
    {
      title: "Configurações",
      description: "Perfil, preferências e gerenciamento de acesso",
      icon: Settings,
      pendingCount: 0,
      status: "default" as const,
      onClick: () => handleCardClick("Configurações"),
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
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Bem-vindo de volta, Maria
          </h2>
          <p className="text-lg text-muted-foreground">
            Cuidando de João Silva • Última atualização: há 15 minutos
          </p>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border-2 border-border p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-success">3</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarefas Completas</p>
                <p className="text-lg font-semibold">Hoje</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border-2 border-border p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-warning">2</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendências</p>
                <p className="text-lg font-semibold">Próximas horas</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border-2 border-border p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">5</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mensagens</p>
                <p className="text-lg font-semibold">Não lidas</p>
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
