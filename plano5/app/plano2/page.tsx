"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Plano2Page() {
  const [pixData, setPixData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isPaid, setIsPaid] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    gerarPix()
  }, [])

  useEffect(() => {
    if (pixData?.external_id && !isPaid) {
      const interval = setInterval(() => {
        verificarPagamento(pixData.external_id)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [pixData, isPaid])

  const gerarPix = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_id: `pix-${Date.now()}`,
          payment_method: "pix",
          amount: 3987, // R$39,87
          buyer: {
            name: "Cliente",
            email: "cliente@email.com",
            document: "00000000000",
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar transação PIX")
      }

      const data = await response.json()
      setPixData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const verificarPagamento = async (externalId: string) => {
    try {
      const response = await fetch(`/api/check-payment?external_id=${externalId}`)

      if (!response.ok) return

      const data = await response.json()

      if (data.status === "paid" || data.status === "approved") {
        setIsPaid(true)
      }
    } catch (err) {
      console.error("Erro ao verificar pagamento:", err)
    }
  }

  const copiarCodigo = () => {
    if (pixData?.pix_code) {
      navigator.clipboard.writeText(pixData.pix_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isPaid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Pagamento confirmado!</h1>
          <p className="text-muted-foreground">Obrigado pela sua compra.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center mb-8">
          <Image src="/shein-logo.png" alt="SHEIN" width={200} height={60} className="object-contain" priority />
        </div>

        {loading && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
            <p className="text-muted-foreground">Gerando pagamento PIX...</p>
          </div>
        )}

        {error && (
          <div className="text-center space-y-4">
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={gerarPix} variant="outline">
              Tentar novamente
            </Button>
          </div>
        )}

        {pixData && !loading && !error && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Plano 2 - R$39,87</h1>
              <p className="text-muted-foreground">Escaneie o QR Code ou copie o código PIX</p>
            </div>

            <div className="bg-white p-6 rounded-lg flex justify-center">
              {pixData.qr_code_url && (
                <Image
                  src={pixData.qr_code_url || "/placeholder.svg"}
                  alt="QR Code PIX"
                  width={250}
                  height={250}
                  className="rounded"
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Código PIX (Copia e Cola)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pixData.pix_code || ""}
                  readOnly
                  className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono"
                />
                <Button onClick={copiarCodigo} size="icon" variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {copied && <p className="text-sm text-green-600">Código copiado!</p>}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Aguardando confirmação do pagamento...</p>
              <div className="flex justify-center mt-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
