import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Plus, Trash2, Pill, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Medicacao {
  id: string;
  medicamento: string;
  quantidade: string;
  horario: string;
  dia: string;
  ativo: boolean;
}

const Medicacao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [medicacoes, setMedicacoes] = useState<Medicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    medicamento: "",
    quantidade: "",
    horario: "",
    dia: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadMedicacoes(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadMedicacoes(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadMedicacoes = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("medicacoes")
      .select("*")
      .eq("user_id", userId)
      .eq("ativo", true)
      .order("dia", { ascending: true })
      .order("horario", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar medicações",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMedicacoes(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medicamento || !formData.quantidade || !formData.horario || !formData.dia) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    const { error } = await supabase.from("medicacoes").insert({
      user_id: user.id,
      medicamento: formData.medicamento,
      quantidade: formData.quantidade,
      horario: formData.horario,
      dia: formData.dia,
    });

    if (error) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Medicação cadastrada",
        description: `${formData.medicamento} adicionado com sucesso!`,
      });

      setFormData({
        medicamento: "",
        quantidade: "",
        horario: "",
        dia: "",
      });

      loadMedicacoes(user.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("medicacoes")
      .update({ ativo: false })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Medicação removida",
        description: "Medicação removida com sucesso!",
      });
      loadMedicacoes(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com botão voltar */}
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
              Gerenciar Medicação
            </h2>
            <p className="text-muted-foreground text-xl mt-2">
              Cadastre os medicamentos e horários
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário de cadastro */}
          <Card className="border-3 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Plus className="h-8 w-8 text-primary" />
                Adicionar Medicamento
              </CardTitle>
              <CardDescription className="text-lg">
                Preencha os dados do medicamento
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Campo Medicamento */}
                <div className="space-y-3">
                  <Label htmlFor="medicamento" className="text-lg font-semibold">
                    Nome do Medicamento *
                  </Label>
                  <Input
                    id="medicamento"
                    placeholder="Ex: Donepezila"
                    value={formData.medicamento}
                    onChange={(e) =>
                      setFormData({ ...formData, medicamento: e.target.value })
                    }
                    className="h-14 text-lg"
                  />
                </div>

                {/* Campo Quantidade */}
                <div className="space-y-3">
                  <Label htmlFor="quantidade" className="text-lg font-semibold">
                    Quantidade/Dosagem *
                  </Label>
                  <Input
                    id="quantidade"
                    placeholder="Ex: 10mg ou 2 comprimidos"
                    value={formData.quantidade}
                    onChange={(e) =>
                      setFormData({ ...formData, quantidade: e.target.value })
                    }
                    className="h-14 text-lg"
                  />
                </div>

                {/* Campo Horário */}
                <div className="space-y-3">
                  <Label htmlFor="horario" className="text-lg font-semibold">
                    Horário *
                  </Label>
                  <Input
                    id="horario"
                    type="time"
                    value={formData.horario}
                    onChange={(e) =>
                      setFormData({ ...formData, horario: e.target.value })
                    }
                    className="h-14 text-lg"
                  />
                </div>

                {/* Campo Dia */}
                <div className="space-y-3">
                  <Label htmlFor="dia" className="text-lg font-semibold">
                    Dia *
                  </Label>
                  <Input
                    id="dia"
                    type="date"
                    value={formData.dia}
                    onChange={(e) =>
                      setFormData({ ...formData, dia: e.target.value })
                    }
                    className="h-14 text-lg"
                  />
                </div>

                {/* Botões de ação */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 text-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Cadastrar Medicamento
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

        {/* Lista de medicações */}
        {loading ? (
          <div className="text-center text-muted-foreground text-xl mt-8">Carregando...</div>
        ) : medicacoes.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Medicações Cadastradas</h3>
            <div className="grid gap-4">
              {medicacoes.map((med) => (
                <Card key={med.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Pill className="h-8 w-8 text-primary mt-1" />
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-foreground">{med.medicamento}</h4>
                          <p className="text-muted-foreground text-lg mt-1">
                            <strong>Quantidade:</strong> {med.quantidade}
                          </p>
                          <p className="text-muted-foreground text-lg">
                            <strong>Horário:</strong> {med.horario}
                          </p>
                          <p className="text-muted-foreground text-lg">
                            <strong>Dia:</strong> {new Date(med.dia + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(med.id)}
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
            Nenhuma medicação cadastrada ainda.
          </div>
        )}
      </main>
    </div>
  );
};

export default Medicacao;
