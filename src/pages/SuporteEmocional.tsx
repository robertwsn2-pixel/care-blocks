import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Heart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SuporteEmocional {
  id: string;
  tipo: string;
  conteudo: string;
  data: string;
}

const SuporteEmocional = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [registros, setRegistros] = useState<SuporteEmocional[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    tipo: "nota",
    conteudo: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadRegistros(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadRegistros(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadRegistros = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suporte_emocional")
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
      setRegistros(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.conteudo.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, escreva algo.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    const { error } = await supabase.from("suporte_emocional").insert({
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
        title: "Registro criado",
        description: "Seu registro foi salvo com sucesso!",
      });

      setFormData({
        tipo: "nota",
        conteudo: "",
      });

      loadRegistros(user.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("suporte_emocional")
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
        title: "Registro removido",
        description: "Registro removido com sucesso!",
      });
      loadRegistros(user.id);
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
              Suporte Emocional
            </h2>
            <p className="text-muted-foreground text-xl mt-2">
              Diário, reflexões e apoio
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
              Escreva seus pensamentos e sentimentos
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="tipo" className="text-lg font-semibold">
                  Tipo
                </Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nota">Nota</SelectItem>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="reflexao">Reflexão</SelectItem>
                    <SelectItem value="gratidao">Gratidão</SelectItem>
                    <SelectItem value="preocupacao">Preocupação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="conteudo" className="text-lg font-semibold">
                  Conteúdo *
                </Label>
                <Textarea
                  id="conteudo"
                  placeholder="Escreva aqui..."
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  className="text-lg min-h-[200px]"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="flex-1 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Salvar Registro
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

        {loading ? (
          <div className="text-center text-muted-foreground text-xl mt-8">Carregando...</div>
        ) : registros.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Seus Registros</h3>
            <div className="grid gap-4">
              {registros.map((registro) => (
                <Card key={registro.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Heart className="h-8 w-8 text-primary mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-xl font-semibold text-foreground">
                                {new Date(registro.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                              </h4>
                              <span className="inline-block mt-1 px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">
                                {registro.tipo}
                              </span>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-lg mt-2 whitespace-pre-wrap">
                            {registro.conteudo}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(registro.id)}
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
            Nenhum registro encontrado.
          </div>
        )}
      </main>
    </div>
  );
};

export default SuporteEmocional;