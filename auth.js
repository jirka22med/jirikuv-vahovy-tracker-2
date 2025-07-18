// === AUTH.JS: warp-ready přihlašovací modul ===

// ⚠️ Inicializace Firebase (pokud ještě není)
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
  const email = document.getElementById("emailInput")?.value;
  const password = document.getElementById("passwordInput")?.value;

  if (!email || !password) {
    console.warn("⚠️ E-mail nebo heslo nebylo zadáno.");
    return;
  }

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

// ✅ NOVÁ FUNKCE: Načte všechna data po přihlášení
async function loadAllUserData() {
  try {
    console.log("📦 Začínám načítat uživatelská data...");
    
    // Načti všechna data paralelně
    const [weightData, settings, goals] = await Promise.all([
      loadWeightLogFromFirestore(),
      loadSettingsFromFirestore(),
      loadGoalsFromFirestore()
    ]);
    
    console.log("✅ Váhová data načtena:", weightData);
    console.log("⚙️ Nastavení načtena:", settings);
    console.log("🎯 Cíle načteny:", goals);
    
    // Zavolej funkci pro zobrazení dat (pokud existuje)
    if (typeof loadData === 'function') {
      await loadData();
    }
    
    // Nebo zavolej jednotlivé funkce pro aktualizaci UI
    if (typeof updateWeightChart === 'function') {
      updateWeightChart(weightData);
    }
    
    if (typeof applySettings === 'function') {
      applySettings(settings);
    }
    
    if (typeof updateGoalsDisplay === 'function') {
      updateGoalsDisplay(goals);
    }
    
    console.log("🎉 Všechna data načtena a UI aktualizováno!");
    
  } catch (error) {
    console.error("❌ Chyba při načítání uživatelských dat:", error);
  }
}

// ✅ Sledujeme stav přihlášení a měníme UI + načítáme data
firebase.auth().onAuthStateChanged(async (user) => {
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const userNameSpan = document.getElementById("user-name");
  const loginPanel = document.getElementById("loginPanel");
  const userPanel = document.getElementById("userPanel");
  const userEmail = document.getElementById("userEmail");

  if (user) {
    console.log("🟢 Přihlášen jako:", user.email);

    // UI přepnutí
    if (loginSection && dashboardSection && userNameSpan) {
      loginSection.style.display = "none";
      dashboardSection.style.display = "block";
      userNameSpan.textContent = user.displayName || user.email;
    }

    if (loginPanel && userPanel && userEmail) {
      loginPanel.style.display = "none";
      userPanel.style.display = "block";
      userEmail.textContent = user.email;
    }

    // ✅ OPRAVA: Počkej chvíli a pak načti data
    // Firebase potřebuje chvíli na dokončení inicializace
    setTimeout(async () => {
      await loadAllUserData();
    }, 500);

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

// ✅ Po načtení DOMu napojíme tlačítka
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
  } else {
    console.warn("⚠️ logout-button není v DOM.");
  }
});

// ✅ Globální funkce pro refresh dat
window.refreshUserData = loadAllUserData;
