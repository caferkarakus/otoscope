/*
  KANSER EVRELEME VERİSİ (AJCC 8. Baskı - Baş ve Boyun)
  -------------------------------------------------------
  T/N/M kriterleri ve evre gruplama tablosu AJCC Cancer Staging Manual,
  8. Baskı (Oral Cavity formu) referans alınarak doğrulanmıştır.

  ÖNEMLİ: Tedavi özeti NCCN Head and Neck Cancers kılavuzunun (Cancer of
  the Oral Cavity, OR-1/OR-2/OR-3 sayfaları) genel karar mantığını KENDİ
  CÜMLELERİMİZLE özetler — NCCN'in tescilli akış şemasının birebir kopyası
  DEĞİLDİR. Gerçek klinik karar için her zaman güncel NCCN kılavuzuna ve
  multidisipliner konsey değerlendirmesine başvurulmalıdır.

  Yeni bir alt bölge eklemek için STAGING_SITES dizisine aynı formatta
  (computeT, computeN, computeM, stageGroup, treatmentBySt alanlarını
  içeren) bir blok ekleyin.
*/

const STAGING_DISCLAIMER =
  "Bu bir eğitim materyalidir, gerçek klinik karar için güncel kılavuzlar ile multidisipliner konsey değerlendirmesi gereklidir.";

