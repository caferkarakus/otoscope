/*
  SORULAR VERİSİ
  --------------
  Yeni bir soru eklemek için listeye aynı formatta bir blok ekleyin.

  Alanlar:
    id          -> benzersiz kısa kod
    question    -> soru metni
    category    -> assets/js/data/subspecialties.js içindeki "title" değerlerinden biriyle birebir aynı olmalı
    image       -> (opsiyonel) soruyla ilgili görsel dosya yolu
    options     -> şıklar (dizi, istediğiniz kadar şık ekleyebilirsiniz)
    answerIndex -> doğru şıkkın "options" dizisindeki sırası (0'dan başlar: ilk şık = 0)
    explanation -> cevap seçildikten sonra gösterilecek açıklama
*/

const QUESTIONS = [
  {
    id: "q1",
    question: "Akut otitis media tanısında en sık görülen bulgu aşağıdakilerden hangisidir?",
    category: "Otoloji ve Nörotoloji",
    image: "assets/images/icons/ear.svg",
    options: [
      "Timpanik membranda bombeleşme",
      "Dış kulak yolunda kepeklenme",
      "Mastoid bölgede fistül",
      "Kulak kepçesinde ödem"
    ],
    answerIndex: 0,
    explanation: "Timpanik membranda bombeleşme (bulging), akut otitis media için en özgül otoskopik bulgudur."
  },
  {
    id: "q2",
    question: "Centor kriterlerinden biri değildir?",
    category: "Genel Kulak Burun Boğaz",
    image: "assets/images/icons/throat.svg",
    options: [
      "Ateş öyküsü",
      "Tonsiller eksüda",
      "Öksürük varlığı",
      "Ağrılı servikal lenfadenopati"
    ],
    answerIndex: 2,
    explanation: "Centor kriterlerinde 'öksürüğün olmaması' streptokok lehine bir bulgudur; öksürük varlığı değil yokluğu kriterdir."
  },
  {
    id: "q3",
    question: "BPPV'de tanı koydurucu manevra hangisidir?",
    category: "Otoloji ve Nörotoloji",
    image: "assets/images/icons/vestibular.svg",
    options: [
      "Valsalva manevrası",
      "Dix-Hallpike testi",
      "Weber testi",
      "Rinne testi"
    ],
    answerIndex: 1,
    explanation: "Dix-Hallpike testi, pozisyonel nistagmusu ortaya çıkararak BPPV tanısını doğrular."
  },
  {
    id: "q-ka-1",
    question: "Dış kulak yolunun kemik-kıkırdak birleşim yerindeki fizyolojik daralma klinik olarak en çok hangi durumla ilişkilidir?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Yabancı cismin bu bölgede sıkışması",
      "Kolesteatom oluşumu",
      "Timpanoskleroz gelişimi",
      "Kulak zarı perforasyonu"
    ],
    answerIndex: 0,
    explanation: "Dış kulak yolunun kartilajinöz (dış 1/3) ve kemik (iç 2/3) kısımlarının birleştiği yerdeki fizyolojik daralma (isthmus), yabancı cisimlerin bu bölgede sıkışmasına yol açan tipik bir noktadır."
  },
  {
    id: "q-ka-2",
    question: "Kulak zarında pars flaksidanın pars tensadan temel farkı nedir?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Orta fibröz tabakadan yoksun olması",
      "Daha kalın ve sert olması",
      "Tympanik halkayı (annulus) içermesi",
      "Endodermal değil ektodermal kökenli olması"
    ],
    answerIndex: 0,
    explanation: "Pars tensa üç tabakalıdır (dış epidermal, orta fibröz, iç mukozal) ve periferde kalınlaşarak tympanik annulusu oluşturur. Pars flaksida ise orta fibröz tabakadan yoksun olduğu için daha gevşek bir yapıya sahiptir."
  },
  {
    id: "q-ka-3",
    question: "Kemikçik zincirinin sese kaldıraç (lever) etkisi yaklaşık kaç kattır?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "1.3 kat",
      "17 kat",
      "22 kat",
      "26.8 kat"
    ],
    answerIndex: 0,
    explanation: "Malleusun kolu, inkusun uzun koluna göre yaklaşık 1.3 kat daha uzundur; bu fark 1.3 kat bir kaldıraç etkisi sağlar. 17 kat hidrolik oran ile birleşince toplam ses basıncı transformer oranı yaklaşık 22 kat (≈26.8 dB kazanç) olur."
  },
  {
    id: "q-ka-4",
    question: "Orta kulak ile iç kulak arasındaki iki pencereden hangisi üzengi (stapes) tabanının doğrudan bastığı, sesin asıl iletildiği penceredir?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Yuvarlak pencere",
      "Oval pencere",
      "Helikotrema",
      "Modiolus"
    ],
    answerIndex: 1,
    explanation: "Oval pencere skala vestibulinin tabanında yer alır ve üzengi tabanının basıncını doğrudan iç kulağa iletir. Yuvarlak pencere ise pasif hareket ederek basınç boşaltma (relief) işlevi görür."
  },
  {
    id: "q-ka-5",
    question: "Skala media (koklear kanal), skala timpaniden hangi membranla ayrılır?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Reissner membranı",
      "Bazilar membran",
      "Tektoryal membran",
      "Timpanik membran"
    ],
    answerIndex: 1,
    explanation: "Skala media, bazilar membranla skala timpaniden, Reissner (vestibüler) membranla ise skala vestibuliden ayrılır. Corti organı bazilar membran üzerinde yerleşiktir."
  },
  {
    id: "q-va-1",
    question: "Horizontal semisirküler kanal, horizontal düzlemle yaklaşık kaç derecelik açı yapar?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "10°",
      "30°",
      "45°",
      "90°"
    ],
    answerIndex: 1,
    explanation: "Horizontal semisirküler kanal, horizontal düzlemle yaklaşık 30° açı yapar. Bu nedenle kalorik test sırasında hastanın başı 30° öne fleksiyona getirilerek bu kanal dikey konuma getirilir."
  },
  {
    id: "q-va-2",
    question: "Üç semisirküler kanal, vestibüle toplam kaç ayrı delikle açılır?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "3",
      "4",
      "5",
      "6"
    ],
    answerIndex: 2,
    explanation: "Süperior ve posterior kanalların ampulla içermeyen uçları birleşerek ortak bir kanal (crus commune) oluşturur; bu nedenle 3 kanal vestibüle toplam 5 ayrı delikle açılır."
  },
  {
    id: "q-va-3",
    question: "Utrikül ve sakkül gibi otolit organları esas olarak hangi tür uyarıyı algılar?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Açısal (rotasyonel) ivme",
      "Lineer ivme ve yerçekimi",
      "Ses basıncı dalgalanmaları",
      "Endolenf sıcaklık değişimi"
    ],
    answerIndex: 1,
    explanation: "Semisirküler kanallar açısal ivmeyi algılarken, utrikül ve sakkül gibi otolit organları lineer ivme ve yerçekimi kuvvetini algılar."
  },
  {
    id: "q-va-4",
    question: "Otolit organlarındaki otokonyaların (otolit kristalleri) temel kimyasal bileşeni nedir?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Kalsiyum karbonat",
      "Kalsiyum fosfat",
      "Potasyum klorür",
      "Sodyum bikarbonat"
    ],
    answerIndex: 0,
    explanation: "Otokonyalar kalsiyum karbonat kristallerinden oluşur. Baş eğildiğinde bu kristallerin ağırlığıyla oluşan yer değiştirme, altlarındaki duyu tüylerini bükerek denge bilgisi oluşturur."
  },
  {
    id: "q-va-5",
    question: "Sakkül, koklear kanala (ductus cochlearis) hangi yapı aracılığıyla bağlanır?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Ductus reuniens",
      "Ductus endolimfatikus",
      "Aquaductus cochleae",
      "Helikotrema"
    ],
    answerIndex: 0,
    explanation: "Sakkül, ductus reuniens adı verilen dar bir kanal aracılığıyla koklear kanala bağlanır; utrikül ve sakkülden çıkan diğer duktuslar ise birleşerek ductus endolimfatikusu oluşturur."
  },
  {
    id: "q-ov-1",
    question: "Sağ kulağında iletim tipi işitme kaybı olan bir hastada Weber testi hangi kulağa lateralize olur?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Sağ (hasta) kulağa",
      "Sol (sağlam) kulağa",
      "Her iki kulağa eşit duyulur",
      "Lateralizasyon olmaz"
    ],
    answerIndex: 0,
    explanation: "İletim tipi işitme kaybında Weber testi hasta (kötü işiten) kulağa lateralize olur. Sensörinöral işitme kaybında ise ses sağlam kulağa lateralize olur."
  },
  {
    id: "q-ov-2",
    question: "Orta kulakta sıvı (efüzyon) varlığında beklenen timpanogram tipi hangisidir?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Tip A",
      "Tip B",
      "Tip C",
      "Tip As"
    ],
    answerIndex: 1,
    explanation: "Tip B timpanogram düz veya kubbe şeklinde bir eğri gösterir; kulak kanalındaki basınç değişimlerine karşı belirgin bir uyum (kompliyans) tepkisi yoktur ve genellikle orta kulak efüzyonu ile ilişkilidir."
  },
  {
    id: "q-ov-3",
    question: "Pikin negatif basınçta görüldüğü Tip C timpanogram en çok hangi durumu düşündürür?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Ossiküler zincir kopukluğu",
      "Östaki tüpü disfonksiyonu",
      "Otoskleroz",
      "Kulak zarı perforasyonu"
    ],
    answerIndex: 1,
    explanation: "Tip C timpanogramda maksimum kompliyans negatif basınçta oluşur; bu, orta kulak basıncının negatif olduğunu ve altta yatan östaki tüpü disfonksiyonunu düşündürür."
  },
  {
    id: "q-ov-4",
    question: "İşitsel beyin sapı yanıtında (ABR) 'Dalga I' anatomik olarak en çok hangi yapıyı yansıtır?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Koklea ve 8. kraniyal sinir",
      "Kokleer nükleus",
      "Superior olivar kompleks",
      "İnferior kollikulus"
    ],
    answerIndex: 0,
    explanation: "ABR'de Dalga I koklea ve 8. kraniyal sinirden (n. vestibulokoklearis) kaynaklanır. Sonraki dalgalar sırasıyla kokleer nükleus, superior olivar kompleks, lateral lemniskus ve inferior kollikulus düzeylerini yansıtır."
  },
  {
    id: "q-ov-5",
    question: "Kalorik testte soğuk su ile uyarı verildiğinde nistagmusun hızlı fazı hangi yöne olur?",
    category: "Otoloji ve Nörotoloji",
    options: [
      "Uyarılan kulağın karşı yönüne",
      "Uyarılan kulakla aynı yöne",
      "Her zaman yukarı doğru",
      "Her zaman aşağı doğru"
    ],
    answerIndex: 0,
    explanation: "COWS kuralı (Cold-Opposite, Warm-Same) uyarınca soğuk uyaranda nistagmusun hızlı fazı karşı tarafa, sıcak uyaranda ise aynı tarafa doğru gelişir. Kalorik test yalnızca horizontal semisirküler kanalı değerlendirir."
  }
];
