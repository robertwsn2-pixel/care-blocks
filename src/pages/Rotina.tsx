import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RotinaEvento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  tipo: string;
  concluido: boolean;
}

const Rotina = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [eventos, setEventos] = useState<RotinaEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: new Date().toISOString().split('T')[0],
    horario: "",
    tipo: "afazer",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadEventos(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadEventos(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadEventos = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rotina_eventos")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: true })
      .order("horario", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEventos(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.data) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título e data.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    const { error } = await supabase.from("rotina_eventos").insert({
      user_id: user.id,
      ...formData,
    });

    if (error) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Evento cadastrado",
        description: `${formData.titulo} adicionado com sucesso!`,
      });

      setFormData({
        titulo: "",
        descricao: "",
        data: new Date().toISOString().split('T')[0],
        horario: "",
        tipo: "afazer",
      });

      loadEventos(user.id);
    }
  };

  const handleToggleConcluido = async (id: string, concluido: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from("rotina_eventos")
      .update({ concluido: !concluido })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      loadEventos(user.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("rotina_eventos")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Evento removido",
        description: "Evento removido com sucesso!",
      });
      loadEventos(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Button>
          
          <div>
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Rotina & Calendário
            </h2>
            <p className="text-muted-foreground text-xl mt-2">
              Organize a rotina e afazeres
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card className="border-3 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Plus className="h-8 w-8 text-primary" />
                Adicionar Evento
              </CardTitle>
              <CardDescription className="text-lg">
                Preencha os dados do evento
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="titulo" className="text-lg font-semibold">
                    Título *
                  </Label>
                  <Input
                    id="titulo"
                    placeholder="Ex: Consulta médica"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="h-14 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="tipo" className="text-lg font-semibold">
                    Tipo
                  </Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="afazer">Afazer</SelectItem>
                      <SelectItem value="rotina">Rotina</SelectItem>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="exercicio">Exercício</SelectItem>
                      <SelectItem value="lazer">Lazer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="descricao" className="text-lg font-semibold">
                    Descrição
                  </Label>
                  <Textarea
                    id="descricao"
                    placeholder="Detalhes do evento..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="text-lg min-h-[100px]"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="data" className="text-lg font-semibold">
                    Data *
                  </Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="h-14 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="horario" className="text-lg font-semibold">
                    Horário
                  </Label>
                  <Input
                    id="horario"
                    type="time"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="h-14 text-lg"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" size="lg" className="flex-1 text-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Cadastrar Evento
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/")}
                    className="text-lg"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Calendário */}
          <Card className="border-3 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <CalendarIcon className="h-8 w-8 text-primary" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        {/* Lista de eventos */}
        {loading ? (
          <div className="text-center text-muted-foreground text-xl mt-8">Carregando...</div>
        ) : eventos.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Eventos Cadastrados</h3>
            <div className="grid gap-4">
              {eventos.map((evento) => (
                <Card key={evento.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Checkbox
                          checked={evento.concluido}
                          onCheckedChange={() => handleToggleConcluido(evento.id, evento.concluido)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className={`text-xl font-semibold ${evento.concluido ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {evento.titulo}
                          </h4>
                          {evento.descricao && (
                            <p className="text-muted-foreground text-lg mt-1">{evento.descricao}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-muted-foreground text-lg">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                            {evento.horario && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {evento.horario}
                              </span>
                            )}
                            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">
                              {evento.tipo}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(evento.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-xl mt-8">
            Nenhum evento cadastrado ainda.
          </div>
        )}
      </main>
    </div>
  );
};

export default Rotina;