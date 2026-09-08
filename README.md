# Barbearia - Sistema de Agendamento

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?logo=csharp&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-512BD4?logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-512BD4?logo=dotnet&logoColor=white)
![Entity Framework Core](https://img.shields.io/badge/Entity_Framework_Core-512BD4?logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-000000?logo=render&logoColor=white)

Aplicação Full Stack para **agendamento e gerenciamento de horários em barbearias**, desenvolvida com React e ASP.NET Core, com persistência de dados em PostgreSQL.

O sistema permite que clientes consultem serviços e horários disponíveis e realizem agendamentos pelo celular, enquanto o barbeiro possui um painel administrativo para acompanhar a agenda, confirmar atendimentos, bloquear horários e gerenciar os serviços oferecidos.

## Funcionalidades

### Agendamento

- consulta dos serviços disponíveis;
- seleção de data e horário;
- exibição apenas de horários disponíveis;
- cadastro dos dados do cliente;
- validação de conflitos entre agendamentos;
- confirmação do agendamento;
- integração com WhatsApp.

### Painel Administrativo

- visualização da agenda por data;
- acompanhamento dos agendamentos;
- consulta dos dados do cliente e serviço;
- confirmação de atendimentos;
- cancelamento de agendamentos;
- acesso rápido ao WhatsApp do cliente;
- atualização automática da agenda.

### Gerenciamento de Serviços

- cadastro de serviços;
- edição de serviços;
- definição de preço e duração;
- ativação e desativação de serviços.

### Controle de Horários

- definição dos horários de funcionamento;
- cálculo dos horários disponíveis de acordo com a duração do serviço;
- bloqueio de períodos específicos da agenda;
- prevenção de sobreposição de agendamentos;
- bloqueio de datas e horários já encerrados.

## Tecnologias

### Frontend

- React
- JavaScript
- Vite
- CSS3

### Backend

- C#
- ASP.NET Core Web API
- Entity Framework Core
- API REST

### Banco de Dados

- PostgreSQL
- Supabase

### Deploy

- Vercel
- Render
- Supabase

## Arquitetura

O projeto está dividido entre frontend e backend:

```text
Barbearia/
├── Barbearia.Api/     # API ASP.NET Core
├── barbearia-web/     # Aplicação React
└── Barbearia.slnx
