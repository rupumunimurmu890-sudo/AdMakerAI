document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("adForm");
  const resultBox = document.getElementById("result");
  const resultText = document.getElementById("script");

  if (!form) {
    console.error("AdMakerAI: adForm नहीं मिला।");
    return;
  }

  form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const productName = document.getElementById("productName").value.trim();
  const productDescription = document
    .getElementById("productDescription")
    .value.trim();
  const adStyle = document.getElementById("adStyle").value;
  const language = document.getElementById("language").value;

  if (!productName || !productDescription) {
    alert("Please enter product name and product description.");
    return;
  }

  resultBox.style.display = "block";
  resultText.textContent = "⏳ AI advertisement बना रहा है...";

  try {
    const response = await fetch("/.netlify/functions/generate-ad", {
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
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    resultText.textContent =
      data.ad || data.result || data.script || "Advertisement generate नहीं हुआ।";

  } catch (error) {
    console.error("AdMakerAI Error:", error);

    resultText.textContent =
      "❌ AI से connection नहीं हो पाया। कृपया फिर से कोशिश करें।";
  }
});
// ========================================
// 🖼️ CREATE ADVERTISEMENT IMAGE
// ========================================

async function createAdImage() {

  const productName =
    document.getElementById("productName").value.trim();

  const productDescription =
    document.getElementById("productDescription").value.trim();

  const price =
    document.getElementById("price")?.value.trim() || "";

  const scriptElement =
    document.getElementById("script");

  const script =
    scriptElement
      ? scriptElement.textContent.trim()
      : "";

  const imageInput =
    document.getElementById("productImage") ||
    document.getElementById("productImageInput");

  if (!productName || !productDescription) {
    alert("Please enter product name and product description.");
    return;
  }

  if (!imageInput || !imageInput.files || !imageInput.files[0]) {
    alert("पहले Product Image upload करें।");
    return;
  }

  if (!script) {
    alert("पहले Advertisement generate करें।");
    return;
  }

  const button =
    document.querySelector(
      'button[onclick="createAdImage()"]'
    );

  if (button) {
    button.disabled = true;
    button.textContent = "⏳ Advertisement Image बना रहा है...";
  }

  try {

    const imageData = await new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);

      reader.onerror = () =>
        reject(
          new Error("Product image read नहीं हो पाई।")
        );

      reader.readAsDataURL(imageInput.files[0]);
    });

    const img = new Image();

    img.onload = function () {

      const canvas =
        document.createElement("canvas");

      canvas.width = 1080;
      canvas.height = 1080;

      const ctx =
        canvas.getContext("2d");

      // Background
      const gradient =
        ctx.createLinearGradient(
          0,
          0,
          1080,
          1080
        );

      gradient.addColorStop(0, "#18004a");
      gradient.addColorStop(1, "#6a00ff");

      ctx.fillStyle = gradient;

      ctx.fillRect(
        0,
        0,
        1080,
        1080
      );

      // Product image
      const maxWidth = 850;
      const maxHeight = 500;

      let width = img.width;
      let height = img.height;

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

      // Product name
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "bold 60px Arial";

      ctx.fillText(
        productName,
        540,
        680
      );

      // Price
      if (price) {

        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 55px Arial";

        ctx.fillText(
          "₹ " + price,
          540,
          760
        );
      }

      // Description
      ctx.fillStyle = "#ffffff";
      ctx.font = "32px Arial";

      const shortDescription =
        productDescription.length > 70
          ? productDescription.substring(0, 70) + "..."
          : productDescription;

      ctx.fillText(
        shortDescription,
        540,
        830
      );

      // Order text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px Arial";

      ctx.fillText(
        "🛒 अभी Order करें!",
        540,
        910
      );

      // Branding
      ctx.font = "28px Arial";

      ctx.fillText(
        "✨ AdMakerAI",
        540,
        980
      );

      ctx.font = "24px Arial";

      ctx.fillText(
        "Made by Santosh Marandi",
        540,
        1020
      );

      // Remove old image
      const oldImage =
        document.getElementById(
          "generatedAdImage"
        );

      if (oldImage) {
        oldImage.remove();
      }

      const oldContainer =
        document.getElementById(
          "generatedImageContainer"
        );

      if (oldContainer) {
        oldContainer.remove();
      }

      // Create image
      const imageUrl =
        canvas.toDataURL(
          "image/jpeg",
          0.92
        );

      const container =
        document.createElement("div");

      container.id =
        "generatedImageContainer";

      container.style.textAlign = "center";
      container.style.marginTop = "20px";

      container.innerHTML = `
        <h2>🖼️ Advertisement Image</h2>

        <img
          id="generatedAdImage"
          src="${imageUrl}"
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

      resultBox.appendChild(container);

      document
        .getElementById("downloadAdImage")
        .addEventListener(
          "click",
          function () {

            const link =
              document.createElement("a");

            link.download =
              "AdMakerAI-Advertisement.jpg";

            link.href = imageUrl;

            link.click();
          }
        );

      alert(
        "✅ Advertisement Image तैयार है!"
      );

    };

    img.onerror = function () {

      throw new Error(
        "Product image load नहीं हो पाई।"
      );
    };

    img.src = imageData;

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

      button.disabled = false;

      button.textContent =
        "🖼️ Create Advertisement Image";
    }
  }
}

window.createAdImage = createAdImage;
// ========================================
// 🎬 CREATE AI ADVERTISEMENT VIDEO
// ========================================

async function createAdVideo() {
  const productName =
    document.getElementById("productName").value.trim();

  const productDescription =
    document.getElementById("productDescription").value.trim();

  const language =
    document.getElementById("language").value;

  const scriptElement =
    document.getElementById("script");

  const script =
    scriptElement
      ? scriptElement.textContent.trim()
      : "";

  if (!productName || !productDescription) {
    alert("Please enter product name and product description.");
    return;
  }

  if (!script) {
    alert("पहले Advertisement generate करें।");
    return;
  }

  // Product image input
  const imageInput =
    document.getElementById("productImage") ||
    document.getElementById("productImageInput");

  if (!imageInput || !imageInput.files || !imageInput.files[0]) {
    alert("पहले Product Image upload करें।");
    return;
  }

  const button =
    document.querySelector(
      'button[onclick="createAdVideo()"]'
    );

  if (button) {
    button.disabled = true;
    button.textContent = "⏳ AI Video बना रहा है...";
  }

  try {
    // Product image को Data URL में convert करें
    const imageData = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () =>
        reject(new Error("Product image read नहीं हो पाई।"));

      reader.readAsDataURL(imageInput.files[0]);
    });

    // Cloudflare Worker को request
    const response = await fetch("/api/generate-video", {
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
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Video generation failed."
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

    // Result box दिखाएँ
    resultBox.style.display = "block";

    // पुराना video हटाएँ
    const oldVideo =
      document.getElementById("aiAdVideo");

    if (oldVideo) {
      oldVideo.remove();
    }

    // Video container
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
        <button type="button">
          📥 Download Advertisement Video
        </button>
      </a>
    `;

    resultBox.appendChild(videoContainer);

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
      button.disabled = false;

      button.textContent =
        "🎬 Create Advertisement Video";
    }
  }
}

window.createAdVideo = createAdVideo;
});
