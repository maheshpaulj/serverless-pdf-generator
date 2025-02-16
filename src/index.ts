// src/index.ts
import { type NextRequest, NextResponse } from 'next/server';
import puppeteerCore, { type Browser as BrowserCore } from 'puppeteer-core';
import puppeteer, { type Browser } from 'puppeteer';
import chromium from '@sparticuz/chromium-min';

export interface PDFGeneratorOptions {
  url: string;
  format?: 'A4' | 'Letter' | 'Legal';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  development?: boolean;
}

export async function generatePDF(options: PDFGeneratorOptions) {
  try {
    let browser: Browser | BrowserCore;

    if (options.development) {
      // Use regular Puppeteer for local development
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } else {
      // Use Chromium-min for serverless environment
      const executablePath = await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      );
      
      browser = await puppeteerCore.launch({
        executablePath,
        args: chromium.args,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport
      });
    }

    const page = await browser.newPage();
    await page.goto(options.url, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: options.format || 'A4',
      printBackground: options.printBackground ?? true,
      margin: {
        top: options.margin?.top || '20px',
        right: options.margin?.right || '10px',
        bottom: options.margin?.bottom || '20px',
        left: options.margin?.left || '10px'
      }
    });

    await browser.close();
    return pdf;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}

export async function handlePDFRequest(
  request: NextRequest,
  getData: () => Promise<{ url: string; filename?: string }>,
  options?: Omit<PDFGeneratorOptions, 'url'>
) {
  try {
    const { url, filename = 'download.pdf' } = await getData();
    
    const pdf = await generatePDF({
      url,
      ...options,
      development: process.env.NODE_ENV === 'development'
    });

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { message: 'Error generating PDF' },
      { status: 500 }
    );
  }
}