// GOOGLE přihlášení
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then(result => {
            console.log("Přihlášen přes Google:", result.user.uid);
        })
        .catch(error => {
            console.error("Chyba při přihlášení přes Google:", error);
        });
}

// EMAIL přihlášení (příklad – vstupy musíš mít v HTML)
function signInWithEmail() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(result => {
            console.log("Přihlášen přes E-mail:", result.user.uid);
        })
        .catch(error => {
            console.error("Chyba při přihlášení e-mailem:", error);
        });
}
