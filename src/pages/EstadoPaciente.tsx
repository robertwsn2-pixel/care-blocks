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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Activity, TrendingUp, TrendingDown, Minus, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from "recharts";

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
  const [periodo, setPeriodo] = useState<"7" | "30" | "90">("7");
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

  // Cálculo de média móvel
  const calcularMediaMovel = (dados: number[], janela: number = 3): number[] => {
    if (dados.length < janela) return dados;
    
    const medias: number[] = [];
    for (let i = 0; i < dados.length; i++) {
      if (i < janela - 1) {
        medias.push(dados[i]);
      } else {
        const soma = dados.slice(i - janela + 1, i + 1).reduce((a, b) => a + b, 0);
        medias.push(soma / janela);
      }
    }
    return medias;
  };

  // Cálculo de trendline (regressão linear)
  const calcularTrendline = (valores: number[]): number[] => {
    const n = valores.length;
    if (n === 0) return [];

    const indices = Array.from({ length: n }, (_, i) => i);
    const somaX = indices.reduce((a, b) => a + b, 0);
    const somaY = valores.reduce((a, b) => a + b, 0);
    const somaXY = indices.reduce((acc, x, i) => acc + x * valores[i], 0);
    const somaX2 = indices.reduce((acc, x) => acc + x * x, 0);

    const inclinacao = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);
    const intercepto = (somaY - inclinacao * somaX) / n;

    return indices.map(x => inclinacao * x + intercepto);
  };

  // Cálculo de correlação entre humor e dor
  const calcularCorrelacao = (x: number[], y: number[]): number => {
    const n = x.length;
    if (n === 0) return 0;

    const mediaX = x.reduce((a, b) => a + b, 0) / n;
    const mediaY = y.reduce((a, b) => a + b, 0) / n;

    let numerador = 0;
    let denominadorX = 0;
    let denominadorY = 0;

    for (let i = 0; i < n; i++) {
      const difX = x[i] - mediaX;
      const difY = y[i] - mediaY;
      numerador += difX * difY;
      denominadorX += difX * difX;
      denominadorY += difY * difY;
    }

    const denominador = Math.sqrt(denominadorX * denominadorY);
    return denominador === 0 ? 0 : numerador / denominador;
  };

  // Dados filtrados por período
  const dadosFiltrados = estados.slice(0, parseInt(periodo)).reverse();

  // Preparar dados para gráficos
  const dadosGrafico = dadosFiltrados.map((estado) => ({
    data: new Date(estado.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    nivel_dor: estado.nivel_dor,
    nivel_felicidade: estado.humor ? mapHumorToNumber(estado.humor) : 5,
    observacoes: estado.observacoes,
  }));

  // Média móvel
  const valoresDor = dadosGrafico.map(d => d.nivel_dor);
  const valoresFelicidade = dadosGrafico.map(d => d.nivel_felicidade);
  const mediaDor = calcularMediaMovel(valoresDor);
  const mediaFelicidade = calcularMediaMovel(valoresFelicidade);

  // Trendline
  const trendDor = calcularTrendline(valoresDor);
  const trendFelicidade = calcularTrendline(valoresFelicidade);

  const dadosComMedias = dadosGrafico.map((d, i) => ({
    ...d,
    media_dor: mediaDor[i],
    media_felicidade: mediaFelicidade[i],
    trend_dor: trendDor[i],
    trend_felicidade: trendFelicidade[i],
  }));

  // Correlação
  const correlacao = calcularCorrelacao(valoresFelicidade, valoresDor);
  const mostrarCorrelacao = Math.abs(correlacao) > 0.5;

  // Média semanal
  const calcularMediasSemanas = () => {
    const semanas: { [key: string]: { dor: number[], felicidade: number[] } } = {};
    
    dadosFiltrados.forEach((estado, idx) => {
      const semana = Math.floor(idx / 7);
      const chave = `Semana ${semana + 1}`;
      
      if (!semanas[chave]) {
        semanas[chave] = { dor: [], felicidade: [] };
      }
      
      semanas[chave].dor.push(estado.nivel_dor);
      semanas[chave].felicidade.push(mapHumorToNumber(estado.humor));
    });

    return Object.keys(semanas).map(chave => ({
      semana: chave,
      media_dor: semanas[chave].dor.reduce((a, b) => a + b, 0) / semanas[chave].dor.length,
      media_felicidade: semanas[chave].felicidade.reduce((a, b) => a + b, 0) / semanas[chave].felicidade.length,
    }));
  };

  const dadosSemanais = calcularMediasSemanas();

  // Indicador de evolução
  const calcularEvolucao = (valores: number[]) => {
    if (valores.length < 2) return "estável";
    
    const inicio = valores.slice(0, Math.floor(valores.length / 3));
    const fim = valores.slice(-Math.floor(valores.length / 3));
    
    const mediaInicio = inicio.reduce((a, b) => a + b, 0) / inicio.length;
    const mediaFim = fim.reduce((a, b) => a + b, 0) / fim.length;
    
    const diferenca = ((mediaFim - mediaInicio) / mediaInicio) * 100;
    
    if (diferenca > 10) return "melhora";
    if (diferenca < -10) return "piora";
    return "estável";
  };

  const evolucaoDor = calcularEvolucao(valoresDor);
  const evolucaoFelicidade = calcularEvolucao(valoresFelicidade);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                Análise completa da evolução do paciente
              </p>
            </div>
          </div>

          {/* Seletor de período */}
          <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
            <SelectTrigger className="w-[180px] h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Formulário de cadastro */}
        <Card className="max-w-3xl mx-auto border-2 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Plus className="h-6 w-6 text-primary" />
              Novo Registro
            </CardTitle>
            <CardDescription className="text-base">
              Como está o paciente hoje?
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="humor" className="text-base font-semibold">
                    Humor *
                  </Label>
                  <Select value={formData.humor} onValueChange={(value) => setFormData({ ...formData, humor: value })}>
                    <SelectTrigger className="h-12">
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
                  <Label htmlFor="nivel_dor" className="text-base font-semibold">
                    Nível de Dor: {formData.nivel_dor}
                  </Label>
                  <Slider
                    value={[formData.nivel_dor]}
                    onValueChange={(value) => setFormData({ ...formData, nivel_dor: value[0] })}
                    max={10}
                    step={1}
                    className="w-full mt-6"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Sem dor</span>
                    <span>Dor máxima</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="observacoes" className="text-base font-semibold">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Notas adicionais sobre o estado do paciente..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" size="lg" className="flex-1">
                  <Plus className="h-5 w-5 mr-2" />
                  Cadastrar Registro
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/")}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {!loading && estados.length > 0 && (
          <>
            {/* Indicadores de evolução */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Evolução da Dor</p>
                      <p className="text-2xl font-bold mt-1">
                        {evolucaoDor === "melhora" && <span className="text-green-600">Melhora</span>}
                        {evolucaoDor === "piora" && <span className="text-red-600">Piora</span>}
                        {evolucaoDor === "estável" && <span className="text-blue-600">Estável</span>}
                      </p>
                    </div>
                    {evolucaoDor === "melhora" && <TrendingDown className="h-12 w-12 text-green-600" />}
                    {evolucaoDor === "piora" && <TrendingUp className="h-12 w-12 text-red-600" />}
                    {evolucaoDor === "estável" && <Minus className="h-12 w-12 text-blue-600" />}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Evolução do Humor</p>
                      <p className="text-2xl font-bold mt-1">
                        {evolucaoFelicidade === "melhora" && <span className="text-green-600">Melhora</span>}
                        {evolucaoFelicidade === "piora" && <span className="text-red-600">Piora</span>}
                        {evolucaoFelicidade === "estável" && <span className="text-blue-600">Estável</span>}
                      </p>
                    </div>
                    {evolucaoFelicidade === "melhora" && <TrendingUp className="h-12 w-12 text-green-600" />}
                    {evolucaoFelicidade === "piora" && <TrendingDown className="h-12 w-12 text-red-600" />}
                    {evolucaoFelicidade === "estável" && <Minus className="h-12 w-12 text-blue-600" />}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <Tabs defaultValue="principal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="principal">Evolução Diária</TabsTrigger>
                <TabsTrigger value="correlacao">Correlação</TabsTrigger>
                <TabsTrigger value="semanal">Resumo Semanal</TabsTrigger>
              </TabsList>

              {/* Gráfico Principal */}
              <TabsContent value="principal">
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Activity className="h-6 w-6 text-primary" />
                      Evolução Diária com Tendências
                    </CardTitle>
                    <CardDescription>
                      Linha dupla: humor e dor | Pontos = dados brutos | Linhas suaves = média móvel 3 dias | Linhas tracejadas = tendência
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={500}>
                      <LineChart data={dadosComMedias} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                        <XAxis 
                          dataKey="data" 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          domain={[0, 10]}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        
                        {/* Pontos brutos - Dor */}
                        <Line
                          type="monotone"
                          dataKey="nivel_dor"
                          name="Dor (bruto)"
                          stroke="hsl(0, 70%, 50%)"
                          strokeWidth={0}
                          dot={{ fill: 'hsl(0, 70%, 50%)', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        
                        {/* Média móvel - Dor */}
                        <Line
                          type="monotone"
                          dataKey="media_dor"
                          name="Dor (média 3d)"
                          stroke="hsl(0, 70%, 50%)"
                          strokeWidth={3}
                          dot={false}
                        />
                        
                        {/* Trendline - Dor */}
                        <Line
                          type="monotone"
                          dataKey="trend_dor"
                          name="Tendência Dor"
                          stroke="hsl(0, 70%, 50%)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                        
                        {/* Pontos brutos - Felicidade */}
                        <Line
                          type="monotone"
                          dataKey="nivel_felicidade"
                          name="Felicidade (bruto)"
                          stroke="hsl(210, 70%, 50%)"
                          strokeWidth={0}
                          dot={{ fill: 'hsl(210, 70%, 50%)', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        
                        {/* Média móvel - Felicidade */}
                        <Line
                          type="monotone"
                          dataKey="media_felicidade"
                          name="Felicidade (média 3d)"
                          stroke="hsl(210, 70%, 50%)"
                          strokeWidth={3}
                          dot={false}
                        />
                        
                        {/* Trendline - Felicidade */}
                        <Line
                          type="monotone"
                          dataKey="trend_felicidade"
                          name="Tendência Felicidade"
                          stroke="hsl(210, 70%, 50%)"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gráfico de Correlação */}
              <TabsContent value="correlacao">
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      Análise de Correlação
                    </CardTitle>
                    <CardDescription>
                      Correlação entre humor e dor: {correlacao.toFixed(2)} 
                      {mostrarCorrelacao && " (Correlação forte detectada!)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mostrarCorrelacao ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={dadosComMedias} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                          <defs>
                            <linearGradient id="colorFelicidade" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(210, 70%, 50%)" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(210, 70%, 50%)" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorDor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(0, 70%, 50%)" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(0, 70%, 50%)" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis 
                            dataKey="data" 
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            domain={[0, 10]}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="nivel_felicidade" 
                            name="Felicidade"
                            stroke="hsl(210, 70%, 50%)" 
                            fillOpacity={1} 
                            fill="url(#colorFelicidade)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="nivel_dor" 
                            name="Dor"
                            stroke="hsl(0, 70%, 50%)" 
                            fillOpacity={1} 
                            fill="url(#colorDor)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <p className="text-lg mb-2">Correlação insuficiente</p>
                          <p className="text-sm">A correlação entre humor e dor não é forte o suficiente para análise visual.</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resumo Semanal */}
              <TabsContent value="semanal">
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                      Resumo Semanal
                    </CardTitle>
                    <CardDescription>
                      Média semanal de humor e dor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={dadosSemanais} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="semana" 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          domain={[0, 10]}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="media_felicidade" 
                          name="Felicidade" 
                          fill="hsl(210, 70%, 50%)" 
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar 
                          dataKey="media_dor" 
                          name="Dor" 
                          fill="hsl(0, 70%, 50%)" 
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Notas do Paciente */}
            {dadosGrafico.some(d => d.observacoes) && (
              <Card className="border-2 shadow-lg mt-8">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <StickyNote className="h-6 w-6 text-primary" />
                    Notas e Observações
                  </CardTitle>
                  <CardDescription>
                    Registros de observações do período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dadosFiltrados.filter(e => e.observacoes).map((estado) => (
                      <div key={estado.id} className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-sm">
                            {new Date(estado.data + 'T00:00:00').toLocaleDateString('pt-BR', { 
                              weekday: 'long', 
                              day: '2-digit', 
                              month: 'long' 
                            })}
                          </p>
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300">
                              Humor: {estado.humor.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-700 dark:text-red-300">
                              Dor: {estado.nivel_dor}/10
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{estado.observacoes}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {loading && (
          <div className="text-center text-muted-foreground text-xl mt-8">Carregando...</div>
        )}

        {!loading && estados.length === 0 && (
          <div className="text-center text-muted-foreground text-xl mt-8">
            Nenhum registro encontrado. Cadastre o primeiro estado do paciente acima.
          </div>
        )}
      </main>
    </div>
  );
};

export default EstadoPaciente;
