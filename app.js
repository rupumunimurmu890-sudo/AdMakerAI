const form = document.getElementById("adForm");
const resultBox = document.getElementById("result");
const resultText = document.getElementById("script");

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
// 🎬 CREATE AI ADVERTISEMENT VIDEO
// ========================================

async function createAdVideo() {
  alert("🎬 Video button clicked!");
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
