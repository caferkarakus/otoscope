/*
  ACİLLER VERİSİ
  --------------
  Yeni bir acil durum eklemek için listeye aynı formatta bir blok ekleyin.

  Alanlar:
    id              -> benzersiz kısa kod
    title           -> acil durumun adı
    category        -> etiket (örn: "Kulak", "Burun", "Boğaz", "Baş-Boyun")
    redFlags        -> alarm bulguları (madde madde)
    immediateAction -> ilk yaklaşım / yapılması gerekenler (madde madde)
*/

const EMERGENCIES = [
  {
    id: "em-1",
    title: "Peritonsiller Apse",
    category: "BBC",
    redFlags: [
      "Trismus (ağız açmada kısıtlılık)",
      "'Sıcak patates' sesi (muffled voice)",
      "Uvulanın karşı tarafa deviasyonu",
      "Şiddetli tek taraflı boğaz ağrısı ve yutma güçlüğü"
    ],
    immediateAction: [
      "Havayolu güvenliğini değerlendir",
      "İğne aspirasyonu veya insizyon-drenaj için KBB konsültasyonu",
      "İV antibiyoterapi ve hidrasyon başla",
      "Solunum sıkıntısı varsa acil havayolu yönetimi planla"
    ]
  },
  {
    id: "em-2",
    title: "Anjiyoödem / Üst Havayolu Obstrüksiyonu",
    category: "BBC",
    redFlags: [
      "Dudak, dil, farenks ödemi",
      "Stridor",
      "Ses kısıklığı veya değişikliği",
      "Solunum sıkıntısı, hızlı ilerleyen şişlik"
    ],
    immediateAction: [
      "Havayolunu erken değerlendir, gerekirse ileri havayolu için hazırlan",
      "Alerjik nedende adrenalin, antihistaminik, kortikosteroid uygula",
      "Ani kötüleşme riskine karşı yakın monitörizasyon",
      "Kaynağı belirle (ilaç, ACE inhibitörü, alerjen, herediter anjiyoödem)"
    ]
  },
  {
    id: "em-3",
    title: "Ciddi Epistaksis (Posterior Kanama)",
    category: "Rinoloji",
    redFlags: [
      "Anterior kompresyona yanıtsız, devam eden kanama",
      "Her iki burun deliğinden de kan gelmesi",
      "Boğazdan kan akışı hissi (posterior kaynak şüphesi)",
      "Hemodinamik instabilite bulguları (taşikardi, hipotansiyon)"
    ],
    immediateAction: [
      "Damar yolu aç, vital bulguları takip et",
      "Posterior tampon veya balon tampon uygulaması için hazırlan",
      "Gerekirse kan grubu tayini ve transfüzyon hazırlığı yap",
      "Yanıt alınamazsa KBB'ye acil konsültasyon (cerrahi/anjiyografik girişim gerekebilir)"
    ]
  },
  {
    id: "em-4",
    title: "Yabancı Cisim Aspirasyonu",
    category: "BBC",
    redFlags: [
      "Ani başlayan öksürük, boğulma hissi",
      "Tek taraflı azalmış solunum sesleri",
      "Stridor veya wheezing",
      "Siyanoz, konuşamama (tam obstrüksiyon işareti)"
    ],
    immediateAction: [
      "Tam obstrüksiyonda Heimlich manevrası uygula",
      "Kısmi obstrüksiyonda hastayı öksürmeye teşvik et, sakinleştir",
      "Görüntüleme ve rijit bronkoskopi için acil hazırlık yap",
      "Havayolunu sürekli izle, kötüleşirse ileri havayolu yönetimine geç"
    ]
  }
];
