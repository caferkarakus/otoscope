/*
  GİRİŞ / KAYIT (Firebase Authentication)
  ----------------------------------------
  Bu dosya, e-posta/şifre ile kayıt olma, giriş yapma ve çıkış yapmayı
  yönetir. Firebase projesi değişirse (örn. yeni bir proje açarsanız)
  sadece aşağıdaki FIREBASE_CONFIG nesnesini güncellemeniz yeterli.
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCroJ09HMKjeWaCYLlwHxjeGIexp2sP3MY",
  authDomain: "helix-12378.firebaseapp.com",
  projectId: "helix-12378",
  storageBucket: "helix-12378.firebasestorage.app",
  messagingSenderId: "124009523600",
  appId: "1:124009523600:web:712d0b3807acf427adab15",
  measurementId: "G-2D47FPN5HJ"
};

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);

const ERROR_MESSAGES = {
  "auth/email-already-in-use": "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.",
  "auth/invalid-email": "Geçerli bir e-posta adresi girin.",
  "auth/weak-password": "Şifre en az 6 karakter olmalı.",
  "auth/user-not-found": "Bu e-posta ile kayıtlı bir hesap bulunamadı.",
  "auth/wrong-password": "Şifre hatalı.",
  "auth/invalid-credential": "E-posta veya şifre hatalı.",
  "auth/too-many-requests": "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin."
};

function authErrorMessage(error) {
  return ERROR_MESSAGES[error.code] || "Bir şeyler ters gitti, lütfen tekrar deneyin.";
}

let mode = "signin"; // "signin" | "signup"

function openAuthModal() {
  document.getElementById("auth-error").hidden = true;
  document.getElementById("auth-success").hidden = true;
  document.getElementById("auth-form").hidden = false;
  document.querySelector(".auth-tabs").hidden = false;
  document.getElementById("auth-form").reset();
  document.getElementById("auth-modal-overlay").classList.add("visible");
}

function closeAuthModal() {
  document.getElementById("auth-modal-overlay").classList.remove("visible");
}

function showVerificationNotice(email) {
  document.getElementById("auth-form").hidden = true;
  document.querySelector(".auth-tabs").hidden = true;
  const successEl = document.getElementById("auth-success");
  successEl.innerHTML = `
    <p>Kayıt başarılı! <strong>${email}</strong> adresine bir doğrulama bağlantısı gönderdik. Gelen kutunuzu (ve spam klasörünü) kontrol edip hesabınızı doğrulayın.</p>
    <button type="button" class="auth-submit" id="auth-success-close">Kapat</button>
  `;
  successEl.hidden = false;
  document.getElementById("auth-success-close").addEventListener("click", closeAuthModal);
}

function setMode(newMode) {
  mode = newMode;
  document.querySelectorAll(".auth-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  document.getElementById("auth-submit-btn").textContent = mode === "signin" ? "Giriş Yap" : "Kayıt Ol";
  document.getElementById("auth-error").hidden = true;

  const isSignup = mode === "signup";
  document.getElementById("auth-username-field").hidden = !isSignup;
  document.getElementById("auth-username").required = isSignup;
}

function renderAuthArea(user) {
  const area = document.getElementById("auth-area");
  if (user) {
    const verifiedBadge = user.emailVerified
      ? ""
      : `<span class="auth-unverified">doğrulanmadı</span> <button id="resend-btn" class="link-btn" type="button">doğrulama e-postasını gönder</button>`;
    const label = user.displayName || user.email;
    area.innerHTML = `
      <span class="auth-user" title="${user.email}">${label}</span>
      ${verifiedBadge}
      <button id="logout-btn" class="back-btn" type="button">Çıkış</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => signOut(auth));

    const resendBtn = document.getElementById("resend-btn");
    if (resendBtn) {
      resendBtn.addEventListener("click", async () => {
        resendBtn.disabled = true;
        resendBtn.textContent = "gönderildi ✓";
        try {
          await sendEmailVerification(user);
        } catch (error) {
          resendBtn.textContent = "doğrulama e-postasını gönder";
          resendBtn.disabled = false;
        }
      });
    }
  } else {
    area.innerHTML = `<button id="login-btn" class="login-btn" type="button">Giriş</button>`;
    document.getElementById("login-btn").addEventListener("click", openAuthModal);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".auth-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  document.getElementById("auth-modal-close").addEventListener("click", closeAuthModal);
  document.getElementById("auth-modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "auth-modal-overlay") closeAuthModal();
  });

  document.getElementById("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const errorEl = document.getElementById("auth-error");
    const submitBtn = document.getElementById("auth-submit-btn");

    errorEl.hidden = true;
    submitBtn.disabled = true;

    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
        closeAuthModal();
      } else {
        const username = document.getElementById("auth-username").value.trim();
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: username });
        renderAuthArea(credential.user);
        await sendEmailVerification(credential.user);
        showVerificationNotice(email);
      }
    } catch (error) {
      errorEl.textContent = authErrorMessage(error);
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
    }
  });

  onAuthStateChanged(auth, renderAuthArea);
});
