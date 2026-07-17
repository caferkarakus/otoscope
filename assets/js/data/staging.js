/*
  KANSER EVRELEME VERİSİ (AJCC 8. Baskı - Baş ve Boyun)
  -------------------------------------------------------
  T/N/M kriterleri ve evre gruplama tabloları AJCC Cancer Staging Manual,
  8. Baskı'nın resmi form dokümanından (Oral Cavity, Major Salivary Glands,
  Nasopharynx, HPV-Mediated Oropharyngeal Cancer, Oropharynx (p16-) and
  Hypopharynx, Nasal Cavity and Paranasal Sinuses, Larynx bölümleri)
  doğrulanarak alınmıştır.

  ÖNEMLİ: Tedavi özetleri NCCN Head and Neck Cancers kılavuzunun (v2.2026)
  ilgili algoritma sayfalarının genel karar mantığını KENDİ CÜMLELERİMİZLE
  özetler — NCCN'in tescilli akış şemasının birebir kopyası DEĞİLDİR.
  Gerçek klinik karar için her zaman güncel NCCN kılavuzuna ve
  multidisipliner konsey değerlendirmesine başvurulmalıdır.

  HESAPLAYICI MANTIĞI
  --------------------
  Kullanıcı T ve N kategorisini, gösterilen AJCC kriterlerini okuyarak
  DOĞRUDAN seçer (ölçüm girip otomatik hesaplama yapılmaz) — bu hem daha
  az hataya açıktır hem de klinik pratikteki kullanım şeklini yansıtır.
  M kategorisi Var/Yok olarak seçilir. Evre ve tedavi özeti bu üç seçime
  göre anında hesaplanır.

  PAYLAŞILAN SİSTEM
  ------------------
  Oral Kavite, Büyük Tükürük Bezleri, Orofarenks (p16-), Hipofarenks,
  Maksiller Sinüs, Nazal Kavite/Etmoid Sinüs ve Larinks'in üç alt bölgesi
  (Glottik, Supraglottik, Subglottik) TAMAMEN AYNI N kategorisi
  kriterlerini ve aynı evre gruplama desenini kullanır (AJCC formunda
  doğrulanmıştır) — sadece T kriterleri alan bazında değişir.
  Nazofarenks ve Orofarenks (p16+) kendi özel N sistemine ve evre
  gruplama tablosuna sahiptir.

  Yeni bir alt bölge eklemek için STAGING_SITES dizisine aynı formatta
  bir blok ekleyin.
*/

const STAGING_DISCLAIMER =
  "Bu bir eğitim materyalidir. Gerçek klinik karar için güncel kılavuzlar ile multidisipliner değerlendirme ve uzman görüşü gereklidir.";

/* ---------- Paylaşılan (genel) N / Evre sistemi ---------- */

const SHARED_N_INFO_CLINICAL = [
  { code: "N0", desc: "Bölgesel lenf nodu metastazı yok" },
  { code: "N1", desc: "Tek ipsilateral nod, ≤3 cm, ENE(-)" },
  { code: "N2a", desc: "Tek ipsilateral nod, 3-6 cm, ENE(-)" },
  { code: "N2b", desc: "Birden fazla ipsilateral nod, hiçbiri >6 cm, ENE(-)" },
  { code: "N2c", desc: "Bilateral veya kontralateral nod(lar), hiçbiri >6 cm, ENE(-)" },
  { code: "N3a", desc: "Nod >6 cm, ENE(-)" },
  { code: "N3b", desc: "Klinik olarak belirgin ekstranodal yayılım (ENE) olan herhangi bir nod" }
];

const SHARED_N_INFO_PATHOLOGICAL = [
  { code: "N0", desc: "Bölgesel lenf nodu metastazı yok" },
  { code: "N1", desc: "Tek ipsilateral nod, ≤3 cm, ENE(-)" },
  { code: "N2a", desc: "Tek ipsilateral nod ≤3 cm ile ENE(+); VEYA 3-6 cm ile ENE(-)" },
  { code: "N2b", desc: "Birden fazla ipsilateral nod, hiçbiri >6 cm, ENE(-)" },
  { code: "N2c", desc: "Bilateral veya kontralateral nod(lar), hiçbiri >6 cm, ENE(-)" },
  { code: "N3a", desc: "Nod >6 cm, ENE(-)" },
  { code: "N3b", desc: "Tek ipsilateral nod >3 cm ile ENE(+); VEYA birden fazla nod (herhangi biri ENE+); VEYA herhangi boyutta kontralateral nod ile ENE(+)" }
];

// Bu desen, "paylaşılan sistem" kullanan tüm alt bölgeler için AJCC formunda
// birebir aynıdır (Tis/T1-T4b × N0-N3/M1 → Evre 0-IVC).
function sharedStageGroup(T, N, M) {
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
}

