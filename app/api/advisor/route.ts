import { env } from "cloudflare:workers";
import { z } from "zod";
import { getChatGPTUser } from "../../chatgpt-auth";
import { AGRONOMY_WARNING, careAdvice, CHEMICALS_DEMO } from "../../../lib/agronomy";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  mode: z.enum(["care", "chemical", "scenario"]),
  crop: z.string().trim().min(2).max(80),
  soil: z.string().trim().max(120).default(""),
  weather: z.string().trim().max(120).default(""),
  season: z.string().trim().max(40).default("Joriy mavsum"),
  chemical: z.string().trim().max(100).default(""),
  text: z.string().trim().max(1200).default(""),
});

function anthropicResult(system: string, prompt: string) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  }).then(async response => {
    if (!response.ok) throw new Error("AI service unavailable");
    const data = await response.json() as { content?: Array<{ type: string; text?: string }> };
    return data.content?.filter(item => item.type === "text").map(item => item.text ?? "").join("\n") ?? "";
  });
}

export async function POST(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Ma'lumotlar noto‘g‘ri yoki juda uzun." }, { status: 400 });
    const input = parsed.data;
    const instruction =
      "Faqat ehtimoliy sabab de. Tashxis qo'yma. Aniq dozage, konsentratsiya yoki aralashma retsepti bermagin. Ehtiyot, PE va waiting period haqida umumiy gapir. Har javob oxirida quyidagi ogohlantirishni aynan yoz.";

    let content = "";
    if (input.mode === "care") {
      content = careAdvice(input.crop, input.soil, input.weather, input.season).summary;
    } else if (input.mode === "chemical") {
      const demo = CHEMICALS_DEMO.find(item => item.name.toLowerCase().includes(input.chemical.toLowerCase()) || !input.chemical) ?? CHEMICALS_DEMO[0];
      content = `${demo.name}\nMa’qsad: ${demo.purpose}\nKutish muddati: ${demo.waitingDays}\nHimoya: ${demo.protection}\nAtrof-muhit va asalarilar: ${demo.environment}\nHolat: ${demo.status}`;
    } else {
      content = `${input.chemical || "Tanlangan vosita"} uchun ehtimoliy ta’sir ko‘rsatildi: buzilish xavfi kamayishi, lekin noto‘g‘ri qo‘llashdan zaharlanish, kuyish, asalarilar taqirlanishi va fitotoksiklik xavfi qoladi. Aniq doza yoki aralashma berilmaydi.`;
    }

    try {
      const generated = await anthropicResult(`${instruction}\n${AGRONOMY_WARNING}`, `${input.mode}: ${input.crop}. ${input.text} Demo holat: ${content}`);
      if (generated) content = generated;
    } catch {
      content = content;
    }

    return Response.json({
      recommendation: content,
      label: "AI tavsiyasi · demo ma'lumot",
      warning: AGRONOMY_WARNING,
      model: env.ANTHROPIC_API_KEY ? "server-side Claude" : "lokal demo qoidasi",
      disclaimerDose: true,
    });
  } catch {
    return Response.json({ error: "Maslahatni hozir yaratib bo‘lmadi." }, { status: 500 });
  }
}
