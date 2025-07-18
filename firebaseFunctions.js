// === firebaseFunctions.js: warp-ready Firestore funkce ===

const firebaseConfig = {
    apiKey: "AIzaSyBCIHWbqCFJcCiuY-HFM3btTzUsByduluY",
    authDomain: "moje-vaha-beta-2.firebaseapp.com",
    projectId: "moje-vaha-beta-2",
    storageBucket: "moje-vaha-beta-2.firebasestorage.app",
    messagingSenderId: "870509063847",
    appId: "1:870509063847:web:6e0f922a1b8637e2713582"
};

console.log("📦 FirebaseConfig připraven pro projekt:", firebaseConfig.projectId);

let db;

window.initializeFirebaseApp = function () {
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp === 'undefined') {
        console.error("🚨 Firebase SDK není načteno – inicializace selhala.");
        return false;
    }
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase aplikace inicializována.");
    } else {
        console.log("ℹ️ Firebase aplikace již inicializována – přeskočeno.");
    }
    db = firebase.firestore();
    console.log("✅ Firestore připraven.");
    return true;
};

function getCurrentUserUID() {
    const user = firebase.auth().currentUser;
    if (!user) console.warn("⚠️ Uživatel není přihlášen – UID null");
    return user ? user.uid : null;
}

window.saveWeightLogToFirestore = async function (weightLogArray) {
    const uid = getCurrentUserUID();
    if (!db || !uid) {
        console.error("💾 saveWeightLogToFirestore: Chybí přihlášení nebo databáze.");
        return;
    }
    try {
        const userRef = db.collection('users').doc(uid).collection('weightEntries');
        const batch = db.batch();
        const existingDocs = await userRef.get();
        existingDocs.forEach(doc => batch.delete(doc.ref));
        weightLogArray.forEach(entry => {
            const docRef = userRef.doc(entry.date);
            batch.set(docRef, entry);
        });
        await batch.commit();
        console.log("✅ Váhová data uložena pro UID:", uid);
    } catch (error) {
        console.error("❌ Chyba při ukládání váhových dat:", error);
    }
};

window.loadWeightLogFromFirestore = async function () {
    const uid = getCurrentUserUID();
    if (!db || !uid) {
        console.error("📤 loadWeightLogFromFirestore: Uživatel nepřihlášen nebo db není inicializována.");
        return [];
    }
    try {
        const userRef = db.collection('users').doc(uid).collection('weightEntries');
        const snapshot = await userRef.orderBy('date').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("❌ Chyba při načítání váhových dat:", error);
        return [];
    }
};

window.saveSettingsToFirestore = async function (settingsObject) {
    const uid = getCurrentUserUID();
    if (!db || !uid) {
        console.error("saveSettingsToFirestore: Uživatel nepřihlášen nebo db není inicializována.");
        return;
    }
    const docRef = db.collection('users').doc(uid).collection('userSettings').doc('mainSettings');
    await docRef.set(settingsObject, { merge: true });
    console.log("⚙️ Nastavení uloženo pod UID:", uid);
};

window.loadSettingsFromFirestore = async function () {
    const uid = getCurrentUserUID();
    if (!db || !uid) {
        console.error("loadSettingsFromFirestore: Uživatel nepřihlášen nebo db není inicializována.");
        return null;
    }
    const docRef = db.collection('users').doc(uid).collection('userSettings').doc('mainSettings');
    const doc = await docRef.get();
    return doc.exists ? doc.data() : null;
};

window.saveGoalsToFirestore = async function (goalsObject) {
    const uid = getCurrentUserUID();
    if (!db || !uid) {
        console.error("saveGoalsToFirestore: Uživatel nepřihlášen nebo db není inicializována.");
        return;
    }
    const docRef = db.collection('users').doc(uid).collection('userGoals').doc('mainGoals');
    await docRef.set(goalsObject, { merge: true });
    console.log("🎯 Cíle uloženy pod UID:", uid);
};

window.loadGoalsFromFirestore = async function () {
    const uid = getCurrentUserUID();
    if (!db || !uid) {
        console.error("loadGoalsFromFirestore: Uživatel nepřihlášen nebo db není inicializována.");
        return null;
    }
    const docRef = db.collection('users').doc(uid).collection('userGoals').doc('mainGoals');
    const doc = await docRef.get();
    return doc.exists ? doc.data() : null;
};

window.deleteWeightEntryFromFirestore = async function (date) {
    const uid = getCurrentUserUID();
    if (!db || !uid) {
        console.error("deleteWeightEntryFromFirestore: Uživatel nepřihlášen nebo db není inicializována.");
        return;
    }
    await db.collection('users').doc(uid).collection('weightEntries').doc(date).delete();
    console.log("🗑️ Smazán váhový záznam:", date);
};

window.clearAllFirestoreData = async function () {
    const uid = getCurrentUserUID();
    if (!db || !uid) {
        console.error("clearAllFirestoreData: Uživatel nepřihlášen nebo db není inicializována.");
        return;
    }
    const collections = ['weightEntries', 'userSettings', 'userGoals'];
    for (const name of collections) {
        const ref = db.collection('users').doc(uid).collection(name);
        const snapshot = await ref.get();
        const batch = db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log(`🧹 Kolekce ${name} vymazána pro UID ${uid}`);
    }
};
