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
// 🖼️ AI ADVERTISEMENT BACKGROUND IMAGE (NEW)
// ========================================

if (
  url.pathname === "/api/generate-background" &&
  request.method === "POST"
) {

  try {

    const body = await request.json();

    const {
      productName,
      productDescription,
      adStyle,
      adTemplate
    } = body;


    // ------------------------------------
    // Validation
    // ------------------------------------

    if (!productName) {

      return Response.json(
        {
          success: false,
          error:
            "Product name is required."
        },
        {
          status: 400,
          headers: corsHeaders
        }
      );

    }


    // ------------------------------------
    // 🎯 BACKGROUND PROMPT
    // ------------------------------------

    const prompt = `
Create a professional advertisement background image for a
product named "${productName}".

${productDescription ? "Product details: " + productDescription + "." : ""}

Style:
${adStyle || "modern, clean, professional, vibrant commercial"}${adTemplate && adTemplate !== "none" ? ", themed for " + adTemplate : ""}

IMPORTANT:
- Do NOT include any product, object, person or logo in the image.
- Do NOT include any text or watermarks.
- Leave open, empty space in the center so a product photo can be
  placed on top later.
- Studio-quality lighting, smooth gradients, subtle shapes.
- Suitable for a social media advertisement banner.
`;


    // ------------------------------------
    // 🤖 CLOUDFLARE WORKERS AI (Flux)
    // ------------------------------------

    const result = await env.AI.run(
      "@cf/black-forest-labs/flux-1-schnell",
      {
        prompt: prompt,
        steps: 6
      }
    );


    // ------------------------------------
    // 🖼️ IMAGE (base64 PNG)
    // ------------------------------------

    const base64Image =
      result?.image ||
      null;


    if (!base64Image) {

      throw new Error(
        "AI background image नहीं मिली।"
      );

    }


    // ------------------------------------
    // RESPONSE
    // ------------------------------------

    return Response.json(
      {
        success: true,
        image: `data:image/png;base64,${base64Image}`
      },
      {
        status: 200,
        headers: corsHeaders
      }
    );


  } catch (error) {

    console.error(
      "Background generation error:",
      error
    );


    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          String(error) ||
          "Background generation failed."
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );

  }

}

// ========================================
// 🎙️ AI VOICE-OVER SCRIPT GENERATION (NEW)
// ========================================

if (
  url.pathname === "/api/generate-voiceover" &&
  request.method === "POST"
) {

  try {

    const body = await request.json();

    const {
      productName,
      productDescription,
      language
    } = body;


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


    const prompt = `
You are writing a VOICE-OVER SCRIPT for a 15-20 second product
advertisement video. This is meant to be SPOKEN OUT LOUD, not read
as text.

STRICT RULES:
1. Write in natural, conversational spoken language.
2. Do NOT use emojis, hashtags, bullet points or symbols.
3. Do NOT invent discounts, offers, specifications or guarantees.
4. Keep it short — around 35 to 55 words, speakable in 15-20 seconds.
5. Use short sentences with natural pauses (use "..." for pauses).
6. End with a clear spoken call to action.

PRODUCT NAME:
${productName}

PRODUCT DESCRIPTION:
${productDescription}

LANGUAGE:
${language || "English"}

Return ONLY the spoken voice-over script.
Do not explain anything, do not add quotation marks.
`;


    const result = await env.AI.run(
      "@cf/zai-org/glm-4.7-flash",
      {
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_completion_tokens: 1500,
        temperature: 0.8
      }
    );


    const voiceover =
      result?.response ||
      result?.result ||
      result?.text ||
      result?.choices?.[0]?.message?.content ||
      result?.choices?.[0]?.text ||
      "";


    if (!voiceover) {

      return Response.json(
        {
          success: false,
          error: "AI voice-over script नहीं मिला।",
          debug: result
        },
        {
          status: 500,
          headers: corsHeaders
        }
      );

    }


    return Response.json(
      {
        success: true,
        voiceover: voiceover.trim()
      },
      {
        status: 200,
        headers: corsHeaders
      }
    );


  } catch (error) {

    console.error(
      "Voice-over generation error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          String(error) ||
          "Voice-over generation failed."
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
      adTemplate,
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
You are an expert social media advertising copywriter.

Your task is to CREATE A NEW ADVERTISEMENT from the product information.

STRICT RULES:
1. NEVER copy the Product description exactly.
2. NEVER return the Product description as your answer.
3. Rewrite the information into a SHORT sales advertisement.
4. Use only information provided by the user.
5. Do not invent discounts, offers, specifications, ratings or guarantees.
6. Make the advertisement attractive and easy to read.
7. Use short lines instead of a long paragraph.

PRODUCT NAME:
${productName}

PRODUCT DESCRIPTION:
${productDescription}

ADVERTISEMENT STYLE:
${adStyle || "Professional and attractive"}

${
  adTemplate && adTemplate !== "none"
    ? "OCCASION / THEME:\n" + adTemplate + "\nIncorporate this occasion naturally (urgency, festive tone, etc.) without inventing specific discount percentages unless a price is given.\n"
    : ""
}
LANGUAGE:
${language || "English"}

The final advertisement should contain:
- A catchy headline
- 2 to 4 short benefits/features
- A short persuasive line
- Price only if a price is provided
- A clear call to action

IMPORTANT:
The Product Description is SOURCE INFORMATION only.
It must NOT be copied into the final advertisement.

Example of the required style:

🔥 Stylish Men's T-Shirt 🔥

👕 Modern Printed Design
✨ Trendy & Comfortable
🎨 Stylish Color Options
💯 Perfect for Casual Wear

🛍️ Shop Now!

TASK:
Generate exactly 3 DIFFERENT variations of this advertisement.
Each variation must have a different headline, angle or tone,
but must still follow all the rules above.

Separate each variation with this exact line, alone, on its own line:
===VARIATION===

Return ONLY the 3 advertisements separated by ===VARIATION===.
Do not number them. Do not add any extra text before, between or after them.
`;

    // ------------------------------------
    // 🤖 CLOUDFLARE WORKERS AI
    // ------------------------------------

    const result = await env.AI.run(
      "@cf/zai-org/glm-4.7-flash",
      {
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_completion_tokens: 3000,
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
  result?.choices?.[0]?.message?.content ||
  result?.choices?.[0]?.text ||
  "";

if (!advertisement) {

  return Response.json(
    {
      success: false,
      error: "AI response मिला लेकिन advertisement text नहीं मिला।",
      debug: result
    },
    {
      status: 500,
      headers: corsHeaders
    }
  );

}


    // ------------------------------------
    // RESPONSE
    // ------------------------------------

    // 🆕 3 variations ko ===VARIATION=== se split karo
    const ads =
      advertisement
        .split("===VARIATION===")
        .map(function (part) { return part.trim(); })
        .filter(function (part) { return part.length > 0; });

    return Response.json(
      {
        success: true,
        ads: ads.length > 0 ? ads : [advertisement],
        ad: ads[0] || advertisement
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
