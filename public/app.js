// ========================================
// AdMakerAI - Main JavaScript
// ========================================


// ========================================
// 📝 GENERATE ADVERTISEMENT
// ========================================

document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("adForm");

  if (!form) {
    console.error("AdMakerAI: adForm नहीं मिला।");
    return;
  }

  const generateButton =
    form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const resultBox = document.getElementById("result");
    const resultText = document.getElementById("script");
    const variationsBox = document.getElementById("adVariations");

    const productName =
      document.getElementById("productName")?.value.trim() || "";

    const productDescription =
  document.getElementById("details")?.value.trim() || "";

    const price =
      document.getElementById("price")?.value.trim() || "";

    const adStyle =
      document.getElementById("adStyle")?.value || "";

    const adTemplate =
      document.getElementById("adTemplate")?.value || "";

    const language =
      document.getElementById("language")?.value || "";

    const productLink =
      document.getElementById("productLink")?.value.trim() || "";

    if (!productName || !productDescription) {
      alert("Please enter product name and product description.");
      return;
    }

    if (resultBox) {
      resultBox.style.display = "block";
    }

    if (variationsBox) {
      variationsBox.innerHTML = "";
    }

    if (resultText) {
      resultText.textContent = "";
    }

    // 🆕 Loading spinner
    setButtonLoading(
      generateButton,
      "AI advertisement बना रहा है..."
    );

    try {

      const response = await fetch(
  "/api/generate-ad",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            productName,
            productDescription,
            adStyle,
            adTemplate,
            language
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          (data.error || "Something went wrong") +
          (data.debug ? "\n\nDebug: " + JSON.stringify(data.debug) : "")
        );
      }

      const ads =
        data.ads && data.ads.length > 0
          ? data.ads
          : [data.ad || "Advertisement generate नहीं हुआ।"];

      // 🆕 3 variations render karo
      renderAdVariations(ads);

      // 🆕 History mein save karo
      saveToHistory({
        productName,
        productDescription,
        price,
        productLink,
        adStyle,
        adTemplate,
        language,
        ads
      });

      // Order button (agar product link diya gaya ho)
      const orderButton =
        document.getElementById("orderButton");

      const shareButtons =
        document.getElementById("shareButtons");

      if (shareButtons) {
        shareButtons.style.display = "block";
      }

      if (orderButton) {

        if (productLink) {

          orderButton.style.display = "block";

          orderButton.onclick = function () {
            window.open(productLink, "_blank");
          };

        } else {

          orderButton.style.display = "none";
        }
      }

    } catch (error) {

      console.error(
        "AdMakerAI Generate Error:",
        error
      );

      if (resultText) {
        resultText.textContent =
          "❌ Error: " +
          (error?.message || "AI से connection नहीं हो पाया।");
      }

    } finally {

      restoreButton(
        generateButton,
        "✨ Generate Advertisement"
      );
    }

  });

});


// ========================================
// 🆕 LOADING SPINNER HELPERS
// ========================================

function setButtonLoading(button, message) {

  if (!button) return;

  button.disabled = true;

  button.dataset.originalHtml = button.innerHTML;

  button.innerHTML =
    '<span class="spinner"></span> ' + message;
}


function restoreButton(button, fallbackText) {

  if (!button) return;

  button.disabled = false;

  button.innerHTML =
    button.dataset.originalHtml || fallbackText;
}


// ========================================
// 🆕 MULTIPLE AD VARIATIONS
// ========================================

function renderAdVariations(ads) {

  const variationsBox =
    document.getElementById("adVariations");

  const scriptEl =
    document.getElementById("script");

  if (!variationsBox) {

    if (scriptEl) {
      scriptEl.textContent = ads[0] || "";
    }

    return;
  }

  if (ads.length <= 1) {

    variationsBox.innerHTML = "";

    if (scriptEl) {
      scriptEl.textContent = ads[0] || "";
    }

    return;
  }

  variationsBox.innerHTML =
    ads.map(function (adText, index) {

      const safeText =
        adText
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

      return `
        <div class="ad-variation-card" data-index="${index}">
          <div class="ad-variation-label">Option ${index + 1}</div>
          <div class="ad-variation-text">${safeText}</div>
          <button type="button" class="use-variation-btn" data-index="${index}">
            ✅ Use This Version
          </button>
        </div>
      `;

    }).join("");

  selectVariation(ads, 0);

  const buttons =
    variationsBox.querySelectorAll(".use-variation-btn");

  buttons.forEach(function (btn) {

    btn.addEventListener("click", function () {

      const idx =
        parseInt(this.getAttribute("data-index"), 10);

      selectVariation(ads, idx);
    });
  });
}


function selectVariation(ads, index) {

  const scriptEl =
    document.getElementById("script");

  if (scriptEl) {
    scriptEl.textContent = ads[index] || "";
  }

  const cards =
    document.querySelectorAll(".ad-variation-card");

  cards.forEach(function (card, i) {

    card.classList.toggle(
      "selected",
      i === index
    );
  });

  // 🆕 Analytics
  if (window.incrementStat) {
    window.incrementStat("adsGenerated");
  }
}


