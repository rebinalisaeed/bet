import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

    import {
      getAuth,
      signInWithEmailAndPassword
    } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

    const firebaseConfig = {
      apiKey: "AIzaSyB2ENjViKDRHwwBUGTjrDJMrnrQePGhDqY",
      authDomain: "kurdliga1.firebaseapp.com",
      databaseURL: "https://kurdliga1-default-rtdb.firebaseio.com",
      projectId: "kurdliga1",
      storageBucket: "kurdliga1.firebasestorage.app",
      messagingSenderId: "799164130957",
      appId: "1:799164130957:web:a3ff5ec1ccb026ca59a4c4",
      measurementId: "G-8TCVRT6GNK"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    window.login = async function(event) {
      event.preventDefault();

      clearError("email");
      clearError("password");

      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value;
      const loginBtn = document.getElementById("loginBtn");

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        showError("email", "تکایە ئیمەیڵ بنووسە");
        return;
      }

      if (!emailPattern.test(email)) {
        showError("email", "ئیمەیڵەکە دروست نییە");
        return;
      }

      if (!password) {
        showError("password", "تکایە وشەی نهێنی بنووسە");
        return;
      }

      try {
        loginBtn.disabled = true;
        loginBtn.textContent = "تکایە چاوەڕێ بکە...";

        await signInWithEmailAndPassword(auth, email, password);

        localStorage.setItem("kurdligaLoggedIn", "true");

        window.location.href = "home.html";

      } catch (error) {
        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/user-not-found"
        ) {
          showError("password", "ئیمەیڵ یان وشەی نهێنی هەڵەیە");
        } else if (error.code === "auth/invalid-email") {
          showError("email", "ئیمەیڵەکە دروست نییە");
        } else if (error.code === "auth/too-many-requests") {
          showError("password", "هەوڵی زۆرت داوە، تکایە دواتر هەوڵ بدەوە");
        } else {
          showError("password", "هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەوە");
        }
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "چوونەژوورەوە";
      }
    };
