# MedPlan - Controle de Plantões Médicos

MedPlan é uma aplicação web responsiva para médicos gerenciarem seus plantões, acompanharem previsões de pagamento por hospital e monitorarem recebimentos, com visão em calendário e dashboards mensais/histórico.

## Funcionalidades

### MVP (V1)
- **Onboarding**: cadastro de Hospitais (nome, CNPJ opcional, prazo de pagamento em dias, dia de corte opcional)
- **Registro de Plantão**: data, início/fim ou turno, hospital, valor bruto, observações (opcional)
- **Status de Plantão/Pagamento**: Lançado → Previsto → Recebido → Conciliado
- **Calendário mensal** com marcadores de plantões e previsões de pagamento
- **Dashboard mensal**: total de plantões, total previsto a receber, total recebido, atrasos
- **Histórico**: filtro por período/hospital, tabela detalhada, exportação CSV
- **Conta**: perfil básico, troca de senha, sair

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: Shadcn UI
- **Formulários**: React Hook Form, Zod
- **Datas**: date-fns

## Estrutura do Projeto

```
medplan/
├── src/
│   ├── app/                    # Rotas da aplicação (Next.js App Router)
│   │   ├── auth/               # Páginas de autenticação
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── hospitais/          # Gerenciamento de hospitais
│   │   ├── plantoes/           # Gerenciamento de plantões
│   │   ├── calendario/         # Visualização de calendário
│   │   ├── historico/          # Histórico e relatórios
│   │   └── perfil/             # Perfil do usuário
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Componentes de UI base
│   │   ├── layout/             # Componentes de layout
│   │   ├── hospitais/          # Componentes específicos de hospitais
│   │   └── plantoes/           # Componentes específicos de plantões
│   ├── contexts/               # Contextos React
│   └── lib/                    # Utilitários e configurações
└── public/                     # Arquivos estáticos
```

## Modelo de Dados

### Hospitais
- id (UUID)
- user_id (UUID)
- nome (text)
- cnpj (text, opcional)
- prazo_pagamento_dias (integer)
- dia_corte (integer)
- created_at (timestamp)

### Plantões
- id (UUID)
- user_id (UUID)
- hospital_id (UUID)
- data (date)
- inicio (time, opcional)
- fim (time, opcional)
- turno (text, opcional)
- valor_bruto (numeric)
- observacoes (text, opcional)
- status (enum: LANCADO, PREVISTO, RECEBIDO, CONCILIADO)
- previsao_pagamento (date)
- created_at (timestamp)

### Recebimentos
- id (UUID)
- user_id (UUID)
- plantao_id (UUID)
- valor_recebido (numeric)
- recebido_em (date)
- conciliado (boolean)
- conciliado_em (timestamp, opcional)
- comprovante_url (text, opcional)
- created_at (timestamp)

## Instalação e Execução

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/medplan.git
cd medplan
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

5. Acesse a aplicação em `http://localhost:3000`

## Próximos Passos (V1.1 e V2)

### V1.1 (Qualidade de vida)
- Upload de comprovante (PDF/Imagem) ao marcar como recebido
- Notificações por e-mail/WhatsApp n dias antes da previsão
- Duplicar plantão e lançamentos recorrentes (templates)

### V2 (Integrações & Pro)
- Multi-usuário (secretária lança; médico aprova)
- Integração com Looker Studio (conector simples/CSV programático)
- Exportação iCal de previsões para calendário pessoal
- API pública (token por médico) para integrações de terceiros