window.renderAdVariations = renderAdVariations;
window.selectVariation = selectVariation;


// ========================================
// 🆕 HISTORY (localStorage, browser-only)
// ========================================

const HISTORY_KEY = "admakerai_history";
const HISTORY_LIMIT = 20;

function saveToHistory(entry) {

  try {

    const existing =
      JSON.parse(
        localStorage.getItem(HISTORY_KEY) || "[]"
      );

    existing.unshift({
      ...entry,
      date: new Date().toISOString()
    });

    const trimmed =
      existing.slice(0, HISTORY_LIMIT);

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(trimmed)
    );

    renderHistoryPanel();

  } catch (storageError) {

    console.error(
      "History save error:",
      storageError
    );
  }
}


function getHistory() {

  try {

    return JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]"
    );

  } catch (storageError) {

    return [];
  }
}


function renderHistoryPanel() {

  // 🆕 Stats bhi saath mein update karo
  if (typeof renderStats === "function") {
    renderStats();
  }

  const panel =
    document.getElementById("historyList");

  if (!panel) return;

  const history = getHistory();

  if (history.length === 0) {

    panel.innerHTML =
      '<p style="text-align:center; color:#aaa0c5; padding:20px;">कोई saved ad नहीं है।</p>';

    return;
  }

  panel.innerHTML =
    history.map(function (item, index) {

      const dateLabel =
        new Date(item.date).toLocaleString();

      return `
        <div class="history-item">
          <div class="history-item-title">${item.productName}</div>
          <div class="history-item-date">${dateLabel}</div>
          <div class="history-item-buttons">
            <button type="button" class="history-load-btn" data-index="${index}">
              📂 Load
            </button>
            <button type="button" class="history-delete-btn" data-index="${index}">
              🗑️ Delete
            </button>
          </div>
        </div>
      `;

    }).join("");

  panel.querySelectorAll(".history-load-btn").forEach(function (btn) {

    btn.addEventListener("click", function () {

      const idx =
        parseInt(this.getAttribute("data-index"), 10);

      loadHistoryItem(idx);
    });
  });

  panel.querySelectorAll(".history-delete-btn").forEach(function (btn) {

    btn.addEventListener("click", function () {

      const idx =
        parseInt(this.getAttribute("data-index"), 10);

      deleteHistoryItem(idx);
    });
  });
}


function loadHistoryItem(index) {

  const history = getHistory();
  const item = history[index];

  if (!item) return;

  const setValue = function (id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || "";
  };

  setValue("productName", item.productName);
  setValue("details", item.productDescription);
  setValue("price", item.price);
  setValue("productLink", item.productLink);
  setValue("adStyle", item.adStyle);
  setValue("adTemplate", item.adTemplate);
  setValue("language", item.language);

  const resultBox = document.getElementById("result");
  if (resultBox) resultBox.style.display = "block";

  renderAdVariations(item.ads || []);

  const shareButtons = document.getElementById("shareButtons");
  if (shareButtons) shareButtons.style.display = "block";

  const orderButton = document.getElementById("orderButton");
  if (orderButton) {
    if (item.productLink) {
      orderButton.style.display = "block";
      orderButton.onclick = function () {
        window.open(item.productLink, "_blank");
      };
    } else {
      orderButton.style.display = "none";
    }
  }

  toggleHistoryPanel(false);

  window.scrollTo({ top: 0, behavior: "smooth" });
}


function deleteHistoryItem(index) {

  const history = getHistory();

  history.splice(index, 1);

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history)
  );

  renderHistoryPanel();
}


function clearHistory() {

  if (!confirm("Saare saved ads delete kar dein?")) {
    return;
  }

  localStorage.removeItem(HISTORY_KEY);

  renderHistoryPanel();
}


function toggleHistoryPanel(forceState) {

  const panel =
    document.getElementById("historyPanel");

  if (!panel) return;

  const isOpen =
    panel.style.display === "block";

  const shouldOpen =
    typeof forceState === "boolean"
      ? forceState
      : !isOpen;

  panel.style.display =
    shouldOpen ? "block" : "none";

  if (shouldOpen) {
    renderHistoryPanel();
  }
}


// ========================================
// 🌙 THEME TOGGLE (Dark / Light Mode)
// ========================================

function applyTheme(theme) {

  if (theme === "light") {
    document.body.classList.add("light-theme");
  } else {
    document.body.classList.remove("light-theme");
  }

  const themeButton =
    document.getElementById("themeToggle");

  if (themeButton) {
    themeButton.textContent =
      theme === "light" ? "☀️ Light Mode" : "🌙 Dark Mode";
  }
}