const STAGING_SITES = [
  {
    id: "oral-kavite",
    order: 1,
    title: "Oral Kavite",
    summary:
      "Dudak, dil (ön 2/3), diş eti, ağız tabanı, sert damak, retromolar trigon ve bukkal mukozayı kapsar. T evrelemesi tümör boyutu ve invazyon derinliğine (DOI), N evrelemesi ise çoğu baş-boyun bölgesiyle ortak olan 'genel' sisteme dayanır.",

    tInfo: [
      { code: "Tis", label: "Tis", desc: "Karsinoma in situ" },
      { code: "T1", label: "T1", desc: "Boyut ≤2 cm ve DOI ≤5 mm" },
      { code: "T2", label: "T2", desc: "Boyut ≤2 cm ve DOI >5 mm; VEYA boyut 2-4 cm ve DOI ≤10 mm" },
      { code: "T3", label: "T3", desc: "Boyut 2-4 cm ve DOI >10 mm; VEYA boyut >4 cm ve DOI ≤10 mm" },
      { code: "T4a", label: "T4a", desc: "Boyut >4 cm ve DOI >10 mm; VEYA mandibula/maksilla kortikal kemik, maksiller sinüs ya da yüz derisi invazyonu" },
      { code: "T4b", label: "T4b", desc: "Çiğneme boşluğu, pterigoid plaklar, kafa tabanı invazyonu veya karotis ensirklasyonu" }
    ],
    computeT(input) {
      if (input.tis) return "Tis";
      if (input.invasion === "t4b") return "T4b";
      if (input.invasion === "t4a") return "T4a";
      const size = Number(input.size) || 0;
      const doi = Number(input.doi) || 0;
      if (size > 4 && doi > 10) return "T4a";
      if ((size > 2 && size <= 4 && doi > 10) || (size > 4 && doi <= 10)) return "T3";
      if (size <= 2 && doi <= 5) return "T1";
      if ((size <= 2 && doi > 5) || (size > 2 && size <= 4 && doi <= 10)) return "T2";
      return "T3";
    },

    nInfo: [
      { code: "N0", desc: "Bölgesel lenf nodu metastazı yok" },
      { code: "N1", desc: "Tek ipsilateral nod, ≤3 cm, ENE(-)" },
      { code: "N2a", desc: "Tek ipsilateral nod, 3-6 cm, ENE(-)" },
      { code: "N2b", desc: "Birden fazla ipsilateral nod, hiçbiri >6 cm, ENE(-)" },
      { code: "N2c", desc: "Bilateral veya kontralateral nod(lar), hiçbiri >6 cm, ENE(-)" },
      { code: "N3a", desc: "Nod >6 cm, ENE(-)" },
      { code: "N3b", desc: "Klinik olarak belirgin ekstranodal yayılım (ENE) olan herhangi bir nod" }
    ],
    computeN(input) {
      if (!input.hasNodes) return "N0";
      if (input.ene) return "N3b";
      const size = Number(input.nodeSize) || 0;
      if (size > 6) return "N3a";
      if (input.laterality === "bilateral") return "N2c";
      if (input.laterality === "multiple-ipsi") return "N2b";
      if (size > 3) return "N2a";
      return "N1";
    },

    computeM(input) {
      return input.metastasis ? "M1" : "M0";
    },

    stageGroup(T, N, M) {
      if (M === "M1") return "IVC";
      if (N === "N3a" || N === "N3b") return "IVB";
      if (T === "T4b") return "IVB";
      if (N === "N2a" || N === "N2b" || N === "N2c") return "IVA";
      if (T === "T4a") return "IVA";
      if (T === "T3" || N === "N1") return "III";
      if (T === "T2") return "II";
      if (T === "T1") return "I";
      if (T === "Tis") return "0";
      return "—";
    },

    treatmentBySt: {
      "0": "Karsinom in situ: genellikle geniş lokal eksizyon yeterlidir. Yakın takip önerilir.",
      "I": "T1N0: Tercih edilen yaklaşım cerrahi rezeksiyondur (tümör lokalizasyonu ve DOI'ye göre ± boyun diseksiyonu); definitif radyoterapi alternatif olarak değerlendirilebilir. Cerrahi sonrası pozitif nod ve olumsuz patolojik özellik (pozitif/yakın cerrahi sınır, perinöral/lenfovasküler invazyon vb.) yoksa ek tedaviye gerek yoktur.",
      "II": "T2N0: Tercih edilen yaklaşım yine cerrahi rezeksiyondur; definitif radyoterapi alternatiftir. Tek pozitif nod (başka olumsuz özellik olmadan) saptanırsa radyoterapi değerlendirilir; pozitif cerrahi sınır veya ekstranodal yayılım gibi yüksek riskli bulgu varsa re-rezeksiyon ve/veya eş zamanlı sistemik tedavi + radyoterapi gerekebilir.",
      "III": "T3N0 veya T1-3,N1: Tercih edilen yaklaşım cerrahi rezeksiyon + boyun diseksiyonudur. Ameliyat sonrası ekstranodal yayılım ve/veya pozitif cerrahi sınır varsa eş zamanlı sistemik tedavi + radyoterapi; sadece pozitif cerrahi sınır varsa mümkünse re-rezeksiyon; diğer risk faktörlerinde (pT3/T4, perinöral/lenfovasküler invazyon vb.) radyoterapi veya sistemik tedavi + radyoterapi değerlendirilir.",
      "IVA": "T4a (herhangi N) veya N2 (herhangi T): Tercih edilen yaklaşım yine cerrahi rezeksiyon + boyun diseksiyonudur (N2c/bilateral tutulumda bilateral diseksiyon). Cerrahiyi kabul etmeyen veya cerrahiye uygun olmayan hastalarda 'çok ileri evre' yaklaşımı (tanımlı eş zamanlı sistemik tedavi + radyoterapi) değerlendirilir. Adjuvan tedavi kararı Evre III'teki gibi patolojik risk özelliklerine göre belirlenir.",
      "IVB": "T4b (herhangi N) veya N3 (herhangi T): Genellikle cerrahi rezeksiyon uygun değildir; tanımlı eş zamanlı sistemik tedavi + radyoterapi öncelikli yaklaşımdır. Multidisipliner konsey değerlendirmesi esastır.",
      "IVC": "Uzak metastaz mevcut: Sistemik tedavi (kemoterapi ve/veya immünoterapi) genellikle palyatif amaçlı uygulanır; lokal semptom kontrolü için palyatif radyoterapi ve destek/palyatif bakım eklenir."
    }
  }
];
