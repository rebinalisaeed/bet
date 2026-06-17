import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

    import {
      getAuth,
      createUserWithEmailAndPassword
    } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

    import {
      getFirestore,
      doc,
      setDoc,
      collection,
      query,
      where,
      getDocs
    } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
    const db = getFirestore(app);

    async function checkIfExists(fieldName, value) {
      const q = query(
        collection(db, "users"),
        where(fieldName, "==", value)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    }

    function scrollToField(id) {
      const wrap = document.getElementById("wrap-" + id);
      if (wrap) {
        wrap.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    window.registerUser = async function(event) {
      event.preventDefault();
      clearAllErrors();

      const registerBtn = document.getElementById("registerBtn");
      registerBtn.disabled = true;
      registerBtn.textContent = "تکایە چاوەڕێ بکە...";

      const firstName = document.getElementById("firstName").value.trim();
      const secondName = document.getElementById("secondName").value.trim();
      const username = document.getElementById("username").value.trim().toLowerCase();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const country = document.getElementById("country").value;
      const city = document.getElementById("city").value;
      const nationalId = document.getElementById("nationalId").value.trim();
      const terms = document.getElementById("terms").checked;

      try {
        if (!firstName) {
          showError("firstName", "تکایە ناوی یەکەم بنووسە");
          scrollToField("firstName");
          return;
        }

        if (!secondName) {
          showError("secondName", "تکایە ناوی دووەم بنووسە");
          scrollToField("secondName");
          return;
        }

        if (!username) {
          showError("username", "تکایە یوزەرناو بنووسە");
          scrollToField("username");
          return;
        }

        if (!password) {
          showError("password", "تکایە پاسوۆرد بنووسە");
          scrollToField("password");
          return;
        }

        if (password.length < 6) {
          showError("password", "پاسوۆرد دەبێت لانیکەم ٦ پیت یان ژمارە بێت");
          scrollToField("password");
          return;
        }

        if (!confirmPassword) {
          showError("confirmPassword", "تکایە پاسوۆرد دووبارە بنووسە");
          scrollToField("confirmPassword");
          return;
        }

        if (password !== confirmPassword) {
          showError("confirmPassword", "پاسوۆردەکان وەک یەک نین");
          scrollToField("confirmPassword");
          return;
        }

        if (!phone) {
          showError("phone", "تکایە ژمارەی مۆبایل بنووسە");
          scrollToField("phone");
          return;
        }

        if (!email) {
          showError("email", "تکایە ئیمەیڵ بنووسە");
          scrollToField("email");
          return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
          showError("email", "ئیمەیڵەکە دروست نییە");
          scrollToField("email");
          return;
        }

        if (!country) {
          showError("country", "تکایە وڵات هەڵبژێرە");
          scrollToField("country");
          return;
        }

        if (!city) {
          showError("city", "تکایە شار هەڵبژێرە");
          scrollToField("city");
          return;
        }

        if (!nationalId) {
          showError("nationalId", "تکایە ژمارەی پێناس بنووسە");
          scrollToField("nationalId");
          return;
        }

        if (!/^[0-9]+$/.test(nationalId)) {
          showError("nationalId", "ژمارەی پێناس دەبێت تەنها ژمارە بێت");
          scrollToField("nationalId");
          return;
        }

        if (!terms) {
          showError("terms", "پێویستە ڕازی بیت بە مەرج و ڕێساکانی Kurdliga");
          scrollToField("terms");
          return;
        }

        const usernameExists = await checkIfExists("username", username);

        if (usernameExists) {
          showError("username", "ئەم یوزەرناوە پێشتر بەکارهاتووە");
          scrollToField("username");
          return;
        }

        const nationalIdExists = await checkIfExists("nationalId", nationalId);

        if (nationalIdExists) {
          showError("nationalId", "ئەم ژمارەی پێناسە پێشتر تۆمارکراوە");
          scrollToField("nationalId");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", userCredential.user.uid), {
          firstName: firstName,
          secondName: secondName,
          username: username,
          phone: phone,
          email: email,
          country: country,
          city: city,
          nationalId: nationalId,

          coins: 1000,
          diamonds: 0,
          lastDailyReward: null,

          rank: 0,
          badges: [],
          isAdmin: false,
          createdAt: Date.now()
        });

        document.getElementById("successModal").classList.add("show");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1800);

      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          showError("email", "ئەم ئیمەیڵە پێشتر بەکارهاتووە");
          scrollToField("email");
        } else if (error.code === "auth/invalid-email") {
          showError("email", "ئیمەیڵەکە دروست نییە");
          scrollToField("email");
        } else if (error.code === "auth/weak-password") {
          showError("password", "پاسوۆرد زۆر لاوازە");
          scrollToField("password");
        } else {
          alert("هەڵەیەک ڕوویدا: " + error.message);
        }
      } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = "خۆتۆمارکردن";
      }
    };