function toggleTheme() {

  const isLight =
    document.body.classList.contains("light-theme");

  const newTheme =
    isLight ? "dark" : "light";

  applyTheme(newTheme);

  try {
    localStorage.setItem("admakerai_theme", newTheme);
  } catch (themeError) {
    console.error("Theme save error:", themeError);
  }
}


// Saved theme apply karo page load hote hi
(function () {

  try {

    const savedTheme =
      localStorage.getItem("admakerai_theme");

    if (savedTheme) {
      applyTheme(savedTheme);
    }

  } catch (themeError) {

    console.error(
      "Theme load error:",
      themeError
    );
  }
})();


window.toggleHistoryPanel = toggleHistoryPanel;
window.clearHistory = clearHistory;
window.toggleTheme = toggleTheme;


// ========================================
// 📊 ANALYTICS (simple local counter)
// ========================================

const STATS_KEY = "admakerai_stats";

function getStats() {

  try {

    const raw = localStorage.getItem(STATS_KEY);

    return raw
      ? JSON.parse(raw)
      : { adsGenerated: 0, imagesGenerated: 0, videosGenerated: 0, shares: 0 };

  } catch (statsError) {

    return { adsGenerated: 0, imagesGenerated: 0, videosGenerated: 0, shares: 0 };
  }
}


function incrementStat(key) {

  try {

    const stats = getStats();

    stats[key] = (stats[key] || 0) + 1;

    localStorage.setItem(STATS_KEY, JSON.stringify(stats));

    renderStats();

  } catch (statsError) {

    console.error("Stats update error:", statsError);
  }
}


function renderStats() {

  const statsDisplay =
    document.getElementById("statsDisplay");

  if (!statsDisplay) return;

  const stats = getStats();

  statsDisplay.innerHTML =
    "📝 Ads: <b>" + (stats.adsGenerated || 0) + "</b> &nbsp; " +
    "🖼️ Images: <b>" + (stats.imagesGenerated || 0) + "</b> &nbsp; " +
    "🎬 Videos: <b>" + (stats.videosGenerated || 0) + "</b> &nbsp; " +
    "📤 Shares: <b>" + (stats.shares || 0) + "</b>";
}


window.incrementStat = incrementStat;
window.renderStats = renderStats;


// ========================================
// 🎙️ VOICE-OVER SCRIPT GENERATION
// ========================================

async function createVoiceover() {

  const productName =
    document.getElementById("productName")?.value.trim() || "";

  const productDescription =
    document.getElementById("details")?.value.trim() || "";

  const language =
    document.getElementById("language")?.value || "";

  if (!productName || !productDescription) {

    alert(
      "Please enter product name and product description."
    );

    return;
  }

  const button =
    document.querySelector(
      'button[onclick="createVoiceover()"]'
    );

  setButtonLoading(button, "AI Voice-over script बना रहा है...");

  const container =
    document.getElementById("voiceoverContainer");

  try {

    const response = await fetch(
      "/api/generate-voiceover",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productName,
          productDescription,
          language
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {

      throw new Error(
        (data.error || "Voice-over generate नहीं हुआ।") +
        (data.debug ? "\n\nDebug: " + JSON.stringify(data.debug) : "")
      );
    }

    if (container) {

      container.innerHTML = `
        <div style="text-align:left; background:rgba(255,255,255,.06); border:1px solid rgba(165,82,255,.4); border-radius:14px; padding:14px; margin-top:12px;">
          <div style="font-weight:bold; color:#d9b6ff; margin-bottom:8px;">🎙️ Voice-over Script</div>
          <div id="voiceoverText" style="white-space:pre-line; line-height:1.6; font-size:14px;">${data.voiceover}</div>
          <button type="button" id="playVoiceoverBtn" style="margin-top:12px;">🔊 Play</button>
          <button type="button" id="copyVoiceoverBtn" style="margin-top:12px;">📋 Copy Script</button>
        </div>
      `;

      const playBtn = document.getElementById("playVoiceoverBtn");

      if (playBtn) {

        playBtn.addEventListener("click", function () {

          if (!window.speechSynthesis) {
            alert("इस browser में Voice playback उपलब्ध नहीं है।");
            return;
          }

          window.speechSynthesis.cancel();

          const utterance =
            new SpeechSynthesisUtterance(data.voiceover);

          window.speechSynthesis.speak(utterance);
        });
      }

      const copyBtn = document.getElementById("copyVoiceoverBtn");

      if (copyBtn) {

        copyBtn.addEventListener("click", async function () {

          try {
            await navigator.clipboard.writeText(data.voiceover);
            alert("✅ Voice-over script copied!");
          } catch (copyError) {
            alert("❌ Copy नहीं हो पाया।");
          }
        });
      }
    }

  } catch (error) {

    console.error("AdMakerAI Voiceover Error:", error);

    if (container) {
      container.innerHTML =
        '<p style="color:#ff8080; margin-top:10px;">❌ Error: ' +
        (error?.message || "Voice-over generate नहीं हुआ।") +
        '</p>';
    }

  } finally {

    restoreButton(button, "🎙️ Generate Voice-over Script");
  }
}

window.createVoiceover = createVoiceover;


// ========================================
// 📋 COPY ADVERTISEMENT
// ========================================

async function copyAdvertisement() {

  const scriptElement =
    document.getElementById("script");

  if (!scriptElement) {
    alert("Advertisement text नहीं मिला।");
    return;
  }

  const text =
    scriptElement.textContent.trim();

  if (!text) {
    alert("पहले Advertisement generate करें।");
    return;
  }

  try {

    await navigator.clipboard.writeText(text);

    alert(
      "✅ Advertisement copied successfully!"
    );

  } catch (error) {

    console.error(
      "Copy Error:",
      error
    );

    // Fallback copy method
    try {

      const textarea =
        document.createElement("textarea");

      textarea.value = text;

      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);

      textarea.select();

      document.execCommand("copy");

      textarea.remove();

      alert(
        "✅ Advertisement copied successfully!"
      );

    } catch (fallbackError) {

      console.error(
        "Fallback Copy Error:",
        fallbackError
      );

      alert(
        "❌ Advertisement copy नहीं हो पाया।"
      );
    }
  }
}

