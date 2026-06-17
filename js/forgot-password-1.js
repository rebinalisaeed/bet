import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

    import {
      getAuth,
      sendPasswordResetEmail
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

    function showError(message) {
      const wrap = document.getElementById("wrap-email");
      const box = document.getElementById("emailBox");
      const error = document.getElementById("emailError");

      wrap.classList.add("show-error");
      box.classList.add("error");
      error.textContent = message;
    }

    function clearError() {
      const wrap = document.getElementById("wrap-email");
      const box = document.getElementById("emailBox");
      const error = document.getElementById("emailError");

      wrap.classList.remove("show-error");
      box.classList.remove("error");
      error.textContent = "";
    }

    document.getElementById("email").addEventListener("input", clearError);

    window.resetPassword = async function(event) {
      event.preventDefault();
      clearError();

      const email = document.getElementById("email").value.trim().toLowerCase();
      const sendBtn = document.getElementById("sendBtn");

      if (!email) {
        showError("تکایە ئیمەیڵ بنووسە");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(email)) {
  showError("ئیمەیڵەکە دروست نییە");
  return;
}

      try {
        sendBtn.disabled = true;
        sendBtn.textContent = "تکایە چاوەڕێ بکە...";

        await sendPasswordResetEmail(auth, email);

        document.getElementById("successModal").classList.add("show");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 2500);

      } catch (error) {
        if (error.code === "auth/user-not-found") {
          showError("هیچ هەژمارێک بەم ئیمەیڵە نەدۆزرایەوە");
        } else if (error.code === "auth/invalid-email") {
          showError("ئیمەیڵەکە دروست نییە");
        } else {
          showError("هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵ بدەوە");
        }
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "ناردنی لینکی گەڕاندنەوە";
      }
    };
