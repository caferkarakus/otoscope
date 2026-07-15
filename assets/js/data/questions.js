/*
  SORULAR VERİSİ
  --------------
  Yeni bir soru eklemek için listeye aynı formatta bir blok ekleyin.

  Alanlar:
    id          -> benzersiz kısa kod
    question    -> soru metni
    image       -> (opsiyonel) soruyla ilgili görsel dosya yolu
    options     -> şıklar (dizi, istediğiniz kadar şık ekleyebilirsiniz)
    answerIndex -> doğru şıkkın "options" dizisindeki sırası (0'dan başlar: ilk şık = 0)
    explanation -> cevap seçildikten sonra gösterilecek açıklama
*/

const QUESTIONS = [
  {
    id: "q1",
    question: "Akut otitis media tanısında en sık görülen bulgu aşağıdakilerden hangisidir?",
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
    image: "assets/images/icons/vestibular.svg",
    options: [
      "Valsalva manevrası",
      "Dix-Hallpike testi",
      "Weber testi",
      "Rinne testi"
    ],
    answerIndex: 1,
    explanation: "Dix-Hallpike testi, pozisyonel nistagmusu ortaya çıkararak BPPV tanısını doğrular."
  }
];
