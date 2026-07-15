/*
  UYGULAMA MANTIĞI
  ----------------
  Bu dosya, data/ klasöründeki içerikleri okuyup ekrana kart olarak çizer,
  sekmeler arası geçişi ve soru/detay etkileşimlerini yönetir.
  Yeni bir BÖLÜM eklemek isterseniz (örn. "Sınavlar"), aşağıdaki RENDERERS
  nesnesine yeni bir fonksiyon eklemeniz ve index.html'e ilgili sekme/section'ı
  eklemeniz yeterlidir.
*/

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
  veya nokta/ok butonlarıyla). "sorular" ve "vakalar" bölümleri bunu kullanır.
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

const RENDERERS = {
  ozetler(container) {
    container.innerHTML = `
      <p class="section-intro">Konu başlıklarına tıklayarak detaylı özeti görüntüleyin.</p>
      <div class="grid">
        ${SUMMARY_CARDS.map(
          (card) => `
          <div class="card" data-id="${card.id}">
            ${cardThumb(card.image, card.title)}
            <span class="tag">${card.category}</span>
            <h3>${card.title}</h3>
            <p>${card.summary}</p>
          </div>`
        ).join("")}
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
    container.innerHTML = `
      <p class="section-intro">Bir bölgeye tıklayarak yapıları ve işlevlerini görüntüleyin.</p>
      <div class="grid">
        ${ANATOMY.map(
          (item) => `
          <div class="card" data-id="${item.id}">
            ${cardThumb(item.image, item.title)}
            <span class="tag">${item.category}</span>
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
          </div>`
        ).join("")}
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
    container.innerHTML = `
      <p class="section-intro">Kaydırarak sorular arasında gezinin, bir şıkka dokunarak cevabınızı kontrol edin.</p>
      <div class="swipe-wrap">
        <div class="swipe-track">
          ${QUESTIONS.map(
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
          ).join("")}
        </div>
        ${swipeChrome(QUESTIONS.length)}
      </div>
    `;

    container.querySelectorAll(".question-card").forEach((qCard) => {
      const q = QUESTIONS.find((item) => item.id === qCard.dataset.id);
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
  },

  vakalar(container) {
    container.innerHTML = `
      <p class="section-intro">Kaydırarak vakalar arasında gezinin.</p>
      <div class="swipe-wrap">
        <div class="swipe-track">
          ${CASES.map(
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
          ).join("")}
        </div>
        ${swipeChrome(CASES.length)}
      </div>
    `;

    setupSwipe(container.querySelector(".swipe-wrap"));
  },

  aciller(container) {
    container.innerHTML = `
      <p class="section-intro">Acil durumun üzerine tıklayarak alarm bulgularını ve ilk yaklaşımı görüntüleyin.</p>
      <div class="grid">
        ${EMERGENCIES.map(
          (e) => `
          <div class="card emergency" data-id="${e.id}">
            <span class="tag">${e.category}</span>
            <h3>${e.title}</h3>
            <p>${e.redFlags[0]}</p>
          </div>`
        ).join("")}
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
  }
};

function switchSection(sectionId) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === sectionId);
  });
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.toggle("active", sec.id === sectionId);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  Object.keys(RENDERERS).forEach((sectionId) => {
    const container = document.getElementById(sectionId);
    RENDERERS[sectionId](container);
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchSection(btn.dataset.section));
  });

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeModal();
  });
});
