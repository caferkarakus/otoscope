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

  if (view === "evreleme" || view === "hesaplayici") {
    CONTENT_RENDERERS[view](document.getElementById(view));
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

  /*
    "Kanser Evrelemesi": AJCC bölüm sırasına göre REFERANS içerik (hesaplama
    yapmaz). Önce paylaşılan N sistemi/evre deseni, ardından her alt bölge
    kendi T/N kriterleri ve tedavi özetiyle listelenir.
  */
  evreleme(container) {
    const sortedSites = [...STAGING_SITES].sort((a, b) => a.order - b.order);
    container.innerHTML = `
      <p class="section-intro staging-disclaimer">${STAGING_DISCLAIMER}</p>
      <div class="staging-ref-layout">
        <nav class="staging-ref-sidebar">
          <button type="button" class="staging-ref-nav-btn" data-target="shared-nodal">${SHARED_NODAL_CHAPTER.title}</button>
          ${sortedSites
            .map((site) => `<button type="button" class="staging-ref-nav-btn" data-target="${site.id}">${site.title}</button>`)
            .join("")}
        </nav>
        <div class="staging-ref-main" id="staging-ref-main"></div>
      </div>
    `;

    container.querySelector(".staging-ref-sidebar").addEventListener("click", (e) => {
      const btn = e.target.closest(".staging-ref-nav-btn");
      if (!btn) return;
      selectStagingRefNav(btn.dataset.target);
    });

    selectStagingRefNav("shared-nodal");
  },

  /*
    "Staging Calculator": tek soru olarak Tümör (alt bölge) seçilir; ardından
    aynı sayfada (varsa) cTNM/pTNM seçimi ve T/N/M kategorileri belirir.
    Evre ve tedavi özeti anında hesaplanır.
  */
  hesaplayici(container) {
    const sortedSites = [...STAGING_SITES].sort((a, b) => a.order - b.order);
    container.innerHTML = `
      <p class="section-intro staging-disclaimer">${STAGING_DISCLAIMER}</p>
      <div class="staging-calculator">
        <p class="staging-edition">AJCC 8. Edition:</p>
        <fieldset class="staging-site-picker">
          <legend>Tümör</legend>
          <select id="stg-site" class="staging-select">
            <option value="">— Alt bölge seçin —</option>
            ${sortedSites.map((s) => `<option value="${s.id}">${s.title}</option>`).join("")}
          </select>
        </fieldset>
        <div id="staging-dynamic"></div>
      </div>
    `;

    container.querySelector("#stg-site").addEventListener("change", (e) => {
      const site = STAGING_SITES.find((s) => s.id === e.target.value);
      renderStagingCalculatorFields(site);
    });
  }
};

/* ---------- Kanser Evrelemesi: referans (salt okunur) görünümler ---------- */

function stageTableRows(pattern) {
  return pattern
    .map(
      (row) => `
      <tr>
        <td>${row.row}</td>
        <td>${row.n0}</td>
        <td>${row.n1}</td>
        <td>${row.n2}</td>
        <td>${row.n3}</td>
      </tr>`
    )
    .join("");
}

function sharedNodalContentHTML() {
  const ch = SHARED_NODAL_CHAPTER;
  return `
    <h2>${ch.title}</h2>
    <div class="modal-section">
      <ul class="staging-intro-list">${ch.introPoints.map((p) => `<li>${p}</li>`).join("")}</ul>
    </div>
    <div class="modal-section">
      <h4>Klinik N (cN)</h4>
      <ul>${ch.nClinical.map((n) => `<li><strong>${n.code}</strong> — ${n.desc}</li>`).join("")}</ul>
    </div>
    <div class="modal-section">
      <h4>Patolojik N (pN)</h4>
      <ul>${ch.nPathological.map((n) => `<li><strong>${n.code}</strong> — ${n.desc}</li>`).join("")}</ul>
    </div>
    <div class="modal-section">
      <h4>Paylaşımlı Evre Grubu Deseni</h4>
      <div class="staging-table-wrap">
        <table class="staging-table">
          <thead><tr><th>T \\ N</th><th>N0</th><th>N1</th><th>N2</th><th>N3</th></tr></thead>
          <tbody>${stageTableRows(ch.stagePattern)}</tbody>
        </table>
      </div>
    </div>
    <div class="modal-section">
      <h4>Genel Kurallar</h4>
      <ul>${ch.generalRules.map((r) => `<li>${r}</li>`).join("")}</ul>
    </div>
  `;
}

