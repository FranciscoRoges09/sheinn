"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface PixData {
  code: string
  qrcode_base64: string
}

interface TransactionData {
  status: string
  pix?: PixData
}

export default function AutomaticPixPayment() {
  const [transaction, setTransaction] = useState<TransactionData | null>(null)
  const [externalId, setExternalId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [isPaid, setIsPaid] = useState(false)

  // Generate PIX payment automatically on page load
  useEffect(() => {
    gerarPix()
  }, [])

  // Start polling when we have an external ID
  useEffect(() => {
    if (externalId && !isPaid) {
      const interval = setInterval(() => {
        verificarPagamento()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [externalId, isPaid])

  async function gerarPix() {
    try {
      setLoading(true)
      const extId = `pix-${Date.now()}`
      setExternalId(extId)

      const response = await fetch("/api/create-pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_id: extId,
          payment_method: "pix",
          amount: 3987,
          buyer: {
            name: "Cliente Automático",
            email: "cliente@example.com",
          },
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setTransaction(data.data)
      }
    } catch (err) {
      setError("Erro ao gerar pagamento PIX")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function verificarPagamento() {
    try {
      const response = await fetch(`/api/check-payment?external_id=${externalId}`)
      const data = await response.json()

      if (data.data?.status === "paid") {
        setIsPaid(true)
        mostrarSucesso()
      }
    } catch (err) {
      console.error("Erro ao verificar pagamento:", err)
    }
  }

  function mostrarSucesso() {
    setTransaction(null)
  }

  function copiarCodigo() {
    if (transaction?.pix?.code) {
      navigator.clipboard.writeText(transaction.pix.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-medium">Gerando pagamento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-lg">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-black mb-2">Erro ao gerar pagamento</h2>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          {error.includes("API key") && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Como configurar:</strong>
              </p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Clique em "Vars" na barra lateral esquerda</li>
                <li>Adicione uma nova variável: BUCKPAY_API_KEY</li>
                <li>Cole sua chave da API BuckPay</li>
                <li>Recarregue a página</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 animate-in fade-in duration-500">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">Pagamento confirmado!</h1>
          <p className="text-gray-600 text-lg">Obrigado pela sua compra.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full animate-in fade-in duration-500">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/shein-logo.png" alt="SHEIN" width={200} height={60} className="object-contain" priority />
        </div>

        {/* Payment Instructions */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">Escaneie o QR Code abaixo</h1>
          <p className="text-gray-600">
            para concluir seu pagamento de <span className="font-bold text-black">R$39,87</span>
          </p>
        </div>

        {/* QR Code */}
        {transaction?.pix?.qrcode_base64 && (
          <div className="bg-white border-2 border-black rounded-lg p-6 mb-6">
            <div className="flex justify-center">
              <Image
                src={`data:image/png;base64,${transaction.pix.qrcode_base64}`}
                alt="QR Code PIX"
                width={280}
                height={280}
                className="w-full max-w-[280px] h-auto"
              />
            </div>
          </div>
        )}

        {/* PIX Code */}
        {transaction?.pix?.code && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">Código PIX</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={transaction.pix.code}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-black rounded-lg text-sm font-mono bg-gray-50 text-black"
              />
              <button
                onClick={copiarCodigo}
                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        {/* Footer Notice */}
        <div className="text-center">
          <p className="text-sm text-gray-500">O pagamento é processado automaticamente. Aguarde a confirmação.</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
            <p className="text-xs text-gray-400">Verificando pagamento...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
