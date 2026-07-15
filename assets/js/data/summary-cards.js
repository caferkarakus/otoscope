/*
  ÖZET KARTLAR VERİSİ
  --------------------
  Yeni bir konu eklemek için aşağıdaki listeye, aynı formatta { ... } bloğu ekleyin.
  Her blok bittikten sonra virgül koymayı unutmayın (en sondaki hariç).

  Alanlar:
    id       -> benzersiz bir kısa kod (örn: "oma-3")
    title    -> kartta görünecek başlık
    category -> kartın üstündeki küçük etiket (örn: "Otoloji", "Rinoloji", "BBC")
    image    -> (opsiyonel) kartta ve detay penceresinde gösterilecek görsel dosya yolu
    summary  -> kart üzerinde görünecek kısa özet (1-2 cümle)
    details  -> karta tıklanınca açılan pencerede gösterilecek, "başlık: madde madde metin" şeklinde bölümler
*/

const SUMMARY_CARDS = [
  {
    id: "oma-1",
    title: "Akut Otitis Media",
    category: "Otoloji",
    image: "assets/images/icons/ear.svg",
    summary: "Orta kulağın akut enfeksiyonu; genellikle üst solunum yolu enfeksiyonunu takiben gelişir.",
    details: [
      {
        heading: "Tanım",
        text: "Orta kulak boşluğunun ani başlangıçlı enflamasyonu ve efüzyonudur."
      },
      {
        heading: "Sık Etkenler",
        list: ["Streptococcus pneumoniae", "Haemophilus influenzae", "Moraxella catarrhalis"]
      },
      {
        heading: "Bulgular",
        list: ["Kulak ağrısı (otalji)", "Ateş", "Timpanik membranda bombeleşme ve hiperemi", "İşitme azlığı"]
      },
      {
        heading: "Tedavi Yaklaşımı",
        text: "Hafif olgularda 48-72 saat gözlem, gerekirse amoksisilin bazlı antibiyoterapi."
      }
    ]
  },
  {
    id: "sinuzit-1",
    title: "Akut Rinosinüzit",
    category: "Rinoloji",
    image: "assets/images/icons/nose.svg",
    summary: "Paranazal sinüs mukozasının akut enflamasyonu; genellikle viral kökenlidir.",
    details: [
      {
        heading: "Tanım",
        text: "Semptomların 4 haftadan kısa sürdüğü sinüs mukozası enflamasyonudur."
      },
      {
        heading: "Bulgular",
        list: ["Pürülan burun akıntısı", "Yüzde ağrı/basınç hissi", "Nazal konjesyon", "Hiposmi"]
      },
      {
        heading: "Bakteriyel Şüphe Kriterleri",
        list: ["10 günden uzun süren semptomlar", "İyileşme sonrası kötüleşme (double sickening)", "Yüksek ateş + pürülan akıntı ilk 3-4 günde"]
      }
    ]
  },
  {
    id: "tonsillit-1",
    title: "Akut Tonsillofarenjit",
    category: "BBC",
    image: "assets/images/icons/throat.svg",
    summary: "Tonsil ve farenks mukozasının akut enfeksiyonu; viral veya bakteriyel olabilir.",
    details: [
      {
        heading: "Tanım",
        text: "Boğaz ağrısı ile seyreden, tonsillerde hiperemi/eksüda ile karakterize enfeksiyondur."
      },
      {
        heading: "Centor Kriterleri (Streptokok olasılığı için)",
        list: ["Tonsiller eksüda", "Ağrılı servikal lenfadenopati", "Ateş öyküsü", "Öksürük olmaması"]
      },
      {
        heading: "Tedavi",
        text: "Streptokok şüphesi yüksekse penisilin bazlı antibiyoterapi; viral olgularda semptomatik tedavi."
      }
    ]
  },
  {
    id: "vertigo-1",
    title: "Benign Paroksismal Pozisyonel Vertigo (BPPV)",
    category: "Otoloji",
    image: "assets/images/icons/vestibular.svg",
    summary: "Baş hareketleriyle tetiklenen, kısa süreli, tekrarlayan vertigo ataklarıyla seyreden periferik vestibüler bozukluk.",
    details: [
      {
        heading: "Mekanizma",
        text: "Semisirküler kanallara serbest otokonyaların (kanalolityazis) yer değiştirmesi."
      },
      {
        heading: "Bulgular",
        list: ["Pozisyonla tetiklenen ani vertigo", "Genellikle 60 saniyeden kısa sürer", "Dix-Hallpike testinde rotatuar nistagmus"]
      },
      {
        heading: "Tedavi",
        text: "Epley manevrası gibi kanalit repozisyon manevraları ilk basamak tedavidir."
      }
    ]
  }
];
