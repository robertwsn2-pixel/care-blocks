-- Create table for chat messages
CREATE TABLE public.mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contato_id UUID NOT NULL REFERENCES public.contatos(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  enviado_por TEXT NOT NULL CHECK (enviado_por IN ('usuario', 'contato')),
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own mensagens" 
ON public.mensagens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mensagens" 
ON public.mensagens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mensagens" 
ON public.mensagens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mensagens" 
ON public.mensagens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mensagens_updated_at
BEFORE UPDATE ON public.mensagens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();