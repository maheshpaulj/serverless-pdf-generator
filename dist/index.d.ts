import { type NextRequest, NextResponse } from 'next/server';
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
export declare function generatePDF(options: PDFGeneratorOptions): Promise<Uint8Array<ArrayBufferLike>>;
export declare function handlePDFRequest(request: NextRequest, getData: () => Promise<{
    url: string;
    filename?: string;
}>, options?: Omit<PDFGeneratorOptions, 'url'>): Promise<NextResponse<unknown>>;
