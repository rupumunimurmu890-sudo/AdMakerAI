export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 🎬 AI Advertisement Video API
    if (url.pathname === "/api/generate-video" && request.method === "POST") {
      try {
        const body = await request.json();

        const {
          productName,
          productDescription,
          script,
          image
        } = body;

        if (!productName || !productDescription) {
          return new Response(
            JSON.stringify({
              error: "Product name and description are required."
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }

        const prompt = `
Create a professional vertical advertisement video for this product.

Product: ${productName}

Product details:
${productDescription}

Advertisement script:
${script || ""}

Create an attractive commercial-style product advertisement.
Show the product clearly.
Use smooth camera movement, realistic lighting, attractive visuals,
and a professional advertising style.
Make it suitable for Instagram Reels, YouTube Shorts and WhatsApp.
`;

        const input = {
          prompt: prompt,
          duration: 5,
          resolution: "720p",
          aspect_ratio: "9:16",
          draft: false,
          save_audio: true
        };

        // Product image को video में इस्तेमाल करें
        if (image) {
          input.image = image;
        }

        const result = await env.AI.run(
          "pruna/p-video",
          input
        );

        return new Response(
          JSON.stringify({
            success: true,
            video: result?.video || result?.result?.video || null,
            result: result
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

      } catch (error) {
        console.error("Video generation error:", error);

        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || "Video generation failed."
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    }

    // OPTIONS / CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // बाकी website files serve करें
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("AdMakerAI Worker is running.", {
      status: 200
    });
  }
};
