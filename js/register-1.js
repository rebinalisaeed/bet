const cities = {
      "باشوری کوردستان": ["هەولێر", "سلێمانی", "دهۆک", "هەڵەبجە", "کەرکوک", "موسڵ"],
      "باکوری کوردستان": ["ئامەد", "ئاگری", "وان", "جۆلەمێرگ", "شڕناخ", "مێردین", "مامەکی", "سەمسوور", "سێرت", "بەدلیس", "مووش", "ئەرزنگان", "چەولیگ", "ڕحا", "ئەنتاکیا", "مەرعەش", "ڕەشقەلاس", "قەرس", "ئەرزیڕۆم", "سێواس", "مەلەتی", "ئەردێخان", "ئێلح", "دیلۆک", "خارپێت"],
      "ڕۆژهەڵاتی کوردستان": ["کرماشان", "سنە", "مەهاباد", "ورمێ", "ئیلام", "سەقز", "بۆکان", "مەریوان", "بانە", "پاوە", "پیرانشار", "سەردەشت", "کامیاران", "شنۆ", "جوانڕۆ", "خۆی"],
      "ڕۆژئاوای کوردستان": ["قامیشلۆ", "کۆبانێ", "عەفرین", "حەسەکە", "سەرێ کانیێ", "عاموودا", "دێرک (مالیکیە)", "عەین عیسا", "دەرباسیێ"]
    };

    function loadCities() {
      const country = document.getElementById("country").value;
      const citySelect = document.getElementById("city");

      citySelect.innerHTML = '<option value="">شار هەڵبژێرە</option>';

      if (cities[country]) {
        cities[country].forEach(city => {
          const option = document.createElement("option");
          option.value = city;
          option.textContent = city;
          citySelect.appendChild(option);
        });
      }

      clearError("country");
      clearError("city");
    }

    function togglePassword(id) {
      const input = document.getElementById(id);
      input.type = input.type === "password" ? "text" : "password";
    }

    function showError(id, message) {
      const wrap = document.getElementById("wrap-" + id);
      const box = wrap.querySelector(".input-box, .select-box");
      const text = wrap.querySelector(".error-text");

      wrap.classList.add("show-error");
      if (box) box.classList.add("error");
      text.textContent = message;
    }

    function clearError(id) {
      const wrap = document.getElementById("wrap-" + id);
      if (!wrap) return;

      const box = wrap.querySelector(".input-box, .select-box");
      const text = wrap.querySelector(".error-text");

      wrap.classList.remove("show-error");
      if (box) box.classList.remove("error");
      text.textContent = "";
    }

    function clearAllErrors() {
      [
        "firstName",
        "secondName",
        "username",
        "password",
        "confirmPassword",
        "phone",
        "email",
        "country",
        "city",
        "nationalId",
        "terms"
      ].forEach(clearError);
    }

    document.addEventListener("input", function(e) {
      if (e.target.id) clearError(e.target.id);
    });

    document.addEventListener("change", function(e) {
      if (e.target.id) clearError(e.target.id);
    });
