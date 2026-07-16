/*
  UYGULAMA MANTIĞI
  ----------------
  Bu dosya, data/ klasöründeki içerikleri okuyup ekrana kart olarak çizer,
  "Bölümler" ana ekranı ile yan dal içi sekmeler arasındaki gezinmeyi ve
  soru/detay etkileşimlerini yönetir.

  GEZİNME YAPISI
  --------------
  1) Ana ekran ("bolumler"): 8 KBB yan dalını kart olarak listeler.
  2) Bir yan dala tıklanınca o yan dalın içine girilir; üstte geri butonu ve
     içerik sekmeleri (Özet Kartlar, Anatomi, Sorular, TUS, Vaka Sunumları,
     Aciller) belirir. Bu sekmelerin her biri, SADECE seçili yan dalın
     "category" alanına sahip içerikleri gösterir.

  Yeni bir İÇERİK TÜRÜ eklemek isterseniz (örn. "Sınavlar"), CONTENT_RENDERERS
  nesnesine yeni bir fonksiyon eklemeniz ve index.html'e ilgili sekme/section'ı
  eklemeniz yeterlidir. Yeni bir YAN DAL eklemek için ise sadece
  assets/js/data/subspecialties.js dosyasını düzenlemeniz yeterlidir.
*/

let currentSubspecialtyId = null;

function currentSubspecialty() {
  return SUBSPECIALTIES.find((s) => s.id === currentSubspecialtyId) || null;
}

function filterByCategory(items) {
  const sub = currentSubspecialty();
  if (!sub) return items;
  return items.filter((item) => item.category === sub.title);
}

function emptyState(text) {
  return `<p class="empty-state">${text}</p>`;
}

function renderDetailList(items) {
  return items
    .map((item) => {
      if (item.list) {
        return `
          <div class="modal-section">
            <h4>${item.heading}</h4>
            <ul>${item.list.map((li) => `<li>${li}</li>`).join("")}</ul>
          </div>`;
      }
      return `
        <div class="modal-section">
          <h4>${item.heading}</h4>
          <p>${item.text}</p>
        </div>`;
    })
    .join("");
}

function cardThumb(image, alt) {
  return image ? `<div class="card-thumb"><img src="${image}" alt="${alt}" loading="lazy" /></div>` : "";
}

function openModal(html) {
  document.getElementById("modal-body").innerHTML = html;
  document.getElementById("modal-overlay").classList.add("visible");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("visible");
}

/*
  Kaydırmalı (swipe) kart dizisi kurar: bir grup kartı yatayda tek tek
  kaydırarak gezmeyi sağlar (telefonda parmakla, masaüstünde ok tuşlarıyla
  veya nokta/ok butonlarıyla). "sorular", "tus" ve "vakalar" bunu kullanır.
*/
function setupSwipe(root) {
  const track = root.querySelector(".swipe-track");
  const dots = root.querySelectorAll(".swipe-dot");
  const cards = Array.from(track.children);
  const prevBtn = root.querySelector(".swipe-prev");
  const nextBtn = root.querySelector(".swipe-next");
  let activeIndex = 0;

  function setActive(index) {
    activeIndex = index;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === cards.length - 1;
  }

  // Not: native `scrollIntoView({behavior:"smooth"})`, scroll-snap ile bazı
  // tarayıcılarda çakışıp yarıda kesilebiliyor; bunun yerine kendi kaydırma
  // animasyonumuzu çalıştırıyoruz, böylece tüm tarayıcılarda güvenilir çalışır.
  let rafId;
  function goTo(index) {
    const clamped = Math.max(0, Math.min(cards.length - 1, index));
    const target = cards[clamped];
    const startLeft = track.scrollLeft;
    const endLeft = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
    const duration = 320;
    const startTime = performance.now();

    cancelAnimationFrame(rafId);
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      track.scrollLeft = startLeft + (endLeft - startLeft) * eased;
      if (t < 1) rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          setActive(cards.indexOf(entry.target));
        }
      });
    },
    { root: track, threshold: [0, 0.6, 1] }
  );
  cards.forEach((card) => observer.observe(card));

  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));
  prevBtn.addEventListener("click", () => goTo(activeIndex - 1));
  nextBtn.addEventListener("click", () => goTo(activeIndex + 1));

  setActive(0);
}

