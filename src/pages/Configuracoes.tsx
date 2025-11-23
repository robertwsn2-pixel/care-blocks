import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Configuracoes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/auth");
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
              Configurações
            </h2>
            <p className="text-muted-foreground text-xl mt-2">
              Gerencie sua conta e preferências
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-3 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <User className="h-8 w-8 text-primary" />
                Informações da Conta
              </CardTitle>
              <CardDescription className="text-lg">
                Seus dados pessoais
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-lg">
                  <strong>Email:</strong> {user?.email}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-lg">
                  <strong>ID do Usuário:</strong> {user?.id}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-3 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Settings className="h-8 w-8 text-primary" />
                Preferências
              </CardTitle>
              <CardDescription className="text-lg">
                Personalize sua experiência
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-muted-foreground text-lg">
                Use o botão de tema no cabeçalho para alternar entre modo claro e escuro.
              </p>
            </CardContent>
          </Card>

          <Card className="border-3 shadow-xl border-destructive/50">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <LogOut className="h-8 w-8 text-destructive" />
                Sair da Conta
              </CardTitle>
              <CardDescription className="text-lg">
                Desconectar do aplicativo
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleLogout}
                className="text-lg"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sair
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Configuracoes;