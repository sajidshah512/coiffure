const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const puppeteer = require("puppeteer");

async function runStreamlitPipeline({
  ngrokUrl,
  targetPath,
  sourcePath,
  outputDir,
  headless = true,
  noSandbox = false,
  timeout = 300000,
}) {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const launchArgs = [
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-zygote",
    ];

    if (noSandbox) launchArgs.push("--no-sandbox", "--disable-setuid-sandbox");

    const browser = await puppeteer.launch({
      headless: headless === true ? "new" : headless,
      args: launchArgs,
      protocolTimeout: timeout,
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(timeout);

    await page.setExtraHTTPHeaders({
      "ngrok-skip-browser-warning": "true",
    });

    console.log("🌐 Opening Streamlit app:", ngrokUrl);
    await page.goto(ngrokUrl, { waitUntil: "networkidle2" });

    // ----------------------------
    // UPLOAD IMAGES
    // ----------------------------

    await page.waitForSelector('input[data-testid="stFileUploaderDropzoneInput"]');
    const fileInputs = await page.$$(
      'input[data-testid="stFileUploaderDropzoneInput"]'
    );

    if (fileInputs.length < 2) {
      throw new Error("❌ Not enough file upload fields found");
    }

    console.log("📤 Uploading target...");
    await fileInputs[0].uploadFile(path.resolve(targetPath));
    await page.waitForTimeout(1200);

    console.log("📤 Uploading source...");
    await fileInputs[1].uploadFile(path.resolve(sourcePath));
    await page.waitForTimeout(1200);

    // ----------------------------
    // CLICK RUN BUTTON
    // ----------------------------
    console.log("🔎 Searching for RUN button...");

    let runButton;
    let clickAttempts = 0;
    const maxClickAttempts = 3;

    while (clickAttempts < maxClickAttempts) {
      try {
        [runButton] = await page.$x("//button[contains(., 'RUN')]");
        if (!runButton) throw new Error("❌ RUN button not found");

        await runButton.click();
        console.log("▶ RUN clicked!");
        break;
      } catch (clickError) {
        clickAttempts++;
        console.log(`⚠️ Click attempt ${clickAttempts} failed:`, clickError.message);

        if (clickAttempts >= maxClickAttempts) {
          throw new Error(`❌ Failed to click RUN button after ${maxClickAttempts} attempts: ${clickError.message}`);
        }

        // Wait a bit before retrying
        await page.waitForTimeout(1000);
      }
    }

    // ----------------------------
    // SCROLL for lazy loading
    // ----------------------------
    console.log("📜 Scrolling UI to reveal images...");

    for (let i = 0; i < 20; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(700);
    }

    // ----------------------------
    // WAIT FOR FILLED IMAGE TO APPEAR
    // ----------------------------
    console.log("⏳ Waiting for Filled image to appear...");

    let filledImgSrc = null;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes at 1 second intervals

    while (attempts < maxAttempts) {
      const outputCandidates = await page.$$eval(
        'div[data-testid="stImageContainer"]',
        (containers) =>
          containers.map((box) => {
            const img = box.querySelector("img");
            const captionBlock = box.querySelector('[data-testid="stImageCaption"]');

            return {
              src: img?.src || null,
              caption: captionBlock?.innerText?.trim() || "",
            };
          })
      );

      console.log(`🖼 Attempt ${attempts + 1}: Images with captions:`, outputCandidates);

      const filled = outputCandidates.find((x) =>
        x.caption.toLowerCase().includes("filled") ||
        x.caption.toLowerCase().includes("result") ||
        x.caption.toLowerCase().includes("output") ||
        x.caption.toLowerCase().includes("final")
      );

      if (filled && filled.src) { 
        filledImgSrc = filled.src;
        console.log("🎯 FINAL IMAGE FOUND:", filledImgSrc);
        break;
      }

      // If no specific result found but we have 3+ images, assume the last one is the result
      if (outputCandidates.length >= 3 && outputCandidates[outputCandidates.length - 1].src) {
        filledImgSrc = outputCandidates[outputCandidates.length - 1].src;
        console.log("🎯 ASSUMING LAST IMAGE IS RESULT:", filledImgSrc);
        break;
      }

      attempts++;
      await page.waitForTimeout(1000); // Wait 1 second before checking again
    }

    if (!filledImgSrc) {
      throw new Error("❌ FINAL 'Filled image' not found after waiting!");
    }

    // ----------------------------
    // DOWNLOAD RESULT IMAGE
    // ----------------------------
    const id = uuidv4();
    const outputFile = `result_${id}.png`;
    const outputPath = path.join(outputDir, outputFile);

    console.log("💾 Downloading filled image...");

    const response = await axios.get(filledImgSrc, { responseType: "arraybuffer" });
    fs.writeFileSync(outputPath, response.data);

    console.log("✅ Saved:", outputPath);

    await browser.close();

    return {
      outputPath,
      outputUrl: `/results/${outputFile}`,
    };
  } catch (err) {
    console.error("❌ PUPPETEER ERROR:", err);
    throw err;
  }
}

module.exports = { runStreamlitPipeline };



//backend/puppeteer_worker.js
// const fs = require("fs");
// const path = require("path");
// const axios = require("axios");
// const { v4: uuidv4 } = require("uuid");
// const puppeteer = require("puppeteer");

// /* ---------------------------------------------------------
//    AUTO SCROLL FUNCTION (IMPORTANT FOR LAZY-LOADED IMAGES)
// ----------------------------------------------------------*/
// async function autoScroll(page) {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 500;

//       const timer = setInterval(() => {
//         const scrollHeight = document.body.scrollHeight;

//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         if (totalHeight >= scrollHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 200);
//     });
//   });
// }

// /* ---------------------------------------------------------
//    MAIN PIPELINE
// ----------------------------------------------------------*/
// async function runStreamlitPipeline({
//   ngrokUrl,
//   targetPath,
//   sourcePath,
//   outputDir,
//   headless = true,
//   noSandbox = false,
//   timeout = 300000,
// }) {
//   try {
//     if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

//     const launchArgs = [
//       "--disable-dev-shm-usage",
//       "--disable-accelerated-2d-canvas",
//       "--no-zygote",
//     ];
//     if (noSandbox) launchArgs.push("--no-sandbox", "--disable-setuid-sandbox");

//     const browser = await puppeteer.launch({
//       headless: headless === true ? "new" : headless,
//       args: launchArgs,
//       protocolTimeout: timeout,
//     });

//     const page = await browser.newPage();
//     page.setDefaultTimeout(timeout);

//     // Skip Ngrok warning
//     await page.setExtraHTTPHeaders({
//       "ngrok-skip-browser-warning": "true",
//     });

//     console.log("🌐 Opening Streamlit app:", ngrokUrl);
//     await page.goto(ngrokUrl, { waitUntil: "networkidle2" });

//     /* ---------------------------------------------------------
//        UPLOAD IMAGES
//     ----------------------------------------------------------*/
//     await page.waitForSelector('input[data-testid="stFileUploaderDropzoneInput"]');
//     const fileInputs = await page.$$(
//       'input[data-testid="stFileUploaderDropzoneInput"]'
//     );

//     if (fileInputs.length < 2) {
//       const html = await page.content();
//       fs.writeFileSync("streamlit_debug.html", html);
//       throw new Error("❌ Found LESS than 2 file upload fields.");
//     }

//     console.log("✔ Found upload fields:", fileInputs.length);

//     console.log("📤 Uploading TARGET image...");
//     await fileInputs[0].uploadFile(path.resolve(targetPath));
//     await page.waitForTimeout(1200);

//     console.log("📤 Uploading SOURCE image...");
//     await fileInputs[1].uploadFile(path.resolve(sourcePath));
//     await page.waitForTimeout(1200);

//     /* ---------------------------------------------------------
//        CLICK RUN BUTTON
//     ----------------------------------------------------------*/
//     console.log("🔎 Searching for RUN button...");

//     const [runButton] = await page.$x(
//       "//button[contains(translate(normalize-space(.),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'run')]"
//     );

//     if (!runButton) throw new Error("❌ RUN button not found.");

//     console.log("▶ Clicking RUN button...");
//     await runButton.click();

//     /* ---------------------------------------------------------
//        FIX: AUTO SCROLL UNTIL STREAMLIT LOADS ALL IMAGES
//     ----------------------------------------------------------*/
//     console.log("📜 Scrolling to load full Streamlit images...");

//     let filledDetected = false;
//     for (let i = 0; i < 30; i++) {
//       await autoScroll(page);
//       await page.waitForTimeout(1200);

//       const nodes = await page.$x(
//         "//p[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'filled image')]"
//       );

//       if (nodes.length > 0) {
//         console.log("🎉 Filled image caption detected at scroll iteration:", i);
//         filledDetected = true;
//         break;
//       }
//     }

//     if (!filledDetected) {
//       console.log("⚠ Filled image caption not detected in scroll (may still exist).");
//     }

//     /* ---------------------------------------------------------
//        CAPTURE ALL IMAGES + CAPTIONS
//     ----------------------------------------------------------*/
//     console.log("⏳ Waiting for Streamlit output images...");

//     await page.waitForSelector('div[data-testid="stImageContainer"] img', {
//       timeout: 180000,
//     });

//     const outputCandidates = await page.$$eval(
//       'div[data-testid="stImageContainer"]',
//       (containers) =>
//         containers.map((box) => {
//           const img = box.querySelector("img");
//           const captionBlock = box.querySelector('[data-testid="stImageCaption"]');

//           return {
//             src: img?.src || null,
//             caption: captionBlock?.innerText?.trim() || "",
//           };
//         })
//     );

//     console.log("🖼 Images with captions:", outputCandidates);

//     /* ---------------------------------------------------------
//        SELECT FINAL "FILLED IMAGE"
//     ----------------------------------------------------------*/
//     const filled = outputCandidates.find((x) =>
//       x.caption.toLowerCase().includes("Filled_Image")
//     );

//     if (!filled || !filled.src) {
//       throw new Error("❌ FINAL 'Filled image' not found!");
//     }

//     const resultSrc = filled.src;
//     console.log("🎯 FINAL IMAGE FOUND:", resultSrc);

//     /* ---------------------------------------------------------
//        DOWNLOAD FINAL IMAGE
//     ----------------------------------------------------------*/
//     const id = uuidv4();
//     const outputFile = `result_${id}.png`;
//     const outputPath = path.join(outputDir, outputFile);

//     if (resultSrc.startsWith("data:")) {
//       const base64 = resultSrc.split(",")[1];
//       fs.writeFileSync(outputPath, Buffer.from(base64, "base64"));
//     } else {
//       const response = await axios.get(resultSrc, {
//         responseType: "arraybuffer",
//       });
//       fs.writeFileSync(outputPath, response.data);
//     }

//     console.log("✅ FINAL RESULT SAVED:", outputPath);

//     await browser.close();

//     return {
//       outputPath,
//       outputUrl: `/results/${outputFile}`,
//     };
//   } catch (err) {
//     console.error("❌ PUPPETEER ERROR:", err);
//     throw err;
//   }
// }

// module.exports = { runStreamlitPipeline };
