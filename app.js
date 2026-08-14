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

  form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const resultBox = document.getElementById("result");
    const resultText = document.getElementById("script");

    const productName =
      document.getElementById("productName")?.value.trim() || "";

    const productDescription =
  document.getElementById("details")?.value.trim() || "";

    const adStyle =
      document.getElementById("adStyle")?.value || "";

    const language =
      document.getElementById("language")?.value || "";

    if (!productName || !productDescription) {
      alert("Please enter product name and product description.");
      return;
    }

    if (resultBox) {
      resultBox.style.display = "block";
    }

    if (resultText) {
      resultText.textContent =
        "⏳ AI advertisement बना रहा है...";
    }

    try {

      const response = await fetch(
        "/.netlify/functions/generate-ad",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            productName,
            productDescription,
            adStyle,
            language
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong"
        );
      }

      if (resultText) {
        resultText.textContent =
          data.ad ||
          data.result ||
          data.script ||
          "Advertisement generate नहीं हुआ।";
      }

    } catch (error) {

      console.error(
        "AdMakerAI Generate Error:",
        error
      );

      if (resultText) {
        resultText.textContent =
          "❌ AI से connection नहीं हो पाया। कृपया फिर से कोशिश करें।";
      }
    }

  });

});


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
    document.getElementById("productDescription")?.value.trim() || "";

  const price =
    document.getElementById("price")?.value.trim() || "";

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
  document.getElementById("imageInput");

if (!productName || !productDescription) {
  
    alert(
      "Please enter product name and product description."
    );

    return;
  }

  if (
    !imageInput ||
    !imageInput.files ||
    !imageInput.files[0]
  ) {

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

  if (button) {

    button.disabled = true;

    button.textContent =
      "⏳ Advertisement Image बना रहा है...";
  }

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
          imageInput.files[0]
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
    // Background
    // ------------------------------------

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
      canvas.toDataURL(
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


    container.innerHTML = `
      <h2>${adTitle}</h2>

      <img
        id="generatedAdImage"
        src="${imageUrl}"
        alt="Generated Advertisement"
        style="
          width:100%;
          max-width:500px;
          border-radius:15px;
          display:block;
          margin:15px auto;
        "
      >

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
    `;


    resultBox.appendChild(
      container
    );


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

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "🖼️ Create Advertisement Image";
    }
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
    document.getElementById("productDescription")?.value.trim() || "";

  const language =
    document.getElementById("language")?.value || "";

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
    document.getElementById("productImage") ||
    document.getElementById("productImageInput");

  if (
    !imageInput ||
    !imageInput.files ||
    !imageInput.files[0]
  ) {

    alert(
      "पहले Product Image upload करें।"
    );

    return;
  }

  const button =
    document.querySelector(
      'button[onclick="createAdVideo()"]'
    );

  if (button) {

    button.disabled = true;

    button.textContent =
      "⏳ AI Video बना रहा है...";
  }


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
          imageInput.files[0]
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
    `;


    resultBox.appendChild(
      videoContainer
    );


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

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "🎬 Create Advertisement Video";
    }
  }
}

window.createAdVideo =
  createAdVideo;
