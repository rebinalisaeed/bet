function togglePassword() {
      const password = document.getElementById("password");
      password.type = password.type === "password" ? "text" : "password";
    }

    function showError(id, message) {
      const wrap = document.getElementById("wrap-" + id);
      const box = document.getElementById(id + "Box");
      const error = document.getElementById(id + "Error");

      wrap.classList.add("show-error");
      box.classList.add("error");
      error.textContent = message;
    }

    function clearError(id) {
      const wrap = document.getElementById("wrap-" + id);
      const box = document.getElementById(id + "Box");
      const error = document.getElementById(id + "Error");

      wrap.classList.remove("show-error");
      box.classList.remove("error");
      error.textContent = "";
    }

    document.addEventListener("input", function(e) {
      if (e.target.id === "email") clearError("email");
      if (e.target.id === "password") clearError("password");
    });