window.copyAdvertisement =
  copyAdvertisement;


// ========================================
// 🖼️ CREATE ADVERTISEMENT IMAGE
// ========================================

async function createAdImage() {

  console.log(
    "AdMakerAI: createAdImage() started"
  );

  const productName =
    document.getElementById("productName")?.value.trim() || "";

  const productDescription =
  document.getElementById("details")?.value.trim() || "";

  const price =
    document.getElementById("price")?.value.trim() || "";

  const adStyle =
    document.getElementById("adStyle")?.value || "";

  const adTemplate =
    document.getElementById("adTemplate")?.value || "";

  const productLink =
    document.getElementById("productLink")?.value.trim() || "";

  // ========================================
// 🌍 MULTI-LANGUAGE TEXT
// ========================================

const selectedLanguage =
  document.getElementById("language")?.value || "";

const lang = selectedLanguage.toLowerCase();

let orderText = "🛒 अभी Order करें!";
let adTitle = "🖼️ Advertisement Image";

if (
  lang.includes("english") ||
  lang === "en"
) {
  orderText = "🛒 Order Now!";
  adTitle = "🖼️ Advertisement Image";

} else if (
  lang.includes("bengali") ||
  lang.includes("bangla") ||
  lang === "bn"
) {
  orderText = "🛒 এখনই অর্ডার করুন!";
  adTitle = "🖼️ বিজ্ঞাপন ছবি";

} else if (
  lang.includes("tamil") ||
  lang === "ta"
) {
  orderText = "🛒 இப்போதே ஆர்டர் செய்யுங்கள்!";
  adTitle = "🖼️ விளம்பர படம்";

} else if (
  lang.includes("telugu") ||
  lang === "te"
) {
  orderText = "🛒 ఇప్పుడే ఆర్డర్ చేయండి!";
  adTitle = "🖼️ ప్రకటన చిత్రం";

} else if (
  lang.includes("marathi") ||
  lang === "mr"
) {
  orderText = "🛒 आत्ताच ऑर्डर करा!";
  adTitle = "🖼️ जाहिरात प्रतिमा";

} else if (
  lang.includes("gujarati") ||
  lang === "gu"
) {
  orderText = "🛒 હમણાં ઓર્ડર કરો!";
  adTitle = "🖼️ જાહેરાત છબી";

} else if (
  lang.includes("punjabi") ||
  lang === "pa"
) {
  orderText = "🛒 ਹੁਣੇ ਆਰਡਰ ਕਰੋ!";
  adTitle = "🖼️ ਇਸ਼ਤਿਹਾਰ ਤਸਵੀਰ";

} else if (
  lang.includes("kannada") ||
  lang === "kn"
) {
  orderText = "🛒 ಈಗಲೇ ಆರ್ಡರ್ ಮಾಡಿ!";
  adTitle = "🖼️ ಜಾಹೀರಾತು ಚಿತ್ರ";

} else if (
  lang.includes("malayalam") ||
  lang === "ml"
) {
  orderText = "🛒 ഇപ്പോൾ തന്നെ ഓർഡർ ചെയ്യൂ!";
  adTitle = "🖼️ പരസ്യ ചിത്രം";

} else if (
  lang.includes("french") ||
  lang === "fr"
) {
  orderText = "🛒 Commandez maintenant !";
  adTitle = "🖼️ Image publicitaire";

} else if (
  lang.includes("spanish") ||
  lang === "es"
) {
  orderText = "🛒 ¡Ordena ahora!";
  adTitle = "🖼️ Imagen publicitaria";

} else if (
  lang.includes("german") ||
  lang === "de"
) {
  orderText = "🛒 Jetzt bestellen!";
  adTitle = "🖼️ Werbebild";

} else if (
  lang.includes("arabic") ||
  lang === "ar"
) {
  orderText = "🛒 اطلب الآن!";
  adTitle = "🖼️ صورة إعلانية";

} else if (
  lang.includes("indonesian") ||
  lang.includes("bahasa") ||
  lang === "id"
) {
  orderText = "🛒 Pesan Sekarang!";
  adTitle = "🖼️ Gambar Iklan";
}
  const scriptElement =
    document.getElementById("script");

  const script =
    scriptElement
      ? scriptElement.textContent.trim()
      : "";

  const imageInput =
  document.getElementById("imageInput") ||
  document.getElementById("productImage") ||
  document.getElementById("productImageInput");

  // 🆕 Multiple images ho toh jo gallery mein select kiya hai wahi use karo
  const selectedImageFile =
    (window.getSelectedProductImage && window.getSelectedProductImage()) ||
    (imageInput?.files && imageInput.files[0]) ||
    null;

if (!productName || !productDescription) {
  
    alert(
      "Please enter product name and product description."
    );

    return;
  }

  if (!selectedImageFile) {

    alert(
      "पहले Product Image upload करें।"
    );

    return;
  }

  if (!script) {

    alert(
      "पहले Advertisement generate करें।"
    );

    return;
  }

  const button =
    document.querySelector(
      'button[onclick="createAdImage()"]'
    );

  setButtonLoading(
    button,
    "AI Advertisement Image बना रहा है..."
  );

  try {

    // ------------------------------------
    // Product image पढ़ना
    // ------------------------------------

    const imageData =
      await new Promise((resolve, reject) => {

        const reader =
          new FileReader();

        reader.onload = function () {

          if (reader.result) {
            resolve(reader.result);
          } else {
            reject(
              new Error(
                "Product image data नहीं मिला।"
              )
            );
          }

        };

        reader.onerror = function () {

          reject(
            new Error(
              "Product image read नहीं हो पाई।"
            )
          );

        };

        reader.readAsDataURL(
          selectedImageFile
        );

      });


    // ------------------------------------
    // Image load करना
    // ------------------------------------

    const img =
      await new Promise((resolve, reject) => {

        const image =
          new Image();

        image.onload = function () {
          resolve(image);
        };

        image.onerror = function () {

          reject(
            new Error(
              "Product image load नहीं हो पाई।"
            )
          );

        };

        image.src = imageData;

      });


    // ------------------------------------
    // Canvas बनाना
    // ------------------------------------

    const canvas =
      document.createElement("canvas");

    canvas.width = 1080;
    canvas.height = 1080;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Canvas browser में उपलब्ध नहीं है।"
      );
    }


    // ------------------------------------
    // 🆕 Background (AI-generated, gradient fallback)
    // ------------------------------------

    let backgroundDrawn = false;

    try {

      if (button) {
        button.innerHTML =
          '<span class="spinner"></span> AI Background बना रहा है...';
      }

      const bgResponse = await fetch(
        "/api/generate-background",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            productName,
            productDescription,
            adStyle,
            adTemplate
          })
        }
      );

      const bgData = await bgResponse.json();

      if (
        bgResponse.ok &&
        bgData.success &&
        bgData.image
      ) {

        const bgImage =
          await new Promise((resolve, reject) => {

            const image = new Image();

            image.onload = () => resolve(image);

            image.onerror = () =>
              reject(
                new Error(
                  "AI background load नहीं हो पाई।"
                )
              );

            image.src = bgData.image;

          });

        ctx.drawImage(
          bgImage,
          0,
          0,
          1080,
          1080
        );

        backgroundDrawn = true;
      }

    } catch (bgError) {

      console.error(
        "AdMakerAI Background Error:",
        bgError
      );
    }

    if (!backgroundDrawn) {

      const gradient =
        ctx.createLinearGradient(
          0,
          0,
          1080,
          1080
        );

      gradient.addColorStop(
        0,
        "#18004a"
      );

      gradient.addColorStop(
        1,
        "#6a00ff"
      );

      ctx.fillStyle =
        gradient;

      ctx.fillRect(
        0,
        0,
        1080,
        1080
      );
    }

    if (button) {
      button.innerHTML =
        '<span class="spinner"></span> Advertisement Image बना रहा है...';
    }


    // ------------------------------------
    // Product Image
    // ------------------------------------

    const maxWidth = 850;
    const maxHeight = 500;

    let width =
      img.naturalWidth ||
      img.width;

    let height =
      img.naturalHeight ||
      img.height;

    if (!width || !height) {

      throw new Error(
        "Product image का size नहीं मिला।"
      );
    }

    const scale =
      Math.min(
        maxWidth / width,
        maxHeight / height
      );

    width *= scale;
    height *= scale;

    const x =
      (1080 - width) / 2;

    const y = 100;

    ctx.drawImage(
      img,
      x,
      y,
      width,
      height
    );


    // ------------------------------------
    // Product Name
    // ------------------------------------

    ctx.fillStyle =
      "#ffffff";

    ctx.textAlign =
      "center";

    ctx.font =
      "bold 60px Arial";

    ctx.fillText(
      productName,
      540,
      680
    );


    // ------------------------------------
    // Price
    // ------------------------------------

    if (price) {

      ctx.fillStyle =
        "#ffd700";

      ctx.font =
  "bold 55px 'Noto Sans', Arial, sans-serif";

      ctx.fillText(
        "₹ " + price,
        540,
        760
      );
    }


    // ------------------------------------
    // Description
    // ------------------------------------

    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "32px Arial";

    const shortDescription =
      productDescription.length > 70
        ? productDescription.substring(0, 70) + "..."
        : productDescription;

    ctx.fillText(
      shortDescription,
      540,
      830
    );


    // ------------------------------------
    // Order Text
    // ------------------------------------

    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "bold 38px Arial";

    
