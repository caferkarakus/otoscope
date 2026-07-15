/*
  VAKA SUNUMLARI VERİSİ
  ----------------------
  Yeni bir vaka eklemek için listeye aynı formatta bir blok ekleyin.

  Alanlar:
    id          -> benzersiz kısa kod
    title       -> vaka başlığı
    category    -> etiket (örn: "Otoloji", "Rinoloji", "BBC")
    image       -> (opsiyonel) vakayla ilgili görsel dosya yolu
    presentation-> hastanın başvuru şikayeti/öyküsü
    examination -> muayene bulguları
    discussion  -> tartışma / öğrenme noktaları (madde madde)
    diagnosis   -> nihai tanı
*/

const CASES = [
  {
    id: "case-1",
    title: "Ani İşitme Kaybı ile Başvuran Hasta",
    category: "Otoloji",
    image: "assets/images/icons/hearing-loss.svg",
    presentation: "45 yaşında erkek hasta, 2 gün önce fark ettiği sağ kulakta ani işitme azlığı ve çınlama şikayetiyle başvurdu. Vertigo tanımlamıyor.",
    examination: "Otoskopik muayene doğal. Weber testi sol kulağa lateralize, Rinne testi her iki kulakta pozitif (sensörinöral paterni düşündürüyor).",
    diagnosis: "Ani İşitme Kaybı (Sudden Sensorineural Hearing Loss)",
    discussion: [
      "Ani işitme kaybı bir otolojik acildir; tanı ve tedavide gecikme prognozu kötüleştirir.",
      "Odyometrik değerlendirme ile en az 3 ardışık frekansta 30 dB'lik sensörinöral kayıp tanı için tipiktir.",
      "İlk basamak tedavi genellikle sistemik veya intratimpanik kortikosteroiddir.",
      "Etyolojide viral, vasküler ve otoimmün nedenler düşünülür; çoğu olgu idiyopatiktir."
    ]
  },
  {
    id: "case-2",
    title: "Tekrarlayan Epistaksis",
    category: "Rinoloji",
    image: "assets/images/icons/epistaxis.svg",
    presentation: "68 yaşında, hipertansiyon tanılı kadın hasta, son 1 haftada 3 kez tekrarlayan burun kanaması nedeniyle acile başvurdu.",
    examination: "Anterior rinoskopide Little alanında (Kiesselbach pleksusu) belirgin damarlanma ve kanama odağı izlendi. Kan basıncı yüksek ölçüldü.",
    diagnosis: "Anterior Epistaksis (Hipertansiyona sekonder)",
    discussion: [
      "Epistaksislerin büyük çoğunluğu (~%90) Little alanından, anterior kaynaklıdır.",
      "Kontrolsüz hipertansiyon kanamayı tetikleyen ve şiddetlendiren önemli bir faktördür.",
      "İlk basamak yönetim: burun kanadına 10-15 dakika kesintisiz kompresyon ve kan basıncı kontrolü.",
      "Tekrarlayan/kontrolsüz olgularda kimyasal veya elektrokoter ile koterizasyon düşünülür."
    ]
  }
];
