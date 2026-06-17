import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
    import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

    window.logoutUser = async function() {
      await signOut(auth);
      localStorage.removeItem("kurdligaLoggedIn");
      window.location.href = "login.html";
    };

    window.toggleSideMenu = function() {
      document.getElementById("sideMenu")?.classList.toggle("show");
      document.getElementById("sideOverlay")?.classList.toggle("show");
      document.getElementById("menuBtn")?.classList.toggle("active");
      document.getElementById("headerLogo")?.classList.toggle("menu-open");
    };

    window.closeSideMenu = function() {
      document.getElementById("sideMenu")?.classList.remove("show");
      document.getElementById("sideOverlay")?.classList.remove("show");
      document.getElementById("menuBtn")?.classList.remove("active");
      document.getElementById("headerLogo")?.classList.remove("menu-open");
    };

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        document.getElementById("coinsText").textContent = data.coins || 0;
        document.getElementById("diamondsText").textContent = data.diamonds || 0;
      }
    });
