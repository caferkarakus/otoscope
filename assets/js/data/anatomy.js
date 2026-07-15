/*
  ANATOMİ VERİSİ
  --------------
  Yeni bir anatomi konusu eklemek için listeye aynı formatta bir blok ekleyin.

  Alanlar:
    id       -> benzersiz kısa kod
    title    -> kartta görünecek başlık
    category -> etiket (örn: "Otoloji", "Rinoloji", "BBC")
    image    -> şematik diyagram dosya yolu
    summary  -> kart üzerinde görünecek kısa özet (1-2 cümle)
    details  -> karta tıklanınca açılan pencerede gösterilecek bölümler
*/

const ANATOMY = [
  {
    id: "anat-1",
    title: "Dış Kulak",
    category: "Otoloji",
    image: "assets/images/anatomy/dis-kulak.svg",
    summary: "Kulak kepçesi ve dış kulak yolundan oluşur; ses dalgalarını kulak zarına iletir.",
    details: [
      {
        heading: "Bileşenler",
        list: ["Kulak Kepçesi (Pinna)", "Dış Kulak Yolu", "Kulak Zarı (Timpanik Membran)"]
      },
      {
        heading: "İşlev",
        text: "Ses dalgalarını toplar ve dış kulak yolu boyunca kulak zarına yönlendirir."
      }
    ]
  },
  {
    id: "anat-2",
    title: "Orta Kulak",
    category: "Otoloji",
    image: "assets/images/anatomy/orta-kulak.svg",
    summary: "Kulak zarı ile iç kulak arasındaki hava dolu boşluk; kemikçik zinciri sesi güçlendirir.",
    details: [
      {
        heading: "Bileşenler",
        list: ["Kulak Zarı", "Kemikçik Zinciri: Çekiç (Malleus), Örs (İnkus), Üzengi (Stapes)", "Östaki Borusu"]
      },
      {
        heading: "İşlev",
        text: "Kulak zarındaki titreşimleri kemikçik zinciri aracılığıyla iç kulağa mekanik olarak iletir ve güçlendirir. Östaki borusu orta kulak basıncını dengeler."
      }
    ]
  },
  {
    id: "anat-3",
    title: "İç Kulak",
    category: "Otoloji",
    image: "assets/images/anatomy/ic-kulak.svg",
    summary: "Koklea (işitme) ve yarım daire kanalları (denge) burada yer alır.",
    details: [
      {
        heading: "Bileşenler",
        list: ["Koklea (Salyangoz)", "Yarım Daire Kanalları", "Vestibülokoklear Sinir (8. kraniyal sinir)"]
      },
      {
        heading: "İşlev",
        text: "Koklea mekanik titreşimleri elektrik sinyaline çevirir (işitme); yarım daire kanalları baş hareketlerini algılayarak denge duyusunu sağlar."
      }
    ]
  },
  {
    id: "anat-4",
    title: "Burun ve Paranazal Sinüsler",
    category: "Rinoloji",
    image: "assets/images/anatomy/burun-sinusler.svg",
    summary: "Nazal kavite ve çevresindeki hava dolu kemik boşlukları (sinüsler).",
    details: [
      {
        heading: "Bileşenler",
        list: ["Nazal Kavite (Septum ile iki yarıma ayrılır)", "Frontal Sinüs", "Maksiller Sinüs", "Sfenoid Sinüs", "Etmoid Sinüs (görselde gösterilmemiştir)"]
      },
      {
        heading: "İşlev",
        text: "Solunan havayı ısıtır, nemlendirir ve filtreler; koku alma burada gerçekleşir. Sinüsler kafatasını hafifletir ve sesin rezonansına katkıda bulunur."
      }
    ]
  },
  {
    id: "anat-5",
    title: "Farinks",
    category: "BBC",
    image: "assets/images/anatomy/farinks.svg",
    summary: "Burun arkasından yemek borusuna kadar uzanan, üç bölgeye ayrılan ortak kanal.",
    details: [
      {
        heading: "Bölgeler",
        list: ["Nazofarinks (burun arkası)", "Orofarinks (ağız arkası, tonsiller burada)", "Laringofarinks (larinks girişine kadar)"]
      },
      {
        heading: "İşlev",
        text: "Hem solunum hem sindirim yolunun ortak geçiş güzergâhıdır; yutma sırasında besinleri yemek borusuna yönlendirir."
      }
    ]
  },
  {
    id: "anat-6",
    title: "Larinks",
    category: "BBC",
    image: "assets/images/anatomy/larinks.svg",
    summary: "Ses tellerini barındıran, solunum yolunu koruyan organ; trakea ile devam eder.",
    details: [
      {
        heading: "Bileşenler",
        list: ["Epiglot (yutma sırasında hava yolunu kapatır)", "Vokal Kordlar (ses telleri)", "Trakea ile devamlılık"]
      },
      {
        heading: "İşlev",
        text: "Ses üretimini sağlar (fonasyon) ve yutma sırasında epiglot aracılığıyla besinlerin akciğerlere kaçmasını engeller."
      }
    ]
  }
];