function stagingReferenceContentHTML(site) {
  const nInfoC = stagingNInfo(site, "clinical");
  const nInfoP = stagingNInfo(site, "pathological");
  const hasCustomStageTables = !!(site.stageGroupClinical || site.stageGroupPathological);

  return `
    <h2>${site.title}</h2>
    <div class="modal-section"><p>${site.summary}</p></div>
    <div class="modal-section">
      <h4>T — Primer Tümör</h4>
      <ul>${site.tInfo.map((t) => `<li><strong>${t.code}</strong> — ${t.desc}</li>`).join("")}</ul>
    </div>
    <div class="modal-section">
      <h4>N — Bölgesel Lenf Nodu ${site.nSystem === "shared" ? "(paylaşılan sistem)" : "(kendi sistemi)"}</h4>
      <p class="staging-n-label">Klinik (cN)</p>
      <ul>${nInfoC.map((n) => `<li><strong>${n.code}</strong> — ${n.desc}</li>`).join("")}</ul>
      ${
        !site.noPathologicalToggle
          ? `<p class="staging-n-label">Patolojik (pN)</p><ul>${nInfoP.map((n) => `<li><strong>${n.code}</strong> — ${n.desc}</li>`).join("")}</ul>`
          : ""
      }
    </div>
    ${
      hasCustomStageTables
        ? ""
        : `<div class="modal-section">
      <h4>Evre Grubu</h4>
      <p>Bu alt bölge <a href="#" class="staging-shared-link" data-target="shared-nodal">paylaşılan evre gruplama desenini</a> kullanır (Tis→0, T1→I, T2→II, T3 veya N1→III, T4a veya N2→IVA, T4b veya N3→IVB, M1→IVC).</p>
    </div>`
    }
    <div class="modal-section">
      <h4>Evreye Göre Tedavi Yaklaşımı (NCCN genel mantığı — özet)</h4>
      ${Object.entries(site.treatmentBySt)
        .map(([stage, text]) => `<p><strong>Evre ${stage}:</strong> ${text}</p>`)
        .join("")}
    </div>
  `;
}

function selectStagingRefNav(target) {
  const nav = document.querySelector(".staging-ref-sidebar");
  const main = document.getElementById("staging-ref-main");
  if (!nav || !main) return;

  nav.querySelectorAll(".staging-ref-nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.target === target);
  });

  main.innerHTML = target === "shared-nodal" ? sharedNodalContentHTML() : stagingReferenceContentHTML(STAGING_SITES.find((s) => s.id === target));
  main.scrollTop = 0;

  const link = main.querySelector(".staging-shared-link");
  if (link) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      selectStagingRefNav("shared-nodal");
    });
  }
}

/* ---------- Staging Calculator: interaktif hesaplayıcı (tek sayfa) ---------- */

let calculatorMode = "clinical";

function renderStagingCalculatorFields(site) {
  const dyn = document.getElementById("staging-dynamic");
  if (!site) {
    dyn.innerHTML = "";
    return;
  }
  calculatorMode = "clinical";
  renderStagingCalculatorForm(site);
}

function renderStagingCalculatorForm(site) {
  const dyn = document.getElementById("staging-dynamic");
  const nInfo = stagingNInfo(site, calculatorMode);
  const showModeToggle = !site.noPathologicalToggle;

  dyn.innerHTML = `
    <div class="staging-site-summary">
      <h3>${site.title}</h3>
      <p class="staging-summary">${site.summary}</p>
    </div>

    ${
      showModeToggle
        ? `<div class="staging-mode-toggle" id="staging-mode-toggle">
      <button type="button" class="staging-mode-btn${calculatorMode === "clinical" ? " active" : ""}" data-mode="clinical">cTNM (Klinik)</button>
      <button type="button" class="staging-mode-btn${calculatorMode === "pathological" ? " active" : ""}" data-mode="pathological">pTNM (Patolojik)</button>
    </div>`
        : `<p class="staging-n-label">Bu alt bölgede klinik/patolojik N ayrımı kullanılmaz.</p>`
    }

    <div class="staging-form" id="staging-form">
      <fieldset>
        <legend>T — Primer Tümör</legend>
        <select id="stg-t" class="staging-select">
          ${site.tInfo.map((t) => `<option value="${t.code}">${t.code} — ${t.desc}</option>`).join("")}
        </select>
      </fieldset>

      <fieldset>
        <legend>N — Bölgesel Lenf Nodu</legend>
        <select id="stg-n" class="staging-select" data-n-select>
          ${nInfo.map((n) => `<option value="${n.code}">${n.code} — ${n.desc}</option>`).join("")}
        </select>
      </fieldset>

      <fieldset>
        <legend>M — Uzak Metastaz</legend>
        <select id="stg-m" class="staging-select">
          <option value="M0">M0 — Uzak metastaz yok</option>
          <option value="M1">M1 — Uzak metastaz var</option>
        </select>
      </fieldset>
    </div>

    <div class="staging-result" id="staging-result"></div>
  `;

  if (showModeToggle) {
    dyn.querySelectorAll(".staging-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        calculatorMode = btn.dataset.mode;
        renderStagingCalculatorForm(site);
      });
    });
  }

  const form = document.getElementById("staging-form");
  form.addEventListener("change", () => recomputeStaging(site));
  recomputeStaging(site);
}