const SHARED_TREATMENT_TEMPLATE = {
  "0": "Karsinom in situ: genellikle lokal eksizyon yeterlidir. Yakın takip önerilir.",
  "I": "T1N0: Tek modalite tedavi — cerrahi rezeksiyon (± boyun diseksiyonu) veya definitif radyoterapi. Ek risk faktörü yoksa adjuvan tedaviye gerek yoktur.",
  "II": "T2N0: Tek modalite tedavi devam eder (cerrahi tercih edilir). Tek pozitif nod saptanırsa radyoterapi değerlendirilir; pozitif cerrahi sınır/ekstranodal yayılım varsa re-rezeksiyon ve/veya eş zamanlı sistemik tedavi + radyoterapi gerekebilir.",
  "III": "T3N0 veya T1-3,N1: Cerrahi rezeksiyon + boyun diseksiyonu, ardından risk faktörlerine göre adjuvan radyoterapi veya eş zamanlı sistemik tedavi + radyoterapi (ekstranodal yayılım/pozitif cerrahi sınırda kategori 1).",
  "IVA": "T4a veya N2: Yine cerrahi rezeksiyon + boyun diseksiyonu tercih edilir; cerrahiye uygun olmayan hastalarda tanımlı eş zamanlı sistemik tedavi + radyoterapi değerlendirilir.",
  "IVB": "T4b veya N3: Genellikle rezeksiyon uygun değildir; tanımlı eş zamanlı sistemik tedavi + radyoterapi öncelikli yaklaşımdır. Multidisipliner konsey esastır.",
  "IVC": "Uzak metastaz: Sistemik tedavi genellikle palyatif amaçlı uygulanır; palyatif radyoterapi ve destek bakım eklenir."
};

/* ---------- Alt bölgeler ---------- */

