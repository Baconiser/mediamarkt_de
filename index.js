const puppeteer = require("puppeteer-extra");
const cheerio = require("cheerio");
const StealthPlugin = require("puppeteer-extra-plugin-stealth"),
    http = require("http"),
    fs = require("fs"),
    url = require("url");


puppeteer.use(StealthPlugin());

async function getState() {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox',
                '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto("https://www.mediamarkt.de/de/product/_microsoft-xbox-series-x-1-tb-2677360.html");

        const html = await page.content();
        const $ = cheerio.load(html);
        //let availableDate = $("[data-test=\"mms-delivery-online-availability\"] span[font-size=\"sm\"]");
        const state = $("[data-test=\"pdp-product-not-available\"]").text() || $("[data-test=\"mms-delivery-online-availability\"]").text();
        await browser.close();
        return state;
    } catch (error) {
        return error;
    }
}
const PORT = Number(process.env.PORT || 3000);
http.createServer(async (req, res) => {
    const state = await getState();
    const html = `<html lang="de">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    </head>
    <body>${state}</body>
    </html>;`;
    res.writeHead(200, { "Content-Length": html.length });
    res.write(html);
    res.end();

}).listen(PORT);
