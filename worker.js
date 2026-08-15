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

// ========================================
// 📢 AI ADVERTISEMENT TEXT GENERATION
// ========================================

if (
  url.pathname === "/api/generate-ad" &&
  request.method === "POST"
) {

  try {

    const body = await request.json();

    const {
      productName,
      productDescription,
      adStyle,
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


    // ------------------------------------
    // 🤖 AI PROMPT
    // ------------------------------------

    const prompt = `
You are a professional advertising copywriter.

Create a NEW, attractive and persuasive advertisement
based on the product information provided below.

IMPORTANT:
- Do NOT copy the product description word-for-word.
- Do NOT return the product description as the advertisement.
- Rewrite and transform the information into a short, engaging sales advertisement.
- Extract the important features and benefits from the description.
- Never invent specifications, discounts, offers, guarantees or features that are not provided.
- The advertisement should sound natural and ready to publish.

IMPORTANT LANGUAGE RULE:
Write the COMPLETE advertisement in the selected language.
Do not mix languages unless the selected language is Hinglish.

Selected language:
${language || "English"}

Product name:
${productName}

Product description:
${productDescription}

Advertisement style:
${adStyle || "Professional and attractive"}

Create a ready-to-use advertisement suitable for
WhatsApp, Facebook, Instagram and other social media.

Use this structure when appropriate:
- Catchy headline
- 2–4 short product benefits/features
- Short persuasive description
- Price, if provided
- Clear call to action

Keep the advertisement concise, attractive and easy to read.

Do not explain what you are doing.
Do not repeat the input description word-for-word.
Return ONLY the final advertisement text.
`;


    // ------------------------------------
    // 🤖 CLOUDFLARE WORKERS AI
    // ------------------------------------

    const result = await env.AI.run(
      "@cf/zai-org/glm-4.7-flash",
      {
        prompt: prompt,
        max_tokens: 1000,
        temperature: 0.8
      }
    );


    // ------------------------------------
    // 📝 AI RESPONSE
    // ------------------------------------

    const advertisement =
      result?.response ||
      result?.result ||
      result?.text ||
      "";


    if (!advertisement) {

      throw new Error(
        "AI advertisement response नहीं मिला।"
      );

    }


    // ------------------------------------
    // RESPONSE
    // ------------------------------------

    return Response.json(
      {
        success: true,
        ad: advertisement
      },
      {
        status: 200,
        headers: corsHeaders
      }
    );


  } catch (error) {

    console.error(
      "Advertisement generation error:",
      error
    );


    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          String(error) ||
          "Advertisement generation failed."
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