function swipeChrome(count) {
  return `
    <div class="swipe-controls">
      <button class="swipe-btn swipe-prev" aria-label="Önceki">‹</button>
      <div class="swipe-dots">
        ${Array.from({ length: count }, (_, i) => `<button class="swipe-dot${i === 0 ? " active" : ""}" aria-label="${i + 1}. öğeye git"></button>`).join("")}
      </div>
      <button class="swipe-btn swipe-next" aria-label="Sonraki">›</button>
    </div>
  `;
}

/*
  Bir soru dizisini kaydırmalı kart olarak çizer ve şık seçimini yönetir.
  "sorular" ve "tus" bölümleri aynı etkileşimi kullandığı için ortaktır.
*/
function renderQuestionSwipe(container, items, introText, emptyText) {
  if (items.length === 0) {
    container.innerHTML = `<p class="section-intro">${introText}</p>${emptyState(emptyText)}`;
    return;
  }

  container.innerHTML = `
    <p class="section-intro">${introText}</p>
    <div class="swipe-wrap">
      <div class="swipe-track">
        ${items
          .map(
            (q) => `
          <article class="swipe-card question-card" data-id="${q.id}">
            ${cardThumb(q.image, q.question)}
            <h3>${q.question}</h3>
            <div class="options">
              ${q.options
                .map((opt, i) => `<button class="option-btn" data-index="${i}">${opt}</button>`)
                .join("")}
            </div>
            <div class="explanation">${q.explanation}</div>
          </article>`
          )
          .join("")}
      </div>
      ${swipeChrome(items.length)}
    </div>
  `;

  container.querySelectorAll(".question-card").forEach((qCard) => {
    const q = items.find((item) => item.id === qCard.dataset.id);
    const buttons = qCard.querySelectorAll(".option-btn");
    let answered = false;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const chosenIndex = Number(btn.dataset.index);

        buttons.forEach((b) => {
          const idx = Number(b.dataset.index);
          if (idx === q.answerIndex) {
            b.classList.add("correct");
          } else if (idx === chosenIndex) {
            b.classList.add("incorrect");
          }
        });

        qCard.querySelector(".explanation").classList.add("visible");
      });
    });
  });

  setupSwipe(container.querySelector(".swipe-wrap"));
}

function countForSubspecialty(title) {
  const sources = [SUMMARY_CARDS, ANATOMY, QUESTIONS, TUS_QUESTIONS, CASES, EMERGENCIES];
  return sources.reduce((total, list) => total + list.filter((item) => item.category === title).length, 0);
}

function enterSubspecialty(id) {
  currentSubspecialtyId = id;
  const sub = currentSubspecialty();

  document.getElementById("subspecialty-title").textContent = sub.title;
  document.getElementById("subspecialty-bar").hidden = false;
  document.getElementById("content-tabs").hidden = false;

  document.querySelectorAll("#content-tabs .tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === "ozetler");
  });
  switchSection("ozetler");
}

/*
  Üst seviye görünüm ("Bölümler" ana ekranı ile bağımsız "Kanser Evrelemesi"
  aracı) arasında geçiş yapar. Her ikisi de yan dal bağlamının DIŞINDADIR;
  bu yüzden çağrıldığında önce olası bir yan dal oturumunu kapatır.
*/
function switchPrimary(view) {
  currentSubspecialtyId = null;
  document.getElementById("subspecialty-bar").hidden = true;
  document.getElementById("content-tabs").hidden = true;

  document.querySelectorAll("#primary-tabs .tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.primary === view);
  });
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.toggle("active", sec.id === view);
  });

  if (view === "evreleme") {
    CONTENT_RENDERERS.evreleme(document.getElementById("evreleme"));
  }
}

function exitToHome() {
  switchPrimary("bolumler");
}