const STAGING_SITES = [
  {
    id: "oral-kavite",
    order: 1,
    chapter: "7",
    title: "Oral Kavite",
    summary: "Dudak, dil (ön 2/3), diş eti, ağız tabanı, sert damak, retromolar trigon ve bukkal mukozayı kapsar.",
    tInfo: [
      { code: "Tis", desc: "Karsinoma in situ" },
      { code: "T1", desc: "Boyut ≤2 cm ve invazyon derinliği (DOI) ≤5 mm" },
      { code: "T2", desc: "Boyut ≤2 cm ve DOI >5 mm; VEYA boyut 2-4 cm ve DOI ≤10 mm" },
      { code: "T3", desc: "Boyut 2-4 cm ve DOI >10 mm; VEYA boyut >4 cm ve DOI ≤10 mm" },
      { code: "T4a", desc: "Boyut >4 cm ve DOI >10 mm; VEYA mandibula/maksilla kortikal kemik, maksiller sinüs ya da yüz derisi invazyonu" },
      { code: "T4b", desc: "Çiğneme boşluğu, pterigoid plaklar, kafa tabanı invazyonu veya karotis ensirklasyonu" }
    ],
    nSystem: "shared",
    stageGroup: sharedStageGroup,
    treatmentBySt: SHARED_TREATMENT_TEMPLATE
  },

  {
    id: "buyuk-tukuruk-bezi",
    order: 2,
    chapter: "8",
    title: "Büyük Tükürük Bezleri",
    summary: "Parotis, submandibular ve sublingual bezleri kapsar.",
    tInfo: [
      { code: "T1", desc: "Boyut ≤2 cm, ekstraparankimal yayılım yok" },
      { code: "T2", desc: "Boyut 2-4 cm, ekstraparankimal yayılım yok" },
      { code: "T3", desc: "Boyut >4 cm VE/VEYA ekstraparankimal yayılım (klinik/makroskopik yumuşak doku invazyonu) var" },
      { code: "T4a", desc: "Deri, mandibula, kulak kanalı ve/veya fasiyal sinir invazyonu" },
      { code: "T4b", desc: "Kafa tabanı ve/veya pterigoid plaklar invazyonu, veya karotis ensirklasyonu" }
    ],
    nSystem: "shared",
    stageGroup: sharedStageGroup,
    treatmentBySt: {
      "I": "T1N0: Cerrahi rezeksiyon (parotidektomi/ilgili bez eksizyonu) tercih edilir. Ek risk faktörü yoksa adjuvan tedaviye gerek yoktur.",
      "II": "T2N0: Cerrahi rezeksiyon tercih edilir; yüksek dereceli histoloji, perinöral invazyon gibi risk faktörleri varsa adjuvan radyoterapi değerlendirilir.",
      "III": "T3N0 veya T1-3,N1: Cerrahi rezeksiyon + boyun diseksiyonu, ardından yüksek riskli özelliklere göre adjuvan radyoterapi veya eş zamanlı sistemik tedavi + radyoterapi.",
      "IVA": "T4a veya N2: Cerrahi rezeksiyon (± fasiyal sinir korunması/rekonstrüksiyonu) + boyun diseksiyonu, ardından patolojik risk faktörlerine göre adjuvan tedavi.",
      "IVB": "T4b veya N3: Genellikle rezeksiyon uygun değildir; tanımlı eş zamanlı sistemik tedavi + radyoterapi ve multidisipliner konsey değerlendirmesi önerilir.",
      "IVC": "Uzak metastaz: Sistemik tedavi palyatif amaçlı uygulanır; palyatif radyoterapi ve destek bakım eklenir."
    }
  },

  {
    id: "nazofarenks",
    order: 3,
    chapter: "9",
    title: "Nazofarenks",
    summary:
      "N evrelemesi diğer baş-boyun bölgelerinden tamamen farklıdır (retrofaringeal/servikal lenf nodu tutulumuna ve krikoid alt sınırına göre); tedavi cerrahi değil, radyoterapi/kemoradyoterapi eksenlidir. cN/pN ayrımı bu bölgede kullanılmaz.",
    tInfo: [
      { code: "T0", desc: "Tümör saptanamıyor ama EBV(+) servikal nod tutulumu var" },
      { code: "Tis", desc: "Tümör in situ" },
      { code: "T1", desc: "Nazofarenkse sınırlı, veya parafaringeal tutulum olmadan orofarinks/nazal kaviteye uzanım" },
      { code: "T2", desc: "Parafaringeal boşluk ve/veya komşu yumuşak doku tutulumu (pterigoid kaslar, prevertebral kaslar)" },
      { code: "T3", desc: "Kafa tabanı, servikal vertebra, pterigoid yapılar ve/veya paranazal sinüslerde kemik infiltrasyonu" },
      { code: "T4", desc: "İntrakraniyal yayılım, kraniyal sinir, hipofarinks, orbita, parotis tutulumu ve/veya lateral pterigoid kasın lateral yüzeyini aşan yaygın yumuşak doku infiltrasyonu" }
    ],
    nSystem: "custom",
    noPathologicalToggle: true,
    nInfoClinical: [
      { code: "N0", desc: "Bölgesel lenf nodu metastazı yok" },
      { code: "N1", desc: "Unilateral servikal nod(lar) ve/veya uni-bilateral retrofaringeal nod(lar), ≤6 cm, krikoid alt sınırının üzerinde" },
      { code: "N2", desc: "Bilateral servikal nod(lar), ≤6 cm, krikoid alt sınırının üzerinde" },
      { code: "N3", desc: "Servikal nod(lar) >6 cm VE/VEYA krikoid alt sınırının altına uzanım" }
    ],
    stageGroup(T, N, M) {
      if (M === "M1") return "IVB";
      if (N === "N3" || T === "T4") return "IVA";
      if (T === "T3" || N === "N2") return "III";
      if ((T === "T1" || T === "T0") && N === "N1") return "II";
      if (T === "T2" && (N === "N0" || N === "N1")) return "II";
      if (T === "T1" && N === "N0") return "I";
      if (T === "Tis" && N === "N0") return "0";
      return "—";
    },
    treatmentBySt: {
      "0": "Tis: Yakın izlem/lokal tedavi değerlendirilir; nazofarenks kanserinde bu evre nadirdir.",
      "I": "T1N0: Tek modalite — definitif radyoterapi. Bu bölgede cerrahinin primer tedavideki rolü sınırlıdır.",
      "II": "T2N0 veya T1-2,N1: Definitif radyoterapi ± eş zamanlı sistemik tedavi (bulky tümör veya yüksek EBV DNA yükü gibi yüksek riskli özellikler varsa).",
      "III": "T3N0-2 veya T1-2,N2: Eş zamanlı sistemik tedavi + radyoterapi (kategori 1); seçilmiş hastalarda indüksiyon kemoterapisi ardından eş zamanlı tedavi tercih edilen yaklaşımdır.",
      "IVA": "T4 (herhangi N) veya N3 (herhangi T): Eş zamanlı sistemik tedavi + radyoterapi; yüksek riskli özelliklerde indüksiyon veya adjuvan kemoterapi değerlendirilir.",
      "IVB": "Uzak metastaz: Sistemik tedavi (EBV ilişkili hastalıkta kemoterapi ± immünoterapi) uygulanır; seçilmiş oligometastatik olgularda lokal tedaviler değerlendirilebilir."
    }
  },

  {
    id: "orofarenks-p16-negatif",
    order: 4,
    chapter: "11.1",
    title: "Orofarenks (p16-negatif)",
    summary: "Dil kökü, tonsil, yumuşak damak ve posterior faringeal duvarı kapsar. p16/HPV negatif veya test edilmemiş tümörler için geçerlidir.",
    tInfo: [
      { code: "Tis", desc: "Karsinoma in situ" },
      { code: "T1", desc: "Boyut ≤2 cm" },
      { code: "T2", desc: "Boyut 2-4 cm" },
      { code: "T3", desc: "Boyut >4 cm VEYA epiglotun lingual yüzeyine uzanım" },
      { code: "T4a", desc: "Larinks, dil dış kası, medial pterigoid, sert damak veya mandibula invazyonu" },
      { code: "T4b", desc: "Lateral pterigoid kas, pterigoid plaklar, lateral nazofarinks, kafa tabanı invazyonu veya karotis ensirklasyonu" }
    ],
    nSystem: "shared",
    stageGroup: sharedStageGroup,
    treatmentBySt: {
      "0": "Karsinom in situ: lokal eksizyon ve yakın takip.",
      "I": "T1N0: Tek modalite — transoral cerrahi rezeksiyon + boyun diseksiyonu VEYA definitif radyoterapi.",
      "II": "T2N0: Tek modalite tedavi (cerrahi veya definitif radyoterapi) devam eder; pN0 ve olumsuz patolojik özellik yoksa ek tedavi gerekmez.",
      "III": "T3N0-1 veya T1-2,N1: Cerrahi + boyun diseksiyonu (± bilateral, orta hat yakını/dil kökü tümörlerinde), ardından risk faktörlerine göre adjuvan radyoterapi veya eş zamanlı sistemik tedavi + radyoterapi. Alternatif olarak eş zamanlı sistemik tedavi + radyoterapi.",
      "IVA": "T4a veya N2: Cerrahi + boyun diseksiyonu VEYA eş zamanlı sistemik tedavi + radyoterapi; adjuvan tedavi ekstranodal yayılım/pozitif cerrahi sınır durumuna göre yoğunlaştırılır.",
      "IVB": "T4b veya N3: Genellikle rezeksiyon uygun değildir; tanımlı eş zamanlı sistemik tedavi + radyoterapi öncelikli yaklaşımdır.",
      "IVC": "Uzak metastaz: Sistemik tedavi palyatif amaçlı uygulanır."
    }
  },

  {
    id: "orofarenks-p16-pozitif",
    order: 5,
    chapter: "10",
    title: "Orofarenks (p16/HPV-pozitif)",
    summary:
      "HPV ilişkili orofarenks kanseri, AJCC 8. baskıda tamamen ayrı bir evreleme sistemi kullanır (N kategorisi nod sayısı/lateraliteye dayanır; klinik ve patolojik evre grupları BİRBİRİNDEN FARKLIDIR). Prognozu p16-negatif hastalığa göre belirgin olarak daha iyidir.",
    tInfo: [
      { code: "T0", desc: "Primer tümör saptanamıyor" },
      { code: "T1", desc: "Boyut ≤2 cm" },
      { code: "T2", desc: "Boyut 2-4 cm" },
      { code: "T3", desc: "Boyut >4 cm VEYA epiglotun lingual yüzeyine uzanım" },
      { code: "T4", desc: "Larinks, dil dış kası, medial pterigoid, sert damak veya mandibula (ya da ötesi) invazyonu" }
    ],
    nSystem: "custom",
    nInfoClinical: [
      { code: "N0", desc: "Bölgesel lenf nodu metastazı yok" },
      { code: "N1", desc: "Bir veya daha fazla ipsilateral nod, hiçbiri >6 cm" },
      { code: "N2", desc: "Kontralateral veya bilateral nod(lar), hiçbiri >6 cm" },
      { code: "N3", desc: "Nod(lar) >6 cm" }
    ],
    nInfoPathological: [
      { code: "N0", desc: "Bölgesel lenf nodu metastazı yok" },
      { code: "N1", desc: "≤4 lenf nodunda metastaz" },
      { code: "N2", desc: ">4 lenf nodunda metastaz" }
    ],
    stageGroupClinical(T, N, M) {
      if (M === "M1") return "IV";
      if (N === "N3") return "III";
      if (T === "T4") return "III";
      if (T === "T3") return "II";
      if (N === "N2") return "II";
      return "I";
    },
    stageGroupPathological(T, N, M) {
      if (M === "M1") return "IV";
      if (N === "N2") return "III";
      if (T === "T3" || T === "T4") return "II";
      return "I";
    },
    treatmentBySt: {
      "I": "Evre I: Tek modalite tedavi önceliklidir — transoral cerrahi rezeksiyon + boyun diseksiyonu VEYA definitif radyoterapi. Olumsuz patolojik özellik yoksa ek tedavi gerekmez.",
      "II": "Evre II: Cerrahi veya definitif radyoterapi devam eder; adjuvan tedavi ihtiyacı patolojik risk faktörlerine (ekstranodal yayılım, pozitif/yakın cerrahi sınır, çoklu pozitif nod) göre belirlenir.",
      "III": "Evre III: Eş zamanlı sistemik tedavi + radyoterapi VEYA cerrahi + boyun diseksiyonu (ardından risk faktörlerine göre adjuvan tedavi) tercih edilen yaklaşımlardır.",
      "IV": "Evre IV (uzak metastaz dahil): M0 hastalıkta eş zamanlı sistemik tedavi + radyoterapi öncelikli yaklaşımdır; uzak metastazda sistemik tedavi palyatif amaçlı uygulanır."
    }
  },

  {
    id: "hipofarenks",
    order: 6,
    chapter: "11.2",
    title: "Hipofarenks",
    summary: "Piriform sinüs, postkrikoid alan ve posterior faringeal duvarı kapsar.",
    tInfo: [
      { code: "Tis", desc: "Karsinoma in situ" },
      { code: "T1", desc: "Hipofarenksin tek bir alt bölgesiyle sınırlı ve/veya boyut ≤2 cm" },
      { code: "T2", desc: "Birden fazla alt bölge veya komşu bölge tutulumu, veya hemilarinks fiksasyonu olmadan boyut 2-4 cm" },
      { code: "T3", desc: "Boyut >4 cm VEYA hemilarinks fiksasyonu VEYA özofagus mukozasına uzanım" },
      { code: "T4a", desc: "Tiroid/krikoid kıkırdak, hyoid kemik, tiroid bezi, özofagus kası veya santral kompartman invazyonu" },
      { code: "T4b", desc: "Prevertebral fasya invazyonu, karotis ensirklasyonu veya mediastinal yapı tutulumu" }
    ],
    nSystem: "shared",
    stageGroup: sharedStageGroup,
    treatmentBySt: {
      "0": "Karsinom in situ: lokal tedavi ve yakın takip.",
      "I": "T1N0: Çoğunlukla larinks-koruyucu (konservasyon) cerrahi (açık/endoskopik parsiyel farengektomi) ± boyun diseksiyonu VEYA definitif radyoterapi.",
      "II": "Seçilmiş T2N0 olguları: Larinks-koruyucu yaklaşım devam edebilir; pN0 ve olumsuz özellik yoksa ek tedaviye gerek yoktur, tek pozitif nod varsa radyoterapi değerlendirilir.",
      "III": "T2-3 (total/parsiyel larenjektomi gerektiren) veya T1,N+: Cerrahi (parsiyel/total farengolarenjektomi + boyun diseksiyonu) VEYA indüksiyon kemoterapisi ile organ koruma denenebilir; adjuvan tedavi patolojik risk faktörlerine göre belirlenir.",
      "IVA": "T4a veya N2: Multimodal tedavi (cerrahi + adjuvan radyoterapi/kemoradyoterapi, veya tanımlı eş zamanlı kemoradyoterapi) değerlendirilir.",
      "IVB": "T4b veya N3: Genellikle rezeksiyon uygun değildir; tanımlı eş zamanlı sistemik tedavi + radyoterapi ve multidisipliner konsey değerlendirmesi önceliklidir.",
      "IVC": "Uzak metastaz: Sistemik tedavi palyatif amaçlı uygulanır."
    }
  },

  {
    id: "maksiller-sinus",
    order: 7,
    chapter: "12.1",
    title: "Paranazal Sinüsler — Maksiller Sinüs",
    summary:
      "Maksiller sinüs tümörleri histopatolojik olarak çeşitlidir (skuamöz hücreli karsinom, adenokarsinom, tükürük bezi tümörleri, estezionöroblastom, undiferansiye karsinom); tedavi kararında histoloji, evre kadar belirleyicidir.",
    tInfo: [
      { code: "Tis", desc: "Karsinoma in situ" },
      { code: "T1", desc: "Maksiller sinüs mukozasıyla sınırlı, kemik erozyonu/destrüksiyonu yok" },
      { code: "T2", desc: "Kemik erozyonu/destrüksiyonu (sert damak ve/veya orta nazal meatus dahil), posterior duvar ve pterigoid plaklar hariç" },
      { code: "T3", desc: "Maksiller sinüs posterior duvarı, subkutan doku, orbita tabanı/medial duvarı, pterigoid fossa veya etmoid sinüs invazyonu" },
      { code: "T4a", desc: "Anterior orbita içeriği, yanak derisi, pterigoid plaklar, infratemporal fossa, kribriform plak, sfenoid/frontal sinüs invazyonu" },
      { code: "T4b", desc: "Orbita apeksi, dura, beyin, orta kraniyal fossa, V2 dışı kraniyal sinirler, nazofarinks veya klivus invazyonu" }
    ],
    nSystem: "shared",
    stageGroup: sharedStageGroup,
    treatmentBySt: {
      "0": "Karsinom in situ: lokal tedavi ve yakın takip.",
      "I": "T1N0 (tüm histolojiler): Cerrahi rezeksiyon (maksillektomi/endoskopik yaklaşım) öncelikli; risk faktörlerine göre adjuvan radyoterapi değerlendirilir.",
      "II": "T2N0: Cerrahi rezeksiyon + risk faktörlerine göre adjuvan radyoterapi.",
      "III": "T3N0 veya T1-3,N1: Cerrahi rezeksiyon + boyun diseksiyonu, ardından adjuvan radyoterapi veya (yüksek riskli özellik varsa) eş zamanlı sistemik tedavi + radyoterapi.",
      "IVA": "T4a veya N2 (herhangi T1-4a): Cerrahi rezeksiyon (genişletilmiş maksillektomi/kraniofasiyal rezeksiyon) + boyun diseksiyonu, ardından risk faktörlerine göre adjuvan tedavi.",
      "IVB": "T4b veya N3: Genellikle rezeksiyon uygun değildir; tanımlı eş zamanlı sistemik tedavi + radyoterapi ve multidisipliner konsey (nöroşirürji dahil) değerlendirmesi esastır.",
      "IVC": "Uzak metastaz: Sistemik tedavi palyatif amaçlı uygulanır."
    }
  },

  {
    id: "nazal-kavite-etmoid",
    order: 8,
    chapter: "12.2",
    title: "Paranazal Sinüsler — Nazal Kavite ve Etmoid Sinüs",
    summary: "Nazal kavite ve etmoid sinüs tümörleri de histopatolojik olarak çeşitlidir; doğru histolojik tanı tedavi kararı için belirleyicidir.",
    tInfo: [
      { code: "Tis", desc: "Karsinoma in situ" },
      { code: "T1", desc: "Tek bir alt bölgeyle sınırlı, kemik invazyonu olsun/olmasın" },
      { code: "T2", desc: "Nazoetmoid kompleks içinde iki alt bölge veya komşu bölge tutulumu, kemik invazyonu olsun/olmasın" },
      { code: "T3", desc: "Orbita medial duvarı/tabanı, maksiller sinüs, damak veya kribriform plak invazyonu" },
      { code: "T4a", desc: "Anterior orbita içeriği, burun/yanak derisi, ön kraniyal fossaya minimal uzanım, pterigoid plaklar, sfenoid/frontal sinüs invazyonu" },
      { code: "T4b", desc: "Orbita apeksi, dura, beyin, orta kraniyal fossa, V2 dışı kraniyal sinirler, nazofarinks veya klivus invazyonu" }
    ],
    nSystem: "shared",
    stageGroup: sharedStageGroup,
    treatmentBySt: {
      "0": "Karsinom in situ: lokal tedavi ve yakın takip.",
      "I": "T1N0 (tüm histolojiler): Cerrahi rezeksiyon (endoskopik veya açık) öncelikli; risk faktörlerine göre adjuvan radyoterapi değerlendirilir.",
      "II": "T2N0: Cerrahi rezeksiyon + risk faktörlerine göre adjuvan radyoterapi.",
      "III": "T3N0 veya T1-3,N1: Cerrahi rezeksiyon + boyun diseksiyonu, ardından adjuvan radyoterapi veya eş zamanlı sistemik tedavi + radyoterapi.",
      "IVA": "T4a veya N2: Cerrahi rezeksiyon (kraniofasiyal rezeksiyon dahil) + boyun diseksiyonu, ardından risk faktörlerine göre adjuvan tedavi.",
      "IVB": "T4b veya N3: Genellikle rezeksiyon uygun değildir; tanımlı eş zamanlı sistemik tedavi + radyoterapi ve multidisipliner (nöroşirürji dahil) konsey değerlendirmesi esastır.",
      "IVC": "Uzak metastaz: Sistemik tedavi palyatif amaçlı uygulanır."
    }
  },

  {
    id: "larinks-supraglottik",
    order: 9,
    chapter: "13.1",
    title: "Larinks — Supraglottik",
    summary: "Epiglot, ariepiglottik plika, aritenoid, ventriküler bantları kapsar. Zengin lenfatik drenajı nedeniyle erken evrede bile bilateral boyun tutulumu riski göz önünde bulundurulur.",
    tInfo: [
      { code: "Tis", desc: "Karsinoma in situ" },
      { code: "T1", desc: "Supraglottisin tek bir alt bölgesiyle sınırlı, vokal kord hareketi normal" },
      { code: "T2", desc: "Larinks fiksasyonu olmadan supraglottis/glottisin birden fazla komşu alt bölgesi veya supraglottis dışı bölge mukozası tutulumu" },
      { code: "T3", desc: "Larinksle sınırlı, vokal kord fiksasyonu VE/VEYA postkrikoid alan, preepiglottik boşluk, paraglottik boşluk ve/veya tiroid kıkırdak iç korteksi invazyonu" },
      { code: "T4a", desc: "Tiroid kıkırdak dış korteksi ve/veya larinks dışı doku invazyonu (trakea, boyun yumuşak dokusu, tiroid, özofagus)" },
      { code: "T4b", desc: "Prevertebral boşluk invazyonu, karotis ensirklasyonu veya mediastinal yapı tutulumu" }
    ],
    nSystem: "shared",
    stageGroup: sharedStageGroup,
    treatmentBySt: {
      "0": "Karsinom in situ: lokal tedavi ve yakın takip.",
      "I": "T1N0: Ses/organ koruyucu tedavi önceliklidir — definitif radyoterapi VEYA konservasyon cerrahisi (açık/endoskopik parsiyel larenjektomi) ± boyun diseksiyonu.",
      "II": "T2N0 (çoğunlukla organ koruyucu yaklaşıma uygun): Aynı organ koruyucu ilkeler geçerlidir; supraglottik bölgenin zengin lenfatik drenajı nedeniyle boyun tedavisi (diseksiyon veya elektif radyoterapi) sıklıkla gerekir.",
      "III": "T3N0-1 (total larenjektomi gerektirebilir) veya T1-2,N1: Total veya parsiyel larenjektomi + boyun diseksiyonu, ardından risk faktörlerine göre adjuvan tedavi; alternatif olarak organ koruyucu eş zamanlı kemoradyoterapi protokolleri değerlendirilebilir.",
      "IVA": "T4a veya N2: Multimodal tedavi — cerrahi (genellikle total larenjektomi) + adjuvan tedavi VEYA tanımlı eş zamanlı sistemik tedavi + radyoterapi.",
      "IVB": "T4b veya N3: Genellikle rezeksiyon uygun değildir; tanımlı eş zamanlı sistemik tedavi + radyoterapi ve multidisipliner konsey değerlendirmesi esastır.",
      "IVC": "Uzak metastaz: Sistemik tedavi palyatif amaçlı uygulanır."
    }
  },

  {
    id: "larinks-glottik",
    order: 10,
    chapter: "13.2",
    title: "Larinks — Glottik",
    summary: "Vokal kordları kapsar. Erken evrede lenf nodu tutulumu nadirdir; ses koruyucu tedavi yaklaşımı ön plandadır.",
    tInfo: [
      { code: "Tis", desc: "Karsinoma in situ" },
      { code: "T1a", desc: "Tek vokal kordla sınırlı, hareket normal" },
      { code: "T1b", desc: "Her iki vokal kordu tutuyor, hareket normal" },
      { code: "T2", desc: "Supraglottis ve/veya subglottise uzanım, ve/veya vokal kord hareketi bozulmuş" },
      { code: "T3", desc: "Larinksle sınırlı, vokal kord fiksasyonu VE/VEYA paraglottik boşluk ve/veya tiroid kıkırdak iç korteksi invazyonu" },
      { code: "T4a", desc: "Tiroid kıkırdak dış korteksi ve/veya larinks dışı doku invazyonu (trakea, krikoid kıkırdak, boyun yumuşak dokusu, tiroid, özofagus)" },
      { code: "T4b", desc: "Prevertebral boşluk invazyonu, karotis ensirklasyonu veya mediastinal yapı tutulumu" }
    ],
    nSystem: "shared",
    stageGroup(T, N, M) {
      const normalized = T === "T1a" || T === "T1b" ? "T1" : T;
      return sharedStageGroup(normalized, N, M);
    },
    treatmentBySt: {
      "0": "Karsinom in situ: genellikle endoskopik/lazer eksizyon yeterlidir.",
      "I": "T1a-bN0: Tek modalite ses koruyucu tedavi — definitif radyoterapi VEYA endoskopik/açık parsiyel larenjektomi. Boyun tedavisi genellikle gerekmez (nodal hastalık glottik tümörlerde nadirdir).",
      "II": "T2N0: Aynı organ koruyucu ilkeler devam eder (radyoterapi veya konservasyon cerrahisi); vokal kord hareket bozukluğu prognostik açıdan izlenir.",
      "III": "T3N0-1 (total larenjektomi gerektirebilir) veya T1-2,N1: Total veya parsiyel larenjektomi + boyun diseksiyonu, ardından risk faktörlerine göre adjuvan tedavi; organ koruyucu eş zamanlı kemoradyoterapi alternatif olarak değerlendirilebilir.",
      "IVA": "T4a veya N2: Multimodal tedavi — cerrahi (sıklıkla total larenjektomi) + adjuvan tedavi VEYA tanımlı eş zamanlı sistemik tedavi + radyoterapi.",
      "IVB": "T4b veya N3: Genellikle rezeksiyon uygun değildir; tanımlı eş zamanlı sistemik tedavi + radyoterapi ve multidisipliner konsey değerlendirmesi esastır.",
      "IVC": "Uzak metastaz: Sistemik tedavi palyatif amaçlı uygulanır."
    }
  },

  {
    id: "larinks-subglottik",
    order: 11,
    chapter: "13.3",
    title: "Larinks — Subglottik",
    summary: "Vokal kordların altından krikoid kıkırdak alt sınırına kadar olan bölgeyi kapsar; en nadir görülen larinks alt bölgesidir.",
    tInfo: [
      { code: "Tis", desc: "Karsinoma in situ" },
      { code: "T1", desc: "Subglottisle sınırlı" },
      { code: "T2", desc: "Vokal kord(lar)a uzanım, hareket normal veya bozulmuş" },
      { code: "T3", desc: "Larinksle sınırlı, vokal kord fiksasyonu VE/VEYA paraglottik boşluk ve/veya tiroid kıkırdak iç korteksi invazyonu" },
      { code: "T4a", desc: "Krikoid veya tiroid kıkırdak ve/veya larinks dışı doku invazyonu (trakea, boyun yumuşak dokusu, tiroid, özofagus)" },
      { code: "T4b", desc: "Prevertebral boşluk invazyonu, karotis ensirklasyonu veya mediastinal yapı tutulumu" }
    ],
    nSystem: "shared",
    stageGroup: sharedStageGroup,
    treatmentBySt: {
      "0": "Karsinom in situ: lokal tedavi ve yakın takip.",
      "I": "T1N0: Definitif radyoterapi VEYA konservasyon cerrahisi değerlendirilir; subglottik yerleşim nedeniyle cerrahi erişim glottik tümörlere göre daha kısıtlıdır.",
      "II": "T2N0: Radyoterapi veya cerrahi (sıklıkla total larenjektomi gerekebilir) değerlendirilir; boyun tedavisi (paratrakeal nodlar dahil) sıklıkla planlanır.",
      "III": "T3N0-1: Total larenjektomi + boyun/paratrakeal diseksiyon, ardından risk faktörlerine göre adjuvan tedavi; eş zamanlı kemoradyoterapi alternatif olarak değerlendirilebilir.",
      "IVA": "T4a veya N2: Multimodal tedavi — cerrahi (total larenjektomi, gerekirse tiroidektomi ile) + adjuvan tedavi VEYA tanımlı eş zamanlı sistemik tedavi + radyoterapi.",
      "IVB": "T4b veya N3: Genellikle rezeksiyon uygun değildir; tanımlı eş zamanlı sistemik tedavi + radyoterapi ve multidisipliner konsey değerlendirmesi esastır.",
      "IVC": "Uzak metastaz: Sistemik tedavi palyatif amaçlı uygulanır."
    }
  }
];

