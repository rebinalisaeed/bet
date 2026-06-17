import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

    import {
      getAuth,
      onAuthStateChanged,
      setPersistence,
      browserLocalPersistence,
      signOut
    } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

    import {
      getFirestore,
      doc,
      getDoc,
      updateDoc,
      collection,
      addDoc,
      serverTimestamp
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

    await setPersistence(auth, browserLocalPersistence);

    let currentUser = null;
    let currentUserData = null;

    window.logoutUser = async function() {
      await signOut(auth);
      localStorage.removeItem("kurdligaLoggedIn");
      window.location.href = "login.html";
    };

    window.executeSlip = async function() {
      try {
        if (!currentUser || !currentUserData) {
          showMessage("هەڵە", "تکایە دووبارە بچۆ ژوورەوە");
          return;
        }

        const stake = Number(document.getElementById("stakeInput").value || 0);
        const totalPoint = getSlipTotalPoint();
        const possibleWin = Math.floor(stake * totalPoint);
        const currentCoins = Number(currentUserData.coins || 0);

        if (stake <= 0 || slip.length === 0) {
          showMessage("هەڵە", "پسولەکە بەتاڵە");
          return;
        }

        if (stake > currentCoins) {
          showMessage("کۆین ناکات", "بڕی کۆینەکەت کەمترە لە بڕی پسولەکە");
          document.getElementById("betSlipPanel").classList.add("show");
          document.body.classList.add("no-scroll");
          return;
        }

        const archiveData = {
          userId: currentUser.uid,
          items: slip,
          stake,
          totalPoint: Number(totalPoint.toFixed(2)),
          possibleWin,
          status: "pending",
          createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "users", currentUser.uid, "predictionArchive"), archiveData);

        const newCoins = currentCoins - stake;

        await updateDoc(doc(db, "users", currentUser.uid), {
          coins: newCoins
        });

        currentUserData.coins = newCoins;
        document.getElementById("coinsText").textContent = newCoins;

        slip = [];
        document.getElementById("stakeInput").value = "";
        clearSlipStorage();
        renderSlip();
        renderMatches(selectedOffset);

        showMessage("سەرکەوتوو بوو", "پسولەکە جێبەجێ کرا و چووە بەشی ئەرشیف");
      } catch (error) {
  console.error("Slip Error:", error);

  showMessage(
    "هەڵە",
    error.code + " - " + error.message
  );
}
    };

    function getBaghdadDateInfo() {
      const now = new Date();

      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Baghdad",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(now);

      const data = {};
      parts.forEach(part => data[part.type] = part.value);

      return {
        dateKey: `${data.year}-${data.month}-${data.day}`,
        hour: Number(data.hour)
      };
    }

    async function checkDailyReward(userRef, userData) {
      const info = getBaghdadDateInfo();

      if (info.hour < 6) return userData;
      if (userData.lastDailyReward === info.dateKey) return userData;

      const currentCoins = Number(userData.coins || 0);
      const newCoins = currentCoins + 100;

      await updateDoc(userRef, {
        coins: newCoins,
        lastDailyReward: info.dateKey
      });

      document.getElementById("modalTitle").textContent = "کۆینی ڕۆژانە";
      document.getElementById("rewardModalText").textContent =
        "١٠٠ کۆینی ڕۆژانەت زیادکرا";

      document.getElementById("rewardModal").classList.add("show");

      return { ...userData, coins: newCoins, lastDailyReward: info.dateKey };
    }

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }

      currentUser = user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      currentUserData = userSnap.data();
      currentUserData = await checkDailyReward(userRef, currentUserData);

      document.getElementById("coinsText").textContent = currentUserData.coins || 0;
      document.getElementById("diamondsText").textContent = currentUserData.diamonds || 0;
    });