ctx.fillText(
  orderText,
  540,
  910
);

    // ------------------------------------
    // Branding
    // ------------------------------------

    ctx.font =
      "28px Arial";

    ctx.fillText(
      "✨ AdMakerAI",
      540,
      980
    );

    ctx.font =
      "24px Arial";

    ctx.fillText(
      "Made by Santosh Marandi",
      540,
      1020
    );


    // ------------------------------------
    // 🆕 Ad Size — 1080x1080 design ko
    // chuni hui size mein compose karo
    // ------------------------------------

    const adSize =
      document.getElementById("adSize")?.value || "square";

    const SIZE_PRESETS = {
      square: { width: 1080, height: 1080 },
      story: { width: 1080, height: 1920 },
      fb: { width: 1200, height: 630 }
    };

    const targetSize =
      SIZE_PRESETS[adSize] || SIZE_PRESETS.square;

    let finalCanvas = canvas;

    if (adSize !== "square") {

      finalCanvas =
        document.createElement("canvas");

      finalCanvas.width = targetSize.width;
      finalCanvas.height = targetSize.height;

      const finalCtx =
        finalCanvas.getContext("2d");

      // Background extend karo (design jaisa hi gradient)
      const extendGradient =
        finalCtx.createLinearGradient(
          0, 0, targetSize.width, targetSize.height
        );

      extendGradient.addColorStop(0, "#18004a");
      extendGradient.addColorStop(1, "#6a00ff");

      finalCtx.fillStyle = extendGradient;
      finalCtx.fillRect(0, 0, targetSize.width, targetSize.height);

      // 1080x1080 design ko fit karke center mein rakho
      const fitScale =
        Math.min(
          targetSize.width / 1080,
          targetSize.height / 1080
        );

      const drawWidth = 1080 * fitScale;
      const drawHeight = 1080 * fitScale;

      const drawX = (targetSize.width - drawWidth) / 2;
      const drawY = (targetSize.height - drawHeight) / 2;

      finalCtx.drawImage(
        canvas,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );
    }


    // ------------------------------------
    // Old generated image हटाएँ
    // ------------------------------------

    const oldContainer =
      document.getElementById(
        "generatedImageContainer"
      );

    if (oldContainer) {
      oldContainer.remove();
    }


    // ------------------------------------
    // Canvas → Image
    // ------------------------------------

    const imageUrl =
      finalCanvas.toDataURL(
        "image/jpeg",
        0.92
      );


    if (!imageUrl) {

      throw new Error(
        "Advertisement image तैयार नहीं हो पाई।"
      );
    }


    // ------------------------------------
    // Result Container
    // ------------------------------------

    const resultBox =
      document.getElementById("result");

    if (!resultBox) {

      throw new Error(
        "Result box नहीं मिला।"
      );
    }

    resultBox.style.display =
      "block";


    const container =
      document.createElement("div");

    container.id =
      "generatedImageContainer";

    container.style.textAlign =
      "center";

    container.style.marginTop =
      "20px";


    // 🆕 Clickable image + Buy Now + Copy Link (agar productLink diya ho)
    const imageLinkOpen =
      productLink
        ? `<a href="${productLink}" target="_blank" rel="noopener">`
        : "";

    const imageLinkClose =
      productLink
        ? `</a>`
        : "";

    const buyNowButtonHtml =
      productLink
        ? `
      <a
        href="${productLink}"
        target="_blank"
        rel="noopener"
        style="display:block; text-decoration:none;"
      >
        <button
          type="button"
          style="
            width:100%;
            margin-top:10px;
            padding:14px;
            border:0;
            border-radius:10px;
            cursor:pointer;
            background:linear-gradient(90deg, #00a86b, #16c784);
            color:#fff;
            font-weight:bold;
          "
        >
          🛒 Buy Now
        </button>
      </a>
      `
        : "";

    const copyLinkButtonHtml =
      productLink
        ? `
      <button
        type="button"
        id="copyAffiliateLinkImg"
        style="
          width:100%;
          margin-top:10px;
          padding:14px;
          border:0;
          border-radius:10px;
          cursor:pointer;
        "
      >
        🔗 Copy Affiliate Link
      </button>
      `
        : "";

    // 🆕 QR Code (free public API se — poster pe print karne ke liye)
    const qrCodeHtml =
      productLink
        ? `
      <div style="text-align:center; margin-top:15px;">
        <p style="font-size:13px; opacity:.8; margin-bottom:8px;">
          📱 Scan karke product dekho
        </p>
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(productLink)}"
          alt="QR Code"
          style="width:140px; height:140px; border-radius:10px; background:#fff; padding:8px;"
        >
      </div>
      `
        : "";

    container.innerHTML = `
      <h2>${adTitle}</h2>

      ${imageLinkOpen}<img
        id="generatedAdImage"
        src="${imageUrl}"
        alt="Generated Advertisement"
        style="
          width:100%;
          max-width:500px;
          border-radius:15px;
          display:block;
          margin:15px auto;
          cursor:${productLink ? "pointer" : "default"};
        "
      >${imageLinkClose}

      <button
        type="button"
        id="downloadAdImage"
        style="
          width:100%;
          margin-top:10px;
          padding:14px;
          border:0;
          border-radius:10px;
          cursor:pointer;
        "
      >
        📥 Download Advertisement
      </button>

      ${buyNowButtonHtml}
      ${copyLinkButtonHtml}
      ${qrCodeHtml}
    `;


    resultBox.appendChild(
      container
    );


    // ------------------------------------
    // 🆕 Copy Affiliate Link Button
    // ------------------------------------

    const copyLinkButton =
      document.getElementById(
        "copyAffiliateLinkImg"
      );

    if (copyLinkButton) {

      copyLinkButton.addEventListener(
        "click",
        async function () {

          try {

            await navigator.clipboard.writeText(
              productLink
            );

            alert(
              "✅ Affiliate link copied!"
            );

          } catch (copyError) {

            alert(
              "❌ Link copy नहीं हो पाया।"
            );
          }
        }
      );
    }


    // ------------------------------------
    // Download Button
    // ------------------------------------

    const downloadButton =
      document.getElementById(
        "downloadAdImage"
      );

    if (downloadButton) {

      downloadButton.addEventListener(
        "click",
        function () {

          const link =
            document.createElement("a");

          link.download =
            "AdMakerAI-Advertisement.jpg";

          link.href =
            imageUrl;

          document.body.appendChild(
            link
          );

          link.click();

          link.remove();

        }
      );
    }


    // 🆕 Analytics
    if (window.incrementStat) {
      window.incrementStat("imagesGenerated");
    }

    alert(
      "✅ Advertisement Image तैयार है!"
    );


  } catch (error) {

    console.error(
      "AdMakerAI Image Error:",
      error
    );

    alert(
      "❌ Advertisement Image बनाने में समस्या हुई:\n\n" +
      error.message
    );


  } finally {

    restoreButton(
      button,
      "🖼️ Create Advertisement Image"
    );
  }
}

