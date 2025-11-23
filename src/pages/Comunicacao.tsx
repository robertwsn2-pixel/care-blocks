import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Phone, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface Contato {
  id: string;
  nome: string;
  telefone: string;
  relacao: string;
  favorito: boolean;
}

const Comunicacao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    relacao: "",
    favorito: false,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadContatos(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadContatos(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadContatos = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contatos")
      .select("*")
      .eq("user_id", userId)
      .order("favorito", { ascending: false })
      .order("nome", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar contatos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setContatos(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome e telefone.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    const { error } = await supabase.from("contatos").insert({
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
        title: "Contato cadastrado",
        description: `${formData.nome} adicionado com sucesso!`,
      });

      setFormData({
        nome: "",
        telefone: "",
        relacao: "",
        favorito: false,
      });

      loadContatos(user.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("contatos")
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
        title: "Contato removido",
        description: "Contato removido com sucesso!",
      });
      loadContatos(user.id);
    }
  };

  const handleCall = (telefone: string) => {
    window.location.href = `tel:${telefone}`;
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
              Comunicação
            </h2>
            <p className="text-muted-foreground text-xl mt-2">
              Contatos de emergência e importantes
            </p>
          </div>
        </div>

        <Card className="max-w-3xl mx-auto border-3 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Plus className="h-8 w-8 text-primary" />
              Adicionar Contato
            </CardTitle>
            <CardDescription className="text-lg">
              Preencha os dados do contato
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="nome" className="text-lg font-semibold">
                  Nome *
                </Label>
                <Input
                  id="nome"
                  placeholder="Ex: Dr. João Silva"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="telefone" className="text-lg font-semibold">
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  placeholder="Ex: (11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="relacao" className="text-lg font-semibold">
                  Relação
                </Label>
                <Input
                  id="relacao"
                  placeholder="Ex: Médico, Familiar, Emergência"
                  value={formData.relacao}
                  onChange={(e) => setFormData({ ...formData, relacao: e.target.value })}
                  className="h-14 text-lg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorito"
                  checked={formData.favorito}
                  onCheckedChange={(checked) => setFormData({ ...formData, favorito: checked as boolean })}
                />
                <Label htmlFor="favorito" className="text-lg cursor-pointer">
                  Marcar como favorito
                </Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="flex-1 text-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Cadastrar Contato
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
        ) : contatos.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Contatos Cadastrados</h3>
            <div className="grid gap-4">
              {contatos.map((contato) => (
                <Card key={contato.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {contato.favorito && <Star className="h-6 w-6 text-yellow-500 fill-yellow-500 mt-1" />}
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-foreground">{contato.nome}</h4>
                          <p className="text-muted-foreground text-lg mt-1">
                            <strong>Telefone:</strong> {contato.telefone}
                          </p>
                          {contato.relacao && (
                            <p className="text-muted-foreground text-lg">
                              <strong>Relação:</strong> {contato.relacao}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="icon"
                          onClick={() => handleCall(contato.telefone)}
                        >
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(contato.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-xl mt-8">
            Nenhum contato cadastrado ainda.
          </div>
        )}
      </main>
    </div>
  );
};

export default Comunicacao;