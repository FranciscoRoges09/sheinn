import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.BUCKPAY_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "API key não configurada. Adicione BUCKPAY_API_KEY nas variáveis de ambiente do seu projeto na Vercel.",
        },
        { status: 500 },
      )
    }

    const body = await request.json()

    const response = await fetch("https://api.realtechdev.com.br/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "user-agent": "Buckpay API",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json(
          {
            error: "⚠️ Erro de autenticação com a API. Verifique a chave ou ambiente.",
            details: data,
          },
          { status: 403 },
        )
      }
      return NextResponse.json(
        {
          error: "Erro inesperado, tente novamente.",
          details: data,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error creating PIX:", error)
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}
