import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { imageDiagnosis } from "../../../lib/agronomy";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File)) return Response.json({ error: "Rasm tanlanmagan." }, { status: 400 });
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return Response.json({ error: "Faqat JPEG, PNG yoki WebP rasm qabul qilinadi." }, { status: 415 });
    if (file.size < 100 || file.size > 8 * 1024 * 1024) return Response.json({ error: "Rasm hajmi 100 KB dan 8 MB gacha bo‘lishi kerak." }, { status: 413 });
    if (!env.BUCKET) return Response.json({ error: "Rasm ombori hozir ulanmagan.", result: imageDiagnosis(file.name, file.size) }, { status: 503 });
    const bytes = await file.arrayBuffer();
    const key = `crop-images/${user.userId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: file.type }, customMetadata: { ownerId: user.userId } });
    return Response.json({ key, label: "AI tavsiyasi · demo ma'lumot", result: imageDiagnosis(file.name, file.size) });
  } catch {
    return Response.json({ error: "Rasmni yuklab bo‘lmadi." }, { status: 500 });
  }
}