window.createAdImage =
  createAdImage;


// ========================================
// 🎬 CREATE AI ADVERTISEMENT VIDEO
// ========================================

async function createAdVideo() {

  console.log(
    "AdMakerAI: createAdVideo() started"
  );

  const productName =
    document.getElementById("productName")?.value.trim() || "";

  const productDescription =
    document.getElementById("details")?.value.trim() || "";

  const language =
    document.getElementById("language")?.value || "";

  const productLink =
    document.getElementById("productLink")?.value.trim() || "";

  const scriptElement =
    document.getElementById("script");

  const script =
    scriptElement
      ? scriptElement.textContent.trim()
      : "";

  if (!productName || !productDescription) {

    alert(
      "Please enter product name and product description."
    );

    return;
  }

  if (!script) {

    alert(
      "पहले Advertisement generate करें।"
    );

    return;
  }

  const imageInput =
    document.getElementById("imageInput") ||
    document.getElementById("productImage") ||
    document.getElementById("productImageInput");

  // 🆕 Multiple images ho toh jo gallery mein select kiya hai wahi use karo
  const selectedImageFile =
    (window.getSelectedProductImage && window.getSelectedProductImage()) ||
    (imageInput?.files && imageInput.files[0]) ||
    null;

  if (!selectedImageFile) {

    alert(
      "पहले Product Image upload करें।"
    );

    return;
  }

  const button =
    document.querySelector(
      'button[onclick="createAdVideo()"]'
    );

  setButtonLoading(
    button,
    "AI Video बना रहा है..."
  );


  try {

    // ------------------------------------
    // Image → Data URL
    // ------------------------------------

    const imageData =
      await new Promise((resolve, reject) => {

        const reader =
          new FileReader();

        reader.onload =
          function () {

            if (reader.result) {
              resolve(reader.result);
            } else {
              reject(
                new Error(
                  "Product image data नहीं मिला।"
                )
              );
            }

          };

        reader.onerror =
          function () {

            reject(
              new Error(
                "Product image read नहीं हो पाई।"
              )
            );

          };

        reader.readAsDataURL(
          selectedImageFile
        );

      });


    // ------------------------------------
    // Video API Request
    // ------------------------------------

    const response =
      await fetch(
        "/api/generate-video",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            productName,
            productDescription,
            language,
            script,
            image: imageData
          })
        }
      );


    // ------------------------------------
    // Response पढ़ना
    // ------------------------------------

    const responseText =
      await response.text();

    let data;

    try {

      data =
        JSON.parse(responseText);

    } catch (jsonError) {

      throw new Error(
        "Video server ने valid JSON response नहीं दिया।"
      );
    }


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.error ||
        "Video generation failed."
      );
    }


    const videoUrl =
      data.video ||
      data.result?.video;


    if (!videoUrl) {

      throw new Error(
        "AI ने video URL नहीं दिया।"
      );
    }


    // ------------------------------------
    // Result
    // ------------------------------------

    const resultBox =
      document.getElementById("result");

    if (!resultBox) {

      throw new Error(
        "Result box नहीं मिला।"
      );
    }

    resultBox.style.display =
      "block";


    const oldVideoContainer =
      document.getElementById(
        "aiVideoContainer"
      );

    if (oldVideoContainer) {
      oldVideoContainer.remove();
    }


    const videoContainer =
      document.createElement("div");

    videoContainer.id =
      "aiVideoContainer";

    videoContainer.style.marginTop =
      "20px";


    // 🆕 Buy Now + Copy Link (agar productLink diya ho)
    const videoBuyNowHtml =
      productLink
        ? `
      <a
        href="${productLink}"
        target="_blank"
        rel="noopener"
        style="display:block; text-decoration:none;"
      >
        <button
          type="button"
          style="
            width:100%;
            margin-top:10px;
            padding:14px;
            border:0;
            border-radius:10px;
            cursor:pointer;
            background:linear-gradient(90deg, #00a86b, #16c784);
            color:#fff;
            font-weight:bold;
          "
        >
          🛒 Buy Now
        </button>
      </a>
      `
        : "";

    const videoCopyLinkHtml =
      productLink
        ? `
      <button
        type="button"
        id="copyAffiliateLinkVideo"
        style="
          width:100%;
          margin-top:10px;
          padding:14px;
          border:0;
          border-radius:10px;
          cursor:pointer;
        "
      >
        🔗 Copy Affiliate Link
      </button>
      `
        : "";

    videoContainer.innerHTML = `
      <h2>🎬 AI Advertisement Video</h2>

      <video
        id="aiAdVideo"
        controls
        playsinline
        style="
          width:100%;
          max-width:400px;
          border-radius:15px;
          display:block;
          margin:15px auto;
        "
      >
        <source
          src="${videoUrl}"
          type="video/mp4"
        >
        आपका browser video support नहीं करता।
      </video>

      <a
        href="${videoUrl}"
        target="_blank"
        rel="noopener"
        download="AdMakerAI-Advertisement.mp4"
        style="
          display:block;
          text-align:center;
          text-decoration:none;
        "
      >
        <button
          type="button"
          style="
            width:100%;
            margin-top:10px;
            padding:14px;
            border:0;
            border-radius:10px;
            cursor:pointer;
          "
        >
          📥 Download Advertisement Video
        </button>
      </a>

      ${videoBuyNowHtml}
      ${videoCopyLinkHtml}
    `;


    resultBox.appendChild(
      videoContainer
    );


    // ------------------------------------
    // 🆕 Copy Affiliate Link Button
    // ------------------------------------

    const copyLinkButtonVideo =
      document.getElementById(
        "copyAffiliateLinkVideo"
      );

    if (copyLinkButtonVideo) {

      copyLinkButtonVideo.addEventListener(
        "click",
        async function () {

          try {

            await navigator.clipboard.writeText(
              productLink
            );

            alert(
              "✅ Affiliate link copied!"
            );

          } catch (copyError) {

            alert(
              "❌ Link copy नहीं हो पाया।"
            );
          }
        }
      );
    }


    // 🆕 Analytics
    if (window.incrementStat) {
      window.incrementStat("videosGenerated");
    }

    alert(
      "✅ AI Advertisement Video तैयार है!"
    );


  } catch (error) {

    console.error(
      "AdMakerAI Video Error:",
      error
    );

    alert(
      "❌ Video बनाने में समस्या हुई:\n\n" +
      error.message
    );


  } finally {

    restoreButton(
      button,
      "🎬 Create Advertisement Video"
    );
  }
}

window.createAdVideo =
  createAdVideo;
