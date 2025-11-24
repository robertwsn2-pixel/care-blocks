import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Activity, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface EstadoPaciente {
  id: string;
  data: string;
  humor: string;
  nivel_dor: number;
  observacoes: string;
}

const EstadoPaciente = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [estados, setEstados] = useState<EstadoPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    humor: "",
    nivel_dor: 0,
    observacoes: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadEstados(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadEstados(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const mapHumorToNumber = (humor: string): number => {
    const humorMap: { [key: string]: number } = {
      muito_feliz: 10,
      feliz: 8,
      neutro: 5,
      triste: 3,
      muito_triste: 1,
      irritado: 2,
      ansioso: 3,
    };
    return humorMap[humor] || 5;
  };

  const loadEstados = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("estado_paciente")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar registros",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEstados(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.humor) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione o humor.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    const { error } = await supabase.from("estado_paciente").insert({
      user_id: user.id,
      data: new Date().toISOString().split('T')[0],
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
        title: "Registro cadastrado",
        description: "Estado do paciente registrado com sucesso!",
      });

      setFormData({
        humor: "",
        nivel_dor: 0,
        observacoes: "",
      });

      loadEstados(user.id);
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
              Estado do Paciente
            </h2>
            <p className="text-muted-foreground text-xl mt-2">
              Registre o estado atual do paciente
            </p>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto border-3 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Plus className="h-8 w-8 text-primary" />
              Novo Registro
            </CardTitle>
            <CardDescription className="text-lg">
              Como está o paciente hoje?
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="humor" className="text-lg font-semibold">
                  Humor *
                </Label>
                <Select value={formData.humor} onValueChange={(value) => setFormData({ ...formData, humor: value })}>
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="Selecione o humor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muito_feliz">😄 Muito Feliz</SelectItem>
                    <SelectItem value="feliz">🙂 Feliz</SelectItem>
                    <SelectItem value="neutro">😐 Neutro</SelectItem>
                    <SelectItem value="triste">😔 Triste</SelectItem>
                    <SelectItem value="muito_triste">😢 Muito Triste</SelectItem>
                    <SelectItem value="irritado">😠 Irritado</SelectItem>
                    <SelectItem value="ansioso">😰 Ansioso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="nivel_dor" className="text-lg font-semibold">
                  Nível de Dor: {formData.nivel_dor}
                </Label>
                <Slider
                  value={[formData.nivel_dor]}
                  onValueChange={(value) => setFormData({ ...formData, nivel_dor: value[0] })}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Sem dor</span>
                  <span>Dor máxima</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="observacoes" className="text-lg font-semibold">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Notas adicionais sobre o estado do paciente..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="text-lg min-h-[150px]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="flex-1 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Cadastrar Registro
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

        {!loading && estados.length > 0 && (
          <Card className="max-w-3xl mx-auto border-3 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                Evolução do Paciente
              </CardTitle>
              <CardDescription className="text-lg">
                Acompanhe a progressão diária de dor e felicidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  nivel_dor: {
                    label: "Nível de Dor",
                    color: "hsl(0, 70%, 50%)",
                  },
                  nivel_felicidade: {
                    label: "Nível de Felicidade",
                    color: "hsl(142, 70%, 50%)",
                  },
                }}
                className="h-[400px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={estados
                      .slice(0, 10)
                      .reverse()
                      .map((estado) => ({
                        data: new Date(estado.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                        nivel_dor: estado.nivel_dor,
                        nivel_felicidade: estado.humor ? mapHumorToNumber(estado.humor) : 5,
                      }))}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="data" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      domain={[0, 10]}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="nivel_dor"
                      name="Dor"
                      stroke="hsl(0, 70%, 50%)"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(0, 70%, 50%)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="nivel_felicidade"
                      name="Felicidade"
                      stroke="hsl(142, 70%, 50%)"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(142, 70%, 50%)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground text-xl mt-8">Carregando...</div>
        ) : estados.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Histórico</h3>
            <div className="grid gap-4">
              {estados.map((estado) => (
                <Card key={estado.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Activity className="h-8 w-8 text-primary mt-1" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-xl font-semibold text-foreground">
                            {new Date(estado.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </h4>
                        </div>
                        <p className="text-muted-foreground text-lg">
                          <strong>Humor:</strong> {estado.humor.replace('_', ' ')}
                        </p>
                        <p className="text-muted-foreground text-lg">
                          <strong>Nível de Dor:</strong> {estado.nivel_dor}/10
                        </p>
                        {estado.observacoes && (
                          <p className="text-muted-foreground text-lg mt-2">
                            <strong>Observações:</strong> {estado.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-xl mt-8">
            Nenhum registro encontrado.
          </div>
        )}
      </main>
    </div>
  );
};

export default EstadoPaciente;