const CONTENT_RENDERERS = {
  ozetler(container) {
    const cards = filterByCategory(SUMMARY_CARDS);
    if (cards.length === 0) {
      container.innerHTML = emptyState("Bu yan dal için henüz özet kart eklenmedi.");
      return;
    }
    container.innerHTML = `
      <p class="section-intro">Konu başlıklarına tıklayarak detaylı özeti görüntüleyin.</p>
      <div class="grid">
        ${cards
          .map(
            (card) => `
          <div class="card" data-id="${card.id}">
            ${cardThumb(card.image, card.title)}
            <span class="tag">${card.category}</span>
            <h3>${card.title}</h3>
            <p>${card.summary}</p>
          </div>`
          )
          .join("")}
      </div>
    `;

    container.querySelectorAll(".card").forEach((el) => {
      el.addEventListener("click", () => {
        const card = SUMMARY_CARDS.find((c) => c.id === el.dataset.id);
        openModal(`
          ${card.image ? `<div class="modal-thumb"><img src="${card.image}" alt="${card.title}" /></div>` : ""}
          <span class="modal-tag">${card.category}</span>
          <h2>${card.title}</h2>
          ${renderDetailList(card.details)}
        `);
      });
    });
  },

  anatomi(container) {
    const items = filterByCategory(ANATOMY);
    if (items.length === 0) {
      container.innerHTML = emptyState("Bu yan dal için henüz anatomi içeriği eklenmedi.");
      return;
    }
    container.innerHTML = `
      <p class="section-intro">Bir bölgeye tıklayarak yapıları ve işlevlerini görüntüleyin.</p>
      <div class="grid">
        ${items
          .map(
            (item) => `
          <div class="card" data-id="${item.id}">
            ${cardThumb(item.image, item.title)}
            <span class="tag">${item.category}</span>
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
          </div>`
          )
          .join("")}
      </div>
    `;

    container.querySelectorAll(".card").forEach((el) => {
      el.addEventListener("click", () => {
        const item = ANATOMY.find((a) => a.id === el.dataset.id);
        openModal(`
          ${item.image ? `<div class="modal-thumb"><img src="${item.image}" alt="${item.title}" /></div>` : ""}
          <span class="modal-tag">${item.category}</span>
          <h2>${item.title}</h2>
          ${renderDetailList(item.details)}
        `);
      });
    });
  },

  sorular(container) {
    renderQuestionSwipe(
      container,
      filterByCategory(QUESTIONS),
      "Kaydırarak sorular arasında gezinin, bir şıkka dokunarak cevabınızı kontrol edin.",
      "Bu yan dal için henüz soru eklenmedi."
    );
  },

  tus(container) {
    renderQuestionSwipe(
      container,
      filterByCategory(TUS_QUESTIONS),
      "Kaydırarak sorular arasında gezinin, bir şıkka dokunarak cevabınızı kontrol edin. Bu bölümdeki sorular örnek amaçlıdır; gerçek çıkmış TUS soruları değildir.",
      "Bu yan dal için henüz TUS sorusu eklenmedi."
    );
  },

  vakalar(container) {
    const items = filterByCategory(CASES);
    if (items.length === 0) {
      container.innerHTML = emptyState("Bu yan dal için henüz vaka sunumu eklenmedi.");
      return;
    }
    container.innerHTML = `
      <p class="section-intro">Kaydırarak vakalar arasında gezinin.</p>
      <div class="swipe-wrap">
        <div class="swipe-track">
          ${items
            .map(
              (c) => `
            <article class="swipe-card case-card" data-id="${c.id}">
              ${cardThumb(c.image, c.title)}
              <span class="tag">${c.category}</span>
              <h3>${c.title}</h3>
              <div class="modal-section">
                <h4>Başvuru / Öykü</h4>
                <p>${c.presentation}</p>
              </div>
              <div class="modal-section">
                <h4>Muayene Bulguları</h4>
                <p>${c.examination}</p>
              </div>
              <div class="modal-section">
                <h4>Tanı</h4>
                <p>${c.diagnosis}</p>
              </div>
              <div class="modal-section">
                <h4>Tartışma</h4>
                <ul>${c.discussion.map((d) => `<li>${d}</li>`).join("")}</ul>
              </div>
            </article>`
            )
            .join("")}
        </div>
        ${swipeChrome(items.length)}
      </div>
    `;

    setupSwipe(container.querySelector(".swipe-wrap"));
  },

  aciller(container) {
    const items = filterByCategory(EMERGENCIES);
    if (items.length === 0) {
      container.innerHTML = emptyState("Bu yan dal için henüz acil durum eklenmedi.");
      return;
    }
    container.innerHTML = `
      <p class="section-intro">Acil durumun üzerine tıklayarak alarm bulgularını ve ilk yaklaşımı görüntüleyin.</p>
      <div class="grid">
        ${items
          .map(
            (e) => `
          <div class="card emergency" data-id="${e.id}">
            <span class="tag">${e.category}</span>
            <h3>${e.title}</h3>
            <p>${e.redFlags[0]}</p>
          </div>`
          )
          .join("")}
      </div>
    `;

    container.querySelectorAll(".card").forEach((el) => {
      el.addEventListener("click", () => {
        const e = EMERGENCIES.find((item) => item.id === el.dataset.id);
        openModal(`
          <span class="modal-tag">${e.category}</span>
          <h2>${e.title}</h2>
          <div class="modal-section">
            <h4>Alarm Bulguları</h4>
            <ul>${e.redFlags.map((r) => `<li>${r}</li>`).join("")}</ul>
          </div>
          <div class="modal-section">
            <h4>İlk Yaklaşım</h4>
            <ul>${e.immediateAction.map((a) => `<li>${a}</li>`).join("")}</ul>
          </div>
        `);
      });
    });
  },

  bolumler(container) {
    container.innerHTML = `
      <p class="section-intro">Bir yan dal seçerek o dala ait özet kart, anatomi, soru, TUS, vaka ve acil içeriklerini görüntüleyin.</p>
      <div class="grid subspecialty-grid">
        ${SUBSPECIALTIES.map((sub, i) => {
          const count = countForSubspecialty(sub.title);
          return `
          <div class="card subspecialty-card" data-id="${sub.id}">
            ${cardThumb(sub.image, sub.title)}
            <span class="subspecialty-number">${i + 1}</span>
            <h3>${sub.title}</h3>
            <p>${count > 0 ? `${count} içerik` : "İçerik yakında eklenecek"}</p>
          </div>`;
        }).join("")}
      </div>
    `;

    container.querySelectorAll(".subspecialty-card").forEach((el) => {
      el.addEventListener("click", () => enterSubspecialty(el.dataset.id));
    });
  },

  evreleme(container) {
    container.innerHTML = `
      <p class="section-intro staging-disclaimer">${STAGING_DISCLAIMER}</p>
      <div class="grid">
        ${STAGING_SITES.map(
          (site) => `
          <div class="card" data-id="${site.id}">
            <span class="tag">AJCC 8. Baskı</span>
            <h3>${site.title}</h3>
            <p>${site.summary}</p>
          </div>`
        ).join("")}
        <div class="card staging-soon">
          <span class="tag">Yakında</span>
          <h3>Orofarinks, Larinks, Nazofarinks ve diğerleri</h3>
          <p>AJCC'nin baş-boyun bölümündeki sıraya göre eklenmeye devam edilecek.</p>
        </div>
      </div>
    `;

    container.querySelectorAll(".card[data-id]").forEach((el) => {
      el.addEventListener("click", () => {
        const site = STAGING_SITES.find((s) => s.id === el.dataset.id);
        openStagingCalculator(site);
      });
    });
  }
};

