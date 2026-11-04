export const AGRONOMY_WARNING =
  "Bu umumiy ma'lumot. Qaror qabul qilishdan oldin agronom bilan maslahatlashing va mahsulot yorlig'ini o'qing.";

export const CHEMICALS_DEMO = [
  {
    name: "Umumiy fungitsid tipi",
    purpose: "Zamburug‘li kasalliklarning ko‘plab belgilari uchun",
    waitingDays: "Mahsulot yorlig‘ida ko‘rsatiladi",
    protection: "Qalin himoya kiyimi, respirator, ko‘z himoyasi, qo‘lqop va shamollatish",
    environment: "Qishloqdagi suv havzalariga, asalari iniga yaqin hududga tushmasin",
    status: "Demo yozuv. O‘zbekiston qonunchilik holatini mahalliy agronomdan tekshiring.",
  },
  {
    name: "Umumiy insektitsid tipi",
    purpose: "Zararkunandalarning ayrim guruhlari uchun",
    waitingDays: "Mahsulot yorlig‘ida ko‘rsatiladi",
    protection: "Qo‘lqop, himoya kostyumi, ko‘z va nafas yo‘lini himoya qilish",
    environment: "Uchish va gullash vaqtida asalari ta’sirini kamaytirish uchun qo‘llanmaga amal qiling",
    status: "Demo yozuv. O‘zbekiston qonunchilik holatini mahalliy agronomdan tekshiring.",
  },
] as const;

export function careAdvice(crop: string, soil: string, weather: string, season: string) {
  const isHot = /issiq|quruq|hot/i.test(weather);
  const isHeavy = /og‘ir|loym|heavy|nam/i.test(soil);
  return {
    crop,
    title: `${crop} uchun umumiy parvarish`,
    summary: `${season} mavsumida ildiz zonasini mo‘’tadil namlikda saqlang. ${isHot ? "Issiq va quruq ob-havoda ertalab yoki kechqurun sug‘oring." : "Ob-havo ko‘rsatkichiga qarab sug‘orish oralig‘ini belgilang."}`,
    irrigation: isHot
      ? "Yuzaki namlikni tekshiring; ertalab yoki quyosh botgandan keyin sekin sug‘oring."
      : "Tuproqning 5–10 sm qatlamini tekshirib, yetarli namlik bo‘lmasa sug‘oring.",
    soil: isHeavy
      ? "Og‘ir tuproqni haddan tashqari nam tutmang; drenaj va organik modda holatini tekshiring."
      : "Tuproqni to‘g‘ri aeratsiya qiling va kamida sug‘orishdan oldin namlikni tekshiring.",
    warning: AGRONOMY_WARNING,
    label: "AI tavsiyasi · demo ma'lumot",
  };
}

export function imageDiagnosis(fileName: string, size: number) {
  const blurred = size < 40_000;
  if (blurred) return {
    quality: "past",
    candidates: [],
    message: "Rasm sifati yetarli emas. Bargni yorug‘ joyda, yaqin va fokusda qayta suratga oling.",
    warning: AGRONOMY_WARNING,
    label: "AI tavsiyasi · demo ma'lumot",
  };
  return {
    quality: "tekshirishga yaroqli",
    candidates: [
      { name: "Bargdog‘ holati ehtimoli", confidence: "o'rta", difference: "Dog‘lar va to‘q to‘qimalar alomatlarini boshqa kasalliklardan yoki kuyishdan ajratish kerak." },
      { name: "Zararkunanda shikastlanishi ehtimoli", confidence: "past", difference: "Hasar yo‘qligi, tuxumlar va zararkunandaning o‘zini yaqin suratdan tekshiring." },
      { name: "Ozuqa yoki suv stressi ehtimoli", confidence: "o'rta", difference: "Simptomning butun barg bo‘ylab taqsimoti va tuproq namligini tekshiring." },
    ],
    fileName,
    warning: AGRONOMY_WARNING,
    label: "AI tavsiyasi · demo ma'lumot",
  };
}
