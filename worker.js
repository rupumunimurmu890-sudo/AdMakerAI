const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // OPTIONS / CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // 🎬 AI Advertisement Video API
    if (
      url.pathname === "/api/generate-video" &&
      request.method === "POST"
    ) {
      try {
        const body = await request.json();

        const {
          productName,
          productDescription,
          script,
          image
        } = body;

        if (!productName || !productDescription) {
          return Response.json(
            {
              success: false,
              error: "Product name and description are required."
            },
            {
              status: 400,
              headers: corsHeaders
            }
          );
        }

        const prompt = `
Create a professional product advertisement video.

Product name: ${productName}

Product details:
${productDescription}

Advertisement script:
${script || "Create a short attractive advertisement."}

Show the product clearly and professionally.
Use realistic lighting and smooth cinematic camera movement.
Create an attractive commercial advertisement suitable for
Instagram Reels, YouTube Shorts, Facebook and WhatsApp.
`;

        const input = {
          prompt: prompt,
          duration: 5,
          fps: 24,
          resolution: "720p",
          draft: false,
          save_audio: true
        };

        // Product image हो तो Image-to-Video
        if (image) {
          input.image = image;
        }

        const result = await env.AI.run(
          "pruna/p-video",
          input
        );

        console.log(
          "P-Video result:",
          JSON.stringify(result)
        );

        const videoUrl =
          result?.video ||
          result?.result?.video ||
          result?.url ||
          null;

        return Response.json(
          {
            success: true,
            video: videoUrl,
            result: result
          },
          {
            status: 200,
            headers: corsHeaders
          }
        );

      } catch (error) {
        console.error(
          "Video generation error:",
          error
        );

        return Response.json(
          {
            success: false,
            error:
              error?.message ||
              String(error) ||
              "Video generation failed."
          },
          {
            status: 500,
            headers: corsHeaders
          }
        );
      }
    }

    // बाकी website files serve करें
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(
      "AdMakerAI Worker is running.",
      {
        status: 200
      }
    );
  }
};
