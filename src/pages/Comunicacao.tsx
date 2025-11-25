import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Phone, Star, MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Contato {
  id: string;
  nome: string;
  telefone: string;
  relacao: string;
  favorito: boolean;
}

interface Mensagem {
  id: string;
  mensagem: string;
  enviado_por: 'usuario' | 'contato';
  lida: boolean;
  created_at: string;
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
  const [contatoSelecionado, setContatoSelecionado] = useState<Contato | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const abrirChat = async (contato: Contato) => {
    setContatoSelecionado(contato);
    await loadMensagens(contato.id);
  };

  const loadMensagens = async (contatoId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .eq("user_id", user.id)
      .eq("contato_id", contatoId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMensagens((data || []) as Mensagem[]);
      // Marcar mensagens como lidas
      await supabase
        .from("mensagens")
        .update({ lida: true })
        .eq("user_id", user.id)
        .eq("contato_id", contatoId)
        .eq("enviado_por", "contato")
        .eq("lida", false);

      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaMensagem.trim() || !contatoSelecionado || !user) return;

    const { error } = await supabase.from("mensagens").insert({
      user_id: user.id,
      contato_id: contatoSelecionado.id,
      mensagem: novaMensagem.trim(),
      enviado_por: "usuario",
      lida: false,
    });

    if (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNovaMensagem("");
      await loadMensagens(contatoSelecionado.id);
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
            onClick={() => {
              setContatoSelecionado(null);
              navigate("/");
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Button>
          
          <div>
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              {contatoSelecionado ? `Chat com ${contatoSelecionado.nome}` : "Comunicação"}
            </h2>
            <p className="text-muted-foreground text-xl mt-2">
              {contatoSelecionado ? contatoSelecionado.telefone : "Contatos e chat"}
            </p>
          </div>
        </div>

        {contatoSelecionado ? (
          <div className="max-w-4xl mx-auto">
            <Card className="border-3 shadow-xl h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{contatoSelecionado.nome}</CardTitle>
                    <CardDescription className="text-lg">{contatoSelecionado.telefone}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setContatoSelecionado(null)}
                  >
                    Fechar Chat
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-6 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {mensagens.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        Nenhuma mensagem ainda. Inicie a conversa!
                      </div>
                    ) : (
                      mensagens.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.enviado_por === 'usuario' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              msg.enviado_por === 'usuario'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="text-base break-words">{msg.mensagem}</p>
                            <p className={`text-xs mt-1 ${
                              msg.enviado_por === 'usuario' 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                
                <form onSubmit={enviarMensagem} className="mt-4 flex gap-2">
                  <Input
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 h-12 text-lg"
                  />
                  <Button type="submit" size="lg" className="gap-2">
                    <Send className="h-5 w-5" />
                    Enviar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
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
                              onClick={() => abrirChat(contato)}
                              title="Abrir chat"
                            >
                              <MessageCircle className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleCall(contato.telefone)}
                              title="Ligar"
                            >
                              <Phone className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(contato.id)}
                              title="Excluir"
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
          </>
        )}
      </main>
    </div>
  );
};

export default Comunicacao;