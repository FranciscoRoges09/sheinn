// Estado da aplicação
let transactionId = null
let checkInterval = null

// Elementos do DOM
const loadingEl = document.getElementById("loading")
const errorEl = document.getElementById("error")
const paymentEl = document.getElementById("payment")
const successEl = document.getElementById("success")
const amountEl = document.getElementById("amount")
const pixCodeEl = document.getElementById("pixCode")
const copyBtn = document.getElementById("copyBtn")

// Configuração do pagamento (pode ser alterado)
const PAYMENT_CONFIG = {
  amount: 2789, // R$ 27,89 em centavos
  displayAmount: "27,89",
}

// Função para mostrar estado
function showState(state) {
  loadingEl.classList.add("hidden")
  errorEl.classList.add("hidden")
  paymentEl.classList.add("hidden")
  successEl.classList.add("hidden")

  switch (state) {
    case "loading":
      loadingEl.classList.remove("hidden")
      break
    case "error":
      errorEl.classList.remove("hidden")
      break
    case "payment":
      paymentEl.classList.remove("hidden")
      break
    case "success":
      successEl.classList.remove("hidden")
      break
  }
}

// Função para mostrar erro
function showError(message) {
  const errorMessage = errorEl.querySelector(".error-message")
  errorMessage.textContent = message
  showState("error")
}

// Função para gerar PIX
async function gerarPix() {
  try {
    showState("loading")

    // Verifica se a API key está configurada
    if (!window.BUCKPAY_API_KEY) {
      throw new Error("API key não configurada. Verifique o arquivo config.js")
    }

    const externalId = `pix-${Date.now()}`

    const response = await fetch("https://api.realtechdev.com.br/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${window.BUCKPAY_API_KEY}`,
        "Content-Type": "application/json",
        "user-agent": "Buckpay API",
      },
      body: JSON.stringify({
        external_id: externalId,
        payment_method: "pix",
        amount: PAYMENT_CONFIG.amount,
        buyer: {
          name: "Cliente",
          email: "cliente@email.com",
          document: "00000000000",
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "Erro ao criar transação PIX")
    }

    const data = await response.json()

    if (!data.pix_code) {
      throw new Error("Código PIX não retornado pela API")
    }

    transactionId = externalId
    exibirQRCode(data.pix_code)
    iniciarVerificacao()
  } catch (error) {
    console.error("Erro ao gerar PIX:", error)
    showError(error.message)
  }
}

// Função para exibir QR Code
function exibirQRCode(pixCode) {
  // Atualiza o valor exibido
  amountEl.textContent = PAYMENT_CONFIG.displayAmount

  // Exibe o código PIX
  pixCodeEl.textContent = pixCode

  // Gera o QR Code
  const qrcodeContainer = document.getElementById("qrcode")
  qrcodeContainer.innerHTML = "" // Limpa QR Code anterior

  const QRCode = window.QRCode // Declare the QRCode variable
  QRCode.toCanvas(
    pixCode,
    {
      width: 250,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    },
    (error, canvas) => {
      if (error) {
        console.error("Erro ao gerar QR Code:", error)
        showError("Erro ao gerar QR Code")
        return
      }
      qrcodeContainer.appendChild(canvas)
    },
  )

  showState("payment")
}

// Função para copiar código PIX
function copiarCodigo() {
  const pixCode = pixCodeEl.textContent

  navigator.clipboard
    .writeText(pixCode)
    .then(() => {
      const originalText = copyBtn.textContent
      copyBtn.textContent = "Copiado!"
      setTimeout(() => {
        copyBtn.textContent = originalText
      }, 2000)
    })
    .catch((err) => {
      console.error("Erro ao copiar:", err)
      alert("Erro ao copiar código PIX")
    })
}

// Função para verificar pagamento
async function verificarPagamento() {
  try {
    if (!transactionId) return

    const response = await fetch(`https://api.realtechdev.com.br/v1/transactions/external_id/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${window.BUCKPAY_API_KEY}`,
        "user-agent": "Buckpay API",
      },
    })

    if (!response.ok) {
      // Se 404, a transação ainda não foi encontrada, continua verificando
      if (response.status === 404) return
      throw new Error("Erro ao verificar pagamento")
    }

    const data = await response.json()

    if (data.status === "paid" || data.status === "approved") {
      pararVerificacao()
      mostrarSucesso()
    }
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error)
  }
}

// Função para iniciar verificação periódica
function iniciarVerificacao() {
  checkInterval = setInterval(verificarPagamento, 5000) // Verifica a cada 5 segundos
}

// Função para parar verificação
function pararVerificacao() {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}

// Função para mostrar sucesso
function mostrarSucesso() {
  showState("success")
}

// Event Listeners
copyBtn.addEventListener("click", copiarCodigo)

// Inicializa ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
  gerarPix()
})

// Limpa o intervalo ao sair da página
window.addEventListener("beforeunload", () => {
  pararVerificacao()
})
