import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK_URL = "https://carlosqbarbosa.app.n8n.cloud/webhook/b6fdba24-ba52-4afc-8a37-eb3d7f01bff1/chat";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendMessage",
        sessionId: sessionId || "default",
        chatInput: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n retornou status ${response.status}`);
    }

    const data = await response.json();
    const text =
      data?.output ||
      data?.text ||
      data?.message ||
      data?.response ||
      (Array.isArray(data) && (data[0]?.output || data[0]?.text)) ||
      "Sem resposta do agente.";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Erro ao chamar n8n:", error);
    return NextResponse.json(
      { error: "Erro ao conectar com o agente. Verifique se o fluxo n8n está ativo." },
      { status: 500 }
    );
  }
}