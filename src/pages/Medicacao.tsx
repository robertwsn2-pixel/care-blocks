import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Medicacao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    medicamento: "",
    quantidade: "",
    horario: "",
    dia: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medicamento || !formData.quantidade || !formData.horario || !formData.dia) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

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

        {/* Formulário de cadastro */}
        <Card className="max-w-3xl mx-auto border-3 shadow-xl">
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
      </main>
    </div>
  );
};

export default Medicacao;
