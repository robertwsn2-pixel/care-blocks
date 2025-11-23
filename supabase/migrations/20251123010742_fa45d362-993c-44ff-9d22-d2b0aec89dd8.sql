-- Create medicacoes table
CREATE TABLE public.medicacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicamento TEXT NOT NULL,
  quantidade TEXT NOT NULL,
  horario TIME NOT NULL,
  dia DATE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rotina_eventos table
CREATE TABLE public.rotina_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  horario TIME,
  tipo TEXT NOT NULL DEFAULT 'afazer',
  concluido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contatos table
CREATE TABLE public.contatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  relacao TEXT,
  favorito BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create estado_paciente table
CREATE TABLE public.estado_paciente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  humor TEXT,
  nivel_dor INTEGER CHECK (nivel_dor >= 0 AND nivel_dor <= 10),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suporte_emocional table
CREATE TABLE public.suporte_emocional (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'nota',
  conteudo TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotina_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estado_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suporte_emocional ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medicacoes
CREATE POLICY "Users can view their own medicacoes" 
ON public.medicacoes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medicacoes" 
ON public.medicacoes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medicacoes" 
ON public.medicacoes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medicacoes" 
ON public.medicacoes FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for rotina_eventos
CREATE POLICY "Users can view their own rotina_eventos" 
ON public.rotina_eventos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rotina_eventos" 
ON public.rotina_eventos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rotina_eventos" 
ON public.rotina_eventos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rotina_eventos" 
ON public.rotina_eventos FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for contatos
CREATE POLICY "Users can view their own contatos" 
ON public.contatos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contatos" 
ON public.contatos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contatos" 
ON public.contatos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contatos" 
ON public.contatos FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for estado_paciente
CREATE POLICY "Users can view their own estado_paciente" 
ON public.estado_paciente FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own estado_paciente" 
ON public.estado_paciente FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estado_paciente" 
ON public.estado_paciente FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estado_paciente" 
ON public.estado_paciente FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for suporte_emocional
CREATE POLICY "Users can view their own suporte_emocional" 
ON public.suporte_emocional FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own suporte_emocional" 
ON public.suporte_emocional FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suporte_emocional" 
ON public.suporte_emocional FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suporte_emocional" 
ON public.suporte_emocional FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_medicacoes_updated_at
BEFORE UPDATE ON public.medicacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rotina_eventos_updated_at
BEFORE UPDATE ON public.rotina_eventos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contatos_updated_at
BEFORE UPDATE ON public.contatos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estado_paciente_updated_at
BEFORE UPDATE ON public.estado_paciente
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suporte_emocional_updated_at
BEFORE UPDATE ON public.suporte_emocional
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();