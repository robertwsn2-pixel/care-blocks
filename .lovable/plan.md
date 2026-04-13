

## Plano de Correção: Problemas do AlzheimerCare

### Diagnóstico Confirmado

Após análise do banco de dados e código:

1. **Cards com valores hardcoded** (CONFIRMADO): Linhas 174 e 190 de `Index.tsx` -- `pendingCount: 2` em Medicação e `pendingCount: 5` em Comunicação estao fixos no codigo, ignorando os dados reais
2. **Dashboard com contadores zerados** (ESPERADO): As 4 medicacoes no banco tem datas antigas (2025-11-24, 2025-11-27, etc.) e `ativo: false`. Nenhum dado para hoje, entao os contadores estao corretos em mostrar 0
3. **Chat funcional mas basico**: O sistema de chat ja existe e funciona com a tabela `mensagens`, porem sem realtime
4. **Autenticacao**: Funcionando normalmente (token refresh com sucesso nos logs)

### Mudancas Planejadas

#### 1. Remover valores hardcoded dos cards (Index.tsx)

Substituir `pendingCount` fixo nos cards por dados dinamicos:
- **Medicacao**: usar contagem real de medicacoes pendentes do dia (`ativo: true`)
- **Rotina & Calendario**: usar contagem de eventos pendentes do dia (`concluido: false`)
- **Comunicacao**: usar `mensagensNaoLidas` do state
- **Demais cards**: manter `pendingCount: 0`

Ajustar o `status` dos cards dinamicamente baseado na contagem real.

#### 2. Adicionar realtime ao chat (Comunicacao.tsx)

Adicionar subscription de realtime na tabela `mensagens` filtrada pelo `contato_id` selecionado, para que novas mensagens aparecam automaticamente sem reload.

#### 3. Reescrever README.md

Criar README completo com:
- Descricao do projeto AlzheimerCare
- Funcionalidades principais
- Stack tecnologica
- Instrucoes de uso

### Detalhes Tecnicos

**Index.tsx - Cards dinamicos:**
```
dashboardCards sera refatorado para usar os states tarefasCompletas, pendencias, mensagensNaoLidas 
ao inves de valores fixos nos pendingCount
```

**Comunicacao.tsx - Realtime:**
```
useEffect com supabase.channel('chat-realtime')
  .on('postgres_changes', { event: 'INSERT', table: 'mensagens' })
  para recarregar mensagens automaticamente
```