/* Yardımcı: bir sitenin, mod'a (klinik/patolojik) göre N bilgi listesini döndürür. */
function stagingNInfo(site, mode) {
  if (site.nSystem === "shared") {
    return mode === "pathological" ? SHARED_N_INFO_PATHOLOGICAL : SHARED_N_INFO_CLINICAL;
  }
  if (mode === "pathological" && site.nInfoPathological) return site.nInfoPathological;
  return site.nInfoClinical;
}

/* Yardımcı: bir sitenin, mod'a göre evre gruplama fonksiyonunu döndürür. */
function stagingGroupFn(site, mode) {
  if (site.stageGroupClinical || site.stageGroupPathological) {
    return mode === "pathological" && site.stageGroupPathological ? site.stageGroupPathological : site.stageGroupClinical;
  }
  return site.stageGroup;
}

/* ---------- Referans bölümü: paylaşılan lenf nodu evrelemesi (AJCC Bölüm 6) ---------- */

const SHARED_NODAL_CHAPTER = {
  title: "Ortak Servikal Lenf Nodu Evrelemesi",
  introPoints: [
    "Aşağıdaki N kategorisi kriterleri ve evre gruplama deseni; Oral Kavite, Büyük Tükürük Bezleri, Orofarenks (p16-negatif), Hipofarenks, Maksiller Sinüs, Nazal Kavite/Etmoid Sinüs ve Larinks'in üç alt bölgesi (Glottik, Supraglottik, Subglottik) dahil olmak üzere çoğu baş-boyun bölgesinde ORTAK olarak kullanılır.",
    "Nazofarenks ve HPV-ilişkili (p16-pozitif) orofarenks kanseri kendi ayrı N sistemlerini kullanır (ilgili alt bölge sayfalarında ayrıca belirtilmiştir)."
  ],
  nClinical: SHARED_N_INFO_CLINICAL,
  nPathological: SHARED_N_INFO_PATHOLOGICAL,
  stagePattern: [
    { row: "T1", n0: "I", n1: "III", n2: "IVA", n3: "IVB" },
    { row: "T2", n0: "II", n1: "III", n2: "IVA", n3: "IVB" },
    { row: "T3", n0: "III", n1: "III", n2: "IVA", n3: "IVB" },
    { row: "T4a", n0: "IVA", n1: "IVA", n2: "IVA", n3: "IVB" },
    { row: "T4b", n0: "IVB", n1: "IVB", n2: "IVB", n3: "IVB" }
  ],
  generalRules: [
    "M1 (uzak metastaz) her zaman Evre IVC'dir, T ve N'den bağımsız olarak.",
    "Tis, N0, M0 her zaman Evre 0'dır.",
    "Genel eğilim: T ve N kategorisi arttıkça evre bir üst basamağa çıkar; T4b veya N3 varlığı otomatik olarak en az Evre IVB anlamına gelir."
  ]
};