/*
  Bir evreleme sitesi için interaktif T/N/M hesaplayıcısını modalde açar.
  Girilen değerler her değiştiğinde recomputeStaging() sonucu günceller.
*/
function openStagingCalculator(site) {
  openModal(`
    <span class="modal-tag">AJCC 8. Baskı</span>
    <h2>${site.title}</h2>
    <p class="staging-summary">${site.summary}</p>

    <div class="staging-form" id="staging-form">
      <fieldset>
        <legend>T — Primer Tümör</legend>
        <label class="staging-check">
          <input type="checkbox" id="stg-tis" /> Karsinom in situ (Tis)
        </label>
        <div id="stg-size-fields">
          <label class="staging-field">Tümör boyutu (cm)
            <input type="number" id="stg-size" min="0" step="0.1" value="0" />
          </label>
          <label class="staging-field">İnvazyon derinliği - DOI (mm)
            <input type="number" id="stg-doi" min="0" step="0.5" value="0" />
          </label>
          <label class="staging-field">İleri lokal invazyon
            <select id="stg-invasion">
              <option value="none">Yok</option>
              <option value="t4a">Kortikal kemik / maksiller sinüs / yüz derisi (T4a)</option>
              <option value="t4b">Çiğneme boşluğu / pterigoid / kafa tabanı / karotis (T4b)</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>N — Bölgesel Lenf Nodu</legend>
        <label class="staging-check">
          <input type="checkbox" id="stg-has-nodes" /> Lenf nodu tutulumu var
        </label>
        <div id="stg-node-fields" hidden>
          <label class="staging-field">Tutulum düzeni
            <select id="stg-laterality">
              <option value="single-ipsi">Tek taraflı, tek nod</option>
              <option value="multiple-ipsi">Tek taraflı, birden fazla nod</option>
              <option value="bilateral">Bilateral / karşı taraf</option>
            </select>
          </label>
          <label class="staging-field">En büyük nod boyutu (cm)
            <input type="number" id="stg-node-size" min="0" step="0.1" value="0" />
          </label>
          <label class="staging-check">
            <input type="checkbox" id="stg-ene" /> Klinik olarak belirgin ekstranodal yayılım (ENE)
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>M — Uzak Metastaz</legend>
        <label class="staging-check">
          <input type="checkbox" id="stg-metastasis" /> Uzak metastaz mevcut
        </label>
      </fieldset>
    </div>

    <div class="staging-result" id="staging-result"></div>

    <p class="staging-disclaimer">${STAGING_DISCLAIMER}</p>
  `);

  const form = document.getElementById("staging-form");
  form.addEventListener("input", () => recomputeStaging(site));
  form.addEventListener("change", () => recomputeStaging(site));
  recomputeStaging(site);
}

