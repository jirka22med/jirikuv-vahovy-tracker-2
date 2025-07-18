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
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

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

    // Správa hlavních UI panelů
    if (loginSection && dashboardSection && userNameSpan) {
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";
      userNameSpan.textContent = user.displayName || user.email;
    }

    // Správa alternativních UI panelů
    if (loginPanel && userPanel && userEmail) {
      loginPanel.style.display = "none";
      userPanel.style.display = "block";
      userEmail.textContent = user.email;
    }

  } else {
    console.log("🔴 Uživatel odhlášen.");

    if (loginSection && dashboardSection && userNameSpan) {
      loginSection.style.display = "block";
      dashboardSection.style.display = "none";
      userNameSpan.textContent = "";
    }

    if (loginPanel && userPanel && userEmail) {
      loginPanel.style.display = "block";
      userPanel.style.display = "none";
      userEmail.textContent = "";
    }
  }
});

// ✅ Odhlášení – inicializace po načtení DOM
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-button");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", signOut);
  } else {
    console.warn("⚠️ logout-button není v DOM.");
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.getElementById("google-login-button");
  const emailBtn = document.getElementById("login-button");
  const logoutBtn = document.getElementById("logout-button");

  if (googleBtn) {
    googleBtn.addEventListener("click", signInWithGoogle);
  } else {
    console.warn("⚠️ google-login-button nenalezen.");
  }

  if (emailBtn) {
    emailBtn.addEventListener("click", signInWithEmail);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", signOut);
  }
});