function recomputeStaging(site) {
  const T = document.getElementById("stg-t").value;
  const N = document.getElementById("stg-n").value;
  const M = document.getElementById("stg-m").value;

  const groupFn = stagingGroupFn(site, calculatorMode);
  const stage = groupFn(T, N, M);
  const treatment = site.treatmentBySt[stage] || "Bu evre kombinasyonu için özet tanımlanmadı.";

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

/* ---------- Site geneli arama ---------- */

const SEARCH_TYPE_LABELS = {
  ozetler: "Özet Kart",
  anatomi: "Anatomi",
  sorular: "Soru",
  tus: "TUS",
  vakalar: "Vaka Sunumu",
  aciller: "Acil",
  "staging-site": "Kanser Evrelemesi",
  "staging-shared": "Kanser Evrelemesi"
};

let searchIndex = [];

function buildSearchIndex() {
  const index = [];

  function addContentItems(items, type, titleField) {
    items.forEach((item) => {
      const sub = SUBSPECIALTIES.find((s) => s.title === item.category);
      index.push({
        type,
        id: item.id,
        title: item[titleField],
        category: item.category,
        subspecialtyId: sub ? sub.id : null,
        matchText: [item[titleField], item.category, item.summary].filter(Boolean).join(" ").toLocaleLowerCase("tr")
      });
    });
  }

  addContentItems(SUMMARY_CARDS, "ozetler", "title");
  addContentItems(ANATOMY, "anatomi", "title");
  addContentItems(QUESTIONS, "sorular", "question");
  addContentItems(TUS_QUESTIONS, "tus", "question");
  addContentItems(CASES, "vakalar", "title");
  addContentItems(EMERGENCIES, "aciller", "title");

  index.push({
    type: "staging-shared",
    id: "shared-nodal",
    title: SHARED_NODAL_CHAPTER.title,
    category: "Kanser Evrelemesi",
    matchText: [SHARED_NODAL_CHAPTER.title, ...SHARED_NODAL_CHAPTER.introPoints].join(" ").toLocaleLowerCase("tr")
  });

  STAGING_SITES.forEach((site) => {
    index.push({
      type: "staging-site",
      id: site.id,
      title: site.title,
      category: "Kanser Evrelemesi",
      matchText: [site.title, site.summary].filter(Boolean).join(" ").toLocaleLowerCase("tr")
    });
  });

  return index;
}

function searchResultTitle(entry) {
  return entry.title.length > 90 ? `${entry.title.slice(0, 90).trimEnd()}…` : entry.title;
}

function runSiteSearch(query) {
  const resultsBox = document.getElementById("site-search-results");
  const q = query.trim().toLocaleLowerCase("tr");

  if (q.length < 2) {
    resultsBox.hidden = true;
    resultsBox.innerHTML = "";
    return;
  }

  const matches = searchIndex.filter((entry) => entry.matchText.includes(q)).slice(0, 20);

  if (matches.length === 0) {
    resultsBox.innerHTML = `<p class="site-search-empty">Sonuç bulunamadı.</p>`;
    resultsBox.hidden = false;
    return;
  }

  resultsBox.innerHTML = matches
    .map(
      (entry, i) => `
    <button type="button" class="site-search-result" data-index="${i}">
      <div class="site-search-result-title">${searchResultTitle(entry)}</div>
      <div class="site-search-result-meta">${SEARCH_TYPE_LABELS[entry.type]}${
        entry.type !== "staging-site" && entry.type !== "staging-shared" ? ` · ${entry.category}` : ""
      }</div>
    </button>`
    )
    .join("");

  resultsBox.querySelectorAll(".site-search-result").forEach((btn) => {
    btn.addEventListener("click", () => goToSearchResult(matches[Number(btn.dataset.index)]));
  });

  resultsBox.hidden = false;
}

function goToSearchResult(entry) {
  document.getElementById("site-search-results").hidden = true;
  document.getElementById("site-search-input").value = "";

  if (entry.type === "staging-site" || entry.type === "staging-shared") {
    switchPrimary("evreleme");
    selectStagingRefNav(entry.id);
    return;
  }

  switchPrimary("bolumler");
  enterSubspecialty(entry.subspecialtyId);
  switchSection(entry.type);

  requestAnimationFrame(() => {
    const container = document.getElementById(entry.type);
    const target = container.querySelector(`[data-id="${entry.id}"]`);
    if (!target) return;
    if (entry.type === "ozetler" || entry.type === "anatomi" || entry.type === "aciller") {
      target.click();
    } else {
      target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  });
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

  searchIndex = buildSearchIndex();
  document.getElementById("site-search-input").addEventListener("input", (e) => {
    runSiteSearch(e.target.value);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".site-search")) {
      document.getElementById("site-search-results").hidden = true;
    }
  });
  document.getElementById("site-search-input").addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.target.blur();
      document.getElementById("site-search-results").hidden = true;
    }
  });

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
