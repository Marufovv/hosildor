# Hosilink

Hosilink — Farg‘ona uchun agro-marketplace, hosil taqsimoti va fermer maslahatchisi platformasi. Loyihaning Vinext/React interfeysi Cloudflare Worker, D1, R2 va Drizzle bilan ishlaydi.

## Asosiy funksiyalar

- Uch rolga yaqinlashtirilgan ishchi ko‘rinish: fermer, xaridor va operator.
- Hosil Radar: deterministik talab prognozi, lot muddati xavfi va tasdiqlanadigan tavsiyalar.
- Fermer uchun “Hosil maslahatchisi”: parvarish, sug‘orish, kimyoviy vosita ma’lumoti va vaziyat simulyatsiyasi.
- Barg va hosil rasmini rasm haqidagi xato sifat bilan tekshirish; yuklash Cloudflare R2 orqali.
- Oldindan bron, doimiy xarid ro‘yxati va operator tasdiqlagan chegirma belgisi.
- Append-only ledger, integer UZS/gramm, workspace versiyasi va idempotency kalitlari.

## Ishga tushirish

```bash
npm ci
npm run dev
```

Sayt odatda `http://127.0.0.1:5173` manzilida ochiladi. Lokal hisob: `/signin-with-chatgpt?return_to=/`.

```bash
npm run build
npm run lint
node --test tests/domain.test.mjs
```

## Muhim environment sozlamalari

| Nomi | Tavsif |
|---|---|
| `DB` | Cloudflare D1 binding |
| `BUCKET` | Cloudflare R2 binding |
| `ANTHROPIC_API_KEY` | Server-side Anthropic API kaliti. Xavfsizlik uchun faqat secret sifatida saqlang; `.env`, kod yoki GitHub’ga yozmang. |

Claude ishlatilmasa AI endpoint lokal demo qoidasi bilan ishlaydi. Haqiqiy Claude chaqiruvida server tomonidan matn uchun `claude-haiku-4-5-20251001`, murakkab rasm tahlili uchun deploymentdagi tasdiqlangan Sonnet model identifikatori ishlatiladi.

## Migratsiyalar

```bash
npx wrangler d1 migrations apply hosildor-db --local
```

Migrationlar `drizzle/` papkasida saqlanadi.

## AI xavfsizliklari

- API kaliti faqat serverda ishlatiladi.
- `userId` sessiyadan olinadi; foydalanuvchi modeli ishiga berilmaydi.
- AI ledger, inventory, narx yoki tavsiya holatini o‘zgartirmaydi.
- Javoblar zod bilan tekshiriladi.
- Kasallik “tashxis” emas, faqat ehtimoliy sabablar sifatida ko‘rsatiladi.
- Aniq dozaviy, konsentratsiya va aralashma retsepti berilmaydi.
- Rasm sifatini tekshiradi va noaniqlikda qayta suratga olishni so‘raydi.
- Har javobda agronom va mahsulot yorlig‘ini o‘qish ogohlantirishi bor.

## Arxitektura

- `app/domain.ts`: atomik idempotent domain transitionlar.
- `app/ui.tsx`: responsive React ishchi ko‘rinishlari.
- `app/api/advisor/route.ts`: server-side agro-maslahatchi.
- `app/api/crop-image/route.ts`: R2 rasm yuklash va sifat tekshiruvi.
- `lib/agronomy.ts`: demo kimyoviy vositalar va xavfsiz qoidalar.
- `lib/radar.ts`: Hosil Radar statistik moduli.
- `worker/index.ts`: Worker va kunlik Cron radar.
