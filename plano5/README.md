# PIX Payment System - Vercel Ready

Sistema de pagamento PIX integrado com BuckPay API, 100% compatível com Vercel.

## 🚀 Estrutura do Projeto

\`\`\`
pixpayment6/
├── app/
│   ├── api/                    # Serverless Functions (Vercel)
│   │   ├── create-pix/
│   │   │   └── route.ts       # POST /api/create-pix
│   │   └── check-payment/
│   │       └── route.ts       # GET /api/check-payment
│   ├── page.tsx               # Frontend principal
│   ├── layout.tsx             # Layout raiz
│   └── globals.css            # Estilos globais
├── components/                 # Componentes React
├── public/                     # Arquivos estáticos
│   └── shein-logo.png         # Logo
├── package.json               # Dependências
├── vercel.json                # Configuração Vercel
└── README.md                  # Este arquivo
\`\`\`

## 📋 Funcionalidades

- ✅ Geração automática de QR Code PIX
- ✅ Verificação automática de pagamento (polling a cada 5s)
- ✅ Interface responsiva e moderna
- ✅ Integração com BuckPay API
- ✅ 100% Serverless (Vercel Functions)
- ✅ TypeScript + Next.js 15

## 🔧 Configuração

### 1. Variáveis de Ambiente

Você precisa configurar a chave da API BuckPay:

**Na Vercel:**
1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione: `BUCKPAY_API_KEY` com sua chave da API

**Localmente (.env.local):**
\`\`\`bash
BUCKPAY_API_KEY=sua_chave_aqui
\`\`\`

### 2. Instalação Local

\`\`\`bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
\`\`\`

Acesse: http://localhost:3000

## 🌐 Deploy na Vercel

### Método 1: Via GitHub (Recomendado)

1. **Criar repositório no GitHub:**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/seu-repo.git
   git push -u origin main
   \`\`\`

2. **Conectar na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em **"Add New Project"**
   - Importe seu repositório do GitHub
   - Configure a variável `BUCKPAY_API_KEY`
   - Clique em **"Deploy"**

### Método 2: Via Vercel CLI

\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
\`\`\`

### Método 3: Arrastar e Soltar

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Arraste a pasta do projeto
3. Configure `BUCKPAY_API_KEY`
4. Deploy!

## 🔌 API Endpoints

### POST /api/create-pix

Cria uma nova transação PIX.

**Request:**
\`\`\`json
{
  "external_id": "pix-1234567890",
  "payment_method": "pix",
  "amount": 2789,
  "buyer": {
    "name": "Cliente Automático",
    "email": "cliente@example.com"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "data": {
    "status": "pending",
    "pix": {
      "code": "00020126580014br.gov.bcb.pix...",
      "qrcode_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  }
}
\`\`\`

### GET /api/check-payment?external_id=pix-123

Verifica o status de um pagamento.

**Response:**
\`\`\`json
{
  "data": {
    "status": "paid"
  }
}
\`\`\`

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização
- **Vercel Functions** - Serverless backend
- **BuckPay API** - Processamento PIX

## 📱 Como Funciona

1. **Página carrega** → Gera automaticamente um PIX de R$ 27,89
2. **QR Code exibido** → Cliente escaneia com app do banco
3. **Polling ativo** → Verifica pagamento a cada 5 segundos
4. **Pagamento confirmado** → Exibe tela de sucesso

## 🔒 Segurança

- ✅ API Key armazenada em variáveis de ambiente
- ✅ Nunca exposta no frontend
- ✅ Todas as chamadas autenticadas
- ✅ HTTPS obrigatório na Vercel

## 📞 Suporte

Para problemas com a API BuckPay, consulte a documentação oficial em:
https://api.realtechdev.com.br/docs

## 📄 Licença

MIT License - Livre para uso comercial e pessoal.
