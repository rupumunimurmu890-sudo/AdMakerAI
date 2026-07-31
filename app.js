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
