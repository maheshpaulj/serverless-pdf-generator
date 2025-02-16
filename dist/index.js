"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
exports.handlePDFRequest = handlePDFRequest;
// src/index.ts
const server_1 = require("next/server");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const chromium_min_1 = __importDefault(require("@sparticuz/chromium-min"));
async function generatePDF(options) {
    var _a, _b, _c, _d, _e;
    try {
        let browser;
        if (options.development) {
            // Use regular Puppeteer for local development
            browser = await puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        else {
            // Use Chromium-min for serverless environment
            const executablePath = await chromium_min_1.default.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar');
            browser = await puppeteer_core_1.default.launch({
                executablePath,
                args: chromium_min_1.default.args,
                headless: chromium_min_1.default.headless,
                defaultViewport: chromium_min_1.default.defaultViewport
            });
        }
        const page = await browser.newPage();
        await page.goto(options.url, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({
            format: options.format || 'A4',
            printBackground: (_a = options.printBackground) !== null && _a !== void 0 ? _a : true,
            margin: {
                top: ((_b = options.margin) === null || _b === void 0 ? void 0 : _b.top) || '20px',
                right: ((_c = options.margin) === null || _c === void 0 ? void 0 : _c.right) || '10px',
                bottom: ((_d = options.margin) === null || _d === void 0 ? void 0 : _d.bottom) || '20px',
                left: ((_e = options.margin) === null || _e === void 0 ? void 0 : _e.left) || '10px'
            }
        });
        await browser.close();
        return pdf;
    }
    catch (error) {
        console.error('PDF generation error:', error);
        throw error;
    }
}
async function handlePDFRequest(request, getData, options) {
    try {
        const { url, filename = 'download.pdf' } = await getData();
        const pdf = await generatePDF({
            url,
            ...options,
            development: process.env.NODE_ENV === 'development'
        });
        return new server_1.NextResponse(pdf, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=${filename}`,
            },
        });
    }
    catch (error) {
        console.error('PDF generation error:', error);
        return server_1.NextResponse.json({ message: 'Error generating PDF' }, { status: 500 });
    }
}
