import { NextResponse } from 'next/server';
import { CalculatorInputs, CalculatedOutputs } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { inputs, outputs }: { inputs: CalculatorInputs; outputs: CalculatedOutputs } =
      await request.json();

    // Round to nearest £0.50
    const roundToHalf = (v: number) => Math.round(v * 2) / 2;

    const roundedSubtotal = roundToHalf(outputs.subtotal);
    const roundedTotal = inputs.discountPercent > 0
      ? roundToHalf(roundedSubtotal * (1 - inputs.discountPercent / 100))
      : roundedSubtotal;
    const roundedDiscount = roundedSubtotal - roundedTotal;

    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const discountBlock =
      inputs.discountPercent > 0
        ? `<tr>
            <td>Subtotal</td>
            <td>${formatCurrency(roundedSubtotal)}</td>
          </tr>
          <tr>
            <td>Discount (${inputs.discountPercent}%)</td>
            <td>-${formatCurrency(roundedDiscount)}</td>
          </tr>`
        : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page { size: A4; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              color: #333;
              padding: 28px 36px 20px;
              line-height: 1.4;
              font-size: 13px;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .content { flex: 1; }
            .header {
              text-align: center;
              margin-bottom: 22px;
              padding-bottom: 14px;
              border-bottom: 3px solid #8B2635;
            }
            .logo {
              max-width: 160px;
              height: auto;
              margin-bottom: 8px;
            }
            h1 {
              color: #8B2635;
              font-size: 22px;
              margin-bottom: 4px;
              letter-spacing: 1px;
            }
            .date {
              color: #666;
              font-size: 12px;
            }
            .section {
              margin-bottom: 16px;
            }
            .section-title {
              background-color: #8B2635;
              color: white;
              padding: 7px 12px;
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            td {
              padding: 6px 12px;
              border-bottom: 1px solid #eee;
              font-size: 12px;
            }
            td:first-child {
              font-weight: 500;
              color: #555;
              width: 55%;
            }
            td:last-child {
              text-align: right;
              color: #333;
            }
            .subtotal-row {
              background-color: #f5f5f5;
            }
            .subtotal-row td {
              padding: 8px 12px;
              font-weight: 600;
            }
            .total-row {
              background-color: #8B2635;
            }
            .total-row td {
              color: white;
              font-size: 15px;
              font-weight: bold;
              padding: 10px 12px;
              border: none;
            }
            .warning {
              background-color: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 10px;
              margin-top: 12px;
              font-weight: 500;
              color: #92400E;
              font-size: 11px;
            }
            .footer {
              margin-top: auto;
              padding-top: 14px;
              border-top: 2px solid #8B2635;
              text-align: center;
              color: #555;
              font-size: 11px;
              line-height: 1.6;
            }
            .footer .company-name {
              font-weight: bold;
              color: #8B2635;
              font-size: 13px;
              margin-bottom: 4px;
            }
            .footer .contact-row {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 16px;
              margin-top: 6px;
            }
            .footer .contact-item {
              display: inline;
            }
            .footer .validity {
              margin-top: 8px;
              font-size: 10px;
              color: #999;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="content">
            <div class="header">
              <img src="/logo.png" alt="Aura Framing" class="logo" />
              <h1>FRAMING QUOTATION</h1>
              <p class="date">${currentDate}</p>
            </div>

            <div class="section">
              <div class="section-title">PROJECT DETAILS</div>
              <table>
                <tr>
                  <td>Art Type</td>
                  <td>${inputs.artType === 'canvas' ? 'Canvas' : 'Print'}</td>
                </tr>
                <tr>
                  <td>Dimensions</td>
                  <td>${inputs.width} cm × ${inputs.height} cm</td>
                </tr>
                <tr>
                  <td>Total Frame Perimeter</td>
                  <td>${outputs.perimeter.toFixed(1)} cm</td>
                </tr>
                <tr>
                  <td>Wood Type</td>
                  <td>${inputs.woodType === 'softwood' ? 'Softwood' : inputs.woodType === 'hardwood' ? 'Hardwood' : 'Walnut'}</td>
                </tr>
                <tr>
                  <td>Frame Type</td>
                  <td>${inputs.frameType === 'premium' ? 'Premium/Canvas' : inputs.frameType.charAt(0).toUpperCase() + inputs.frameType.slice(1)}</td>
                </tr>
                <tr>
                  <td>Mountboard</td>
                  <td>${(inputs.mountboard || 'single').charAt(0).toUpperCase() + (inputs.mountboard || 'single').slice(1)}</td>
                </tr>
                <tr>
                  <td>Treated / Hand Finish</td>
                  <td>${inputs.treated ? 'Yes' : 'No'}</td>
                </tr>
              </table>
            </div>

            <div class="section">
              <div class="section-title">COST BREAKDOWN</div>
              <table>
                <tr>
                  <td>Labour &amp; Materials</td>
                  <td>${formatCurrency(roundedSubtotal)}</td>
                </tr>
                ${discountBlock}
                <tr class="total-row">
                  <td>TOTAL</td>
                  <td>${formatCurrency(roundedTotal)}</td>
                </tr>
              </table>
            </div>

            ${outputs.sizeWarning ? `<div class="warning">${outputs.sizeWarning}</div>` : ''}
          </div>

          <div class="footer">
            <div class="company-name">Kindred Studios</div>
            <div>13-14 Market Lane, Studio 4D, Shepherds Bush, W12 8EZ</div>
            <div style="font-size:10px;color:#777;margin-top:2px;">Enter through alley next to market on Goldhawk Rd</div>
            <div class="contact-row">
              <span class="contact-item">📷 @AURAFRAMES_LONDON</span>
              <span class="contact-item">📞 +44 7572 79 1064</span>
              <span class="contact-item">✉ auram.nn@gmail.com</span>
            </div>
            <div class="validity">This quote is valid for 30 days from the date of issue.</div>
          </div>
        </body>
      </html>
    `;

    // Step 1: Create PDF generation request
    const createResponse = await fetch(
      'https://apps.abacus.ai/api/createConvertHtmlToPdfRequest',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          html_content: htmlContent,
          base_url: process.env.NEXTAUTH_URL || '',
          pdf_options: {
            format: 'A4',
            print_background: true,
            margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
          },
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse
        .json()
        .catch(() => ({ error: 'Failed to create PDF request' }));
      return NextResponse.json(
        { success: false, error: error?.error ?? 'Failed to create PDF request' },
        { status: 500 }
      );
    }

    const { request_id } = await createResponse.json();
    if (!request_id) {
      return NextResponse.json(
        { success: false, error: 'No request ID returned' },
        { status: 500 }
      );
    }

    // Step 2: Poll for status
    const maxAttempts = 300;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await fetch(
        'https://apps.abacus.ai/api/getConvertHtmlToPdfStatus',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id,
            deployment_token: process.env.ABACUSAI_API_KEY,
          }),
        }
      );

      const statusResult = await statusResponse.json();
      const status = statusResult?.status ?? 'FAILED';
      const result = statusResult?.result ?? null;

      if (status === 'SUCCESS') {
        if (result?.result) {
          const pdfBuffer = Buffer.from(result.result, 'base64');
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="Aura_Framing_Quote.pdf"',
            },
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'PDF generation completed but no result data' },
            { status: 500 }
          );
        }
      } else if (status === 'FAILED') {
        const errorMsg = result?.error ?? 'PDF generation failed';
        return NextResponse.json(
          { success: false, error: errorMsg },
          { status: 500 }
        );
      }

      attempts++;
    }

    return NextResponse.json(
      { success: false, error: 'PDF generation timed out' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}