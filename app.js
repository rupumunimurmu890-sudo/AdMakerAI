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
// 🎬 CREATE ADVERTISEMENT VIDEO
// ========================================

async function createAdVideo() {

  const productName =
    document.getElementById("productName").value.trim();

  const productDescription =
    document.getElementById("productDescription")
      .value.trim();

  const language =
    document.getElementById("language").value;

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

  const button =
    document.querySelector(
      'button[onclick="createAdVideo()"]'
    );

  if (button) {

    button.disabled = true;

    button.textContent =
      "⏳ Preparing Video...";
  }

  try {

    /*
      अभी Video API connect नहीं किया गया है।

      अगले चरण में यहाँ AI Video Generation
      backend/API connect किया जाएगा।
    */

    alert(
      "🎬 AI Advertisement Video\n\n" +
      "Product: " + productName +
      "\n\n" +
      "Video generation API अगले चरण में connect किया जाएगा।"
    );

  } catch (error) {

    console.error(
      "AdMakerAI Video Error:",
      error
    );

    alert(
      "❌ Video बनाने में समस्या हुई।"
    );

  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        "🎬 Create Advertisement Video";
    }

  }
}
