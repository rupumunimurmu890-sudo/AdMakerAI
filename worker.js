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
          image,
          language
        } = body;


        // ------------------------------------
        // Validation
        // ------------------------------------

        if (!productName || !productDescription) {

          return Response.json(
            {
              success: false,
              error:
                "Product name and description are required."
            },
            {
              status: 400,
              headers: corsHeaders
            }
          );

        }


        if (!image) {

          return Response.json(
            {
              success: false,
              error:
                "Product image is required."
            },
            {
              status: 400,
              headers: corsHeaders
            }
          );

        }


        // ------------------------------------
        // 🎯 PRODUCT VIDEO PROMPT
        // ------------------------------------

        const prompt = `
Create a professional product advertisement video using the
provided product image as the MAIN and EXACT product reference.

IMPORTANT:
- Use the provided product image as the actual product.
- Keep the product appearance, shape, color, logo, packaging
  and design consistent with the reference image.
- Do NOT replace the product with another product.
- Do NOT invent a different product.
- Clearly show the product throughout the video.
- Make the product the main visual focus.
- Use realistic lighting.
- Use smooth cinematic camera movement.
- Create an attractive commercial advertisement.
- Keep the product clearly visible and recognizable.

Product name:
${productName}

Product details:
${productDescription}

Advertisement script:
${script || "Create a short attractive product advertisement."}

Language:
${language || "English"}

Create a professional advertisement suitable for
Instagram Reels, YouTube Shorts, Facebook and WhatsApp.
`;


        // ------------------------------------
        // 🎬 P-VIDEO INPUT
        // ------------------------------------

        const input = {

          prompt: prompt,

          image: image,

          duration: 5,

          fps: 24,

          resolution: "720p",

          aspect_ratio: "9:16",

          draft: false,

          save_audio: true

        };


        console.log(
          "Starting P-Video with product image..."
        );


        // ------------------------------------
        // 🤖 CLOUDFLARE AI
        // ------------------------------------

        const result = await env.AI.run(
          "pruna/p-video",
          input
        );


        console.log(
          "P-Video result:",
          JSON.stringify(result)
        );


        // ------------------------------------
        // 🎥 VIDEO URL
        // ------------------------------------

        const videoUrl =
          result?.video ||
          result?.result?.video ||
          result?.url ||
          null;


        if (!videoUrl) {

          throw new Error(
            "AI video URL नहीं मिला।"
          );

        }


        // ------------------------------------
        // RESPONSE
        // ------------------------------------

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


    // ------------------------------------
    // 🌐 WEBSITE FILES
    // ------------------------------------

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
