
const args = process.argv.slice(2);
const seconds = parseInt(args[0])
const pngfolder = args[1]
const scenename = args[2]
const puppeteer = require(args[3])

;(async () => {

  // open new tab
  // Problem with timeout: https://github.com/Googlechrome/puppeteer/issues/290
  const browser = await puppeteer.launch(
    //{headless: false},
    {args: ['--no-sandbox', '--disable-setuid-sandbox']}
  );
  const page = await browser.newPage()
  await page.goto(scenename)

  await sleep(4000) // wait for data to load
  for (let frame of [...Array(seconds*60).keys()]){
    
    // Evaluate page
    await page.evaluate((frame) => {currentTime = frame * 1000 / 60}, frame)
    await sleep(10) 
    
    // Log progress
    if((frame % 50) == 0){
      console.log("Frame: ", frame, " out of " + (seconds * 60))
    };

    // Save screenshot
    let path = pngfolder + frame.toString().padStart(5, '0') + '.png'
    let clip = {x: 10, y: 10, width: 1920, height: 1080}
    // If page gets cliiped, try following
    //await page.setViewport({"width":1930, "height":1090})
    await page.screenshot({path:path, clip:clip})
  }
  browser.close()
})()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

