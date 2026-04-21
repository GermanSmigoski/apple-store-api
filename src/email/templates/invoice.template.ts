interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface InvoiceData {
  orderNumber: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function buildInvoiceHtml(data: InvoiceData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1d1d1f">${item.name}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#6e6e73;text-align:center">${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#6e6e73;text-align:right">${formatPrice(item.price)}</td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1d1d1f;text-align:right;font-weight:500">${formatPrice(item.subtotal)}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Order Confirmation — ${data.orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 20px">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

      <!-- Header -->
      <tr>
        <td style="background:#000;padding:24px 40px;border-radius:12px 12px 0 0" align="center">
          <span style="color:#fff;font-size:24px;font-weight:600;letter-spacing:-0.5px">&#xe  </span>
          <p style="color:#fff;font-size:22px;font-weight:600;margin:8px 0 0;letter-spacing:-0.3px">Apple Store</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#fff;padding:40px">

          <h1 style="font-size:28px;font-weight:600;color:#1d1d1f;margin:0 0 8px;letter-spacing:-0.5px">
            Thank you, ${data.customerName.split(' ')[0]}.
          </h1>
          <p style="font-size:16px;color:#6e6e73;margin:0 0 32px">
            Your order has been confirmed and is being prepared.
          </p>

          <!-- Order number badge -->
          <div style="background:#f5f5f7;border-radius:8px;padding:16px 20px;margin-bottom:32px">
            <p style="margin:0;font-size:12px;color:#6e6e73;text-transform:uppercase;letter-spacing:0.5px">Order Number</p>
            <p style="margin:4px 0 0;font-size:18px;font-weight:600;color:#1d1d1f;letter-spacing:1px">${data.orderNumber}</p>
          </div>

          <!-- Items table -->
          <h2 style="font-size:14px;font-weight:600;color:#1d1d1f;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.5px">
            Order Summary
          </h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <thead>
              <tr>
                <th style="font-size:12px;color:#6e6e73;font-weight:500;text-align:left;padding-bottom:8px;border-bottom:2px solid #f0f0f0">Product</th>
                <th style="font-size:12px;color:#6e6e73;font-weight:500;text-align:center;padding-bottom:8px;border-bottom:2px solid #f0f0f0">Qty</th>
                <th style="font-size:12px;color:#6e6e73;font-weight:500;text-align:right;padding-bottom:8px;border-bottom:2px solid #f0f0f0">Unit Price</th>
                <th style="font-size:12px;color:#6e6e73;font-weight:500;text-align:right;padding-bottom:8px;border-bottom:2px solid #f0f0f0">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px">
            <tr>
              <td style="font-size:14px;color:#6e6e73;padding:4px 0">Subtotal</td>
              <td style="font-size:14px;color:#6e6e73;text-align:right;padding:4px 0">${formatPrice(data.subtotal)}</td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#6e6e73;padding:4px 0">Tax (8%)</td>
              <td style="font-size:14px;color:#6e6e73;text-align:right;padding:4px 0">${formatPrice(data.tax)}</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:600;color:#1d1d1f;padding:12px 0 4px;border-top:2px solid #1d1d1f">Total</td>
              <td style="font-size:16px;font-weight:600;color:#1d1d1f;text-align:right;padding:12px 0 4px;border-top:2px solid #1d1d1f">${formatPrice(data.total)}</td>
            </tr>
          </table>

          <!-- Shipping address -->
          <div style="margin-top:40px;padding-top:32px;border-top:1px solid #f0f0f0">
            <h2 style="font-size:14px;font-weight:600;color:#1d1d1f;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px">
              Shipping To
            </h2>
            <p style="font-size:14px;color:#6e6e73;margin:0;line-height:1.6">
              ${data.customerName}<br />
              ${data.address.line1}${data.address.line2 ? '<br />' + data.address.line2 : ''}<br />
              ${data.address.city}, ${data.address.state} ${data.address.zip}<br />
              ${data.address.country}
            </p>
          </div>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f5f5f7;padding:24px 40px;border-radius:0 0 12px 12px;text-align:center">
          <p style="font-size:12px;color:#6e6e73;margin:0">
            Copyright &copy; ${new Date().getFullYear()} Apple Inc. All rights reserved.<br />
            <span style="color:#aaa">(This is a demo store — no real charges were made)</span>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