function recomputeStaging(site) {
  const tis = document.getElementById("stg-tis").checked;
  const size = document.getElementById("stg-size").value;
  const doi = document.getElementById("stg-doi").value;
  const invasion = document.getElementById("stg-invasion").value;
  const hasNodes = document.getElementById("stg-has-nodes").checked;
  const laterality = document.getElementById("stg-laterality").value;
  const nodeSize = document.getElementById("stg-node-size").value;
  const ene = document.getElementById("stg-ene").checked;
  const metastasis = document.getElementById("stg-metastasis").checked;

  document.getElementById("stg-size").disabled = tis;
  document.getElementById("stg-doi").disabled = tis;
  document.getElementById("stg-invasion").disabled = tis;
  document.getElementById("stg-size-fields").classList.toggle("staging-disabled", tis);

  document.getElementById("stg-node-fields").hidden = !hasNodes;

  const T = site.computeT({ tis, size, doi, invasion });
  const N = site.computeN({ hasNodes, laterality, nodeSize, ene });
  const M = site.computeM({ metastasis });
  const stage = site.stageGroup(T, N, M);
  const treatment = site.treatmentBySt[stage] || "Evre hesaplanamadı.";

  document.getElementById("staging-result").innerHTML = `
    <div class="staging-tnm">
      <span class="staging-chip">T: ${T}</span>
      <span class="staging-chip">N: ${N}</span>
      <span class="staging-chip">M: ${M}</span>
    </div>
    <div class="staging-stage">Evre ${stage}</div>
    <p class="staging-treatment">${treatment}</p>
  `;
}

function switchSection(sectionId) {
  document.querySelectorAll("#content-tabs .tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === sectionId);
  });
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.toggle("active", sec.id === sectionId);
  });

  const container = document.getElementById(sectionId);
  CONTENT_RENDERERS[sectionId](container);
}

document.addEventListener("DOMContentLoaded", () => {
  CONTENT_RENDERERS.bolumler(document.getElementById("bolumler"));

  document.getElementById("back-to-home").addEventListener("click", exitToHome);

  document.querySelectorAll("#content-tabs .tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchSection(btn.dataset.section));
  });

  document.querySelectorAll("#primary-tabs .tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchPrimary(btn.dataset.primary));
  });

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });
});
