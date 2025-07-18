// === AUTH.JS: warp-ready přihlašovací modul ===

// ⚠️ Zajistit inicializaci Firebase
if (typeof firebase === 'undefined' || !firebase.apps.length) {
  if (typeof initializeFirebaseApp === 'function') {
    initializeFirebaseApp();
  } else {
    console.error("❌ Funkce initializeFirebaseApp() není definována.");
  }
}

// ✅ Přihlášení přes Google
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      console.log("✅ Přihlášen přes Google:", result.user.email);
    })
    .catch(error => {
      console.error("❌ Chyba při přihlášení přes Google:", error);
    });
}

// ✅ Přihlášení přes e-mail/heslo
function signInWithEmail() {
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  if (!emailInput || !passwordInput) {
    console.warn("⚠️ Email nebo heslo input nebyl nalezen v DOM.");
    return;
  }
  const email = emailInput.value;
  const password = passwordInput.value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("✅ Přihlášen e-mailem:", userCredential.user.email);
    })
    .catch(error => {
      console.error("❌ Chyba při přihlášení e-mailem:", error);
    });
}

// ✅ Odhlášení
function signOut() {
  firebase.auth().signOut()
    .then(() => {
      console.log("👋 Uživatel byl odhlášen.");
    })
    .catch(error => {
      console.error("❌ Chyba při odhlášení:", error);
    });
}

// ✅ Změna UI při změně stavu přihlášení
firebase.auth().onAuthStateChanged(user => {
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const userNameSpan = document.getElementById("user-name");
  const loginPanel = document.getElementById("loginPanel");
  const userPanel = document.getElementById("userPanel");
  const userEmail = document.getElementById("userEmail");

  if (user) {
    console.log("🟢 Přihlášen jako:", user.email);

    if (loginSection) loginSection.style.display = "none";
    if (dashboardSection) dashboardSection.style.display = "block";
    if (userNameSpan) userNameSpan.textContent = user.displayName || user.email;

    if (loginPanel) loginPanel.style.display = "none";
    if (userPanel) userPanel.style.display = "block";
    if (userEmail) userEmail.textContent = user.email;

    // ✅ Načíst data až po přihlášení
    if (typeof loadWeightLogFromFirestore === 'function') {
      loadWeightLogFromFirestore();
    }
  } else {
    console.log("🔴 Uživatel odhlášen.");

    if (loginSection) loginSection.style.display = "block";
    if (dashboardSection) dashboardSection.style.display = "none";
    if (userNameSpan) userNameSpan.textContent = "";

    if (loginPanel) loginPanel.style.display = "block";
    if (userPanel) userPanel.style.display = "none";
    if (userEmail) userEmail.textContent = "";
  }
});

// ✅ Přidání listenerů po načtení DOM

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-button");
  const googleBtn = document.getElementById("google-login-button");
  const emailBtn = document.getElementById("login-button");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", signOut);
  } else {
    console.warn("⚠️ logout-button není v DOM.");
  }

  if (googleBtn) {
    googleBtn.addEventListener("click", signInWithGoogle);
  } else {
    console.warn("⚠️ google-login-button nenalezen.");
  }

  if (emailBtn) {
    emailBtn.addEventListener("click", signInWithEmail);
  }
});
