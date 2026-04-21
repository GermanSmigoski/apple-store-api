import 'reflect-metadata';
import express from 'express';
import mongoose, { Schema, model, Document, Types } from 'mongoose';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IProduct extends Document {
  slug: string; name: string; tagline: string; description: string;
  price: number; images: string[]; category: string; featured: boolean;
  specs: Record<string, string>; stock: number;
}

interface IOrderItem {
  productId: Types.ObjectId; name: string; price: number;
  quantity: number; subtotal: number; image: string;
}

interface IOrder extends Document {
  orderNumber: string; status: string;
  customer: { name: string; email: string; address: { line1: string; line2?: string; city: string; state: string; zip: string; country: string } };
  items: IOrderItem[]; subtotal: number; tax: number; total: number;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ProductSchema = new Schema<IProduct>({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [String],
  category: { type: String, required: true },
  featured: { type: Boolean, default: false },
  specs: { type: Schema.Types.Mixed, default: {} },
  stock: { type: Number, default: 50 },
}, { timestamps: true });

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  status: { type: String, default: 'paid' },
  customer: {
    name: String, email: String,
    address: { line1: String, line2: String, city: String, state: String, zip: String, country: { type: String, default: 'US' } },
  },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String, price: Number, quantity: Number, subtotal: Number, image: String,
  }],
  subtotal: Number, tax: Number, total: Number,
}, { timestamps: true });

const Product = model<IProduct>('Product', ProductSchema);
const Order = model<IOrder>('Order', OrderSchema);

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED = [
  { slug:'macbook-pro-14-m3-pro', name:'MacBook Pro 14"', tagline:'Supercharged by M3 Pro.', description:'MacBook Pro with M3 Pro delivers breakthrough performance. With up to 18 hours of battery life and a Liquid Retina XDR display, it redefines what a pro laptop can do.', price:199900, images:['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'], category:'mac', featured:true, specs:{'Chip':'Apple M3 Pro','CPU':'11-core','GPU':'14-core','Memory':'18GB','Storage':'512GB SSD','Display':'14.2" Liquid Retina XDR','Battery':'Up to 18h'}, stock:30 },
  { slug:'macbook-air-13-m2', name:'MacBook Air 13"', tagline:'Strikingly thin. Surprisingly powerful.', description:'The redesigned MacBook Air with M2 is incredibly thin and delivers remarkable performance with up to 18 hours of battery life.', price:109900, images:['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80'], category:'mac', featured:false, specs:{'Chip':'Apple M2','CPU':'8-core','GPU':'8-core','Memory':'8GB','Storage':'256GB SSD','Display':'13.6" Liquid Retina','Battery':'Up to 18h'}, stock:45 },
  { slug:'iphone-15-pro', name:'iPhone 15 Pro', tagline:'Titanium. So strong. So light. So Pro.', description:'iPhone 15 Pro features titanium design, A17 Pro chip, and 5x optical zoom. The most powerful iPhone ever made.', price:99900, images:['https://images.unsplash.com/photo-1695048133142-1a20484429be?w=800&q=80'], category:'iphone', featured:true, specs:{'Chip':'A17 Pro','Display':'6.1" Super Retina XDR','Camera':'48MP | 12MP Ultra Wide | 5x Telephoto','Storage':'128GB','Battery':'Up to 23h'}, stock:60 },
  { slug:'iphone-15', name:'iPhone 15', tagline:'A total powerhouse.', description:'iPhone 15 features the Dynamic Island, 48MP camera, A16 Bionic chip, and USB-C with up to 26 hours of battery life.', price:79900, images:['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80'], category:'iphone', featured:false, specs:{'Chip':'A16 Bionic','Display':'6.1" Super Retina XDR','Camera':'48MP | 12MP Ultra Wide','Storage':'128GB','Connector':'USB-C'}, stock:80 },
  { slug:'ipad-pro-12-m2', name:'iPad Pro 12.9"', tagline:'Impossibly thin. Incredibly powerful.', description:'iPad Pro with M2 chip and Liquid Retina XDR display. Wi-Fi 6E, Apple Pencil hover, and blazing fast performance.', price:109900, images:['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80'], category:'ipad', featured:false, specs:{'Chip':'Apple M2','Display':'12.9" Liquid Retina XDR','Storage':'128GB','Connectivity':'Wi-Fi 6E','Face ID':'Yes'}, stock:25 },
  { slug:'airpods-pro-2nd-gen', name:'AirPods Pro', tagline:'Adaptive Audio. Now playing.', description:'AirPods Pro with H2 chip feature Adaptive Audio, 2x more ANC, and personalized Spatial Audio for an immersive listening experience.', price:24900, images:['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'], category:'airpods', featured:true, specs:{'Chip':'Apple H2','Noise Cancellation':'Active','Battery':'Up to 6h (30h with case)','Water Resistance':'IPX4','Connectivity':'Bluetooth 5.3'}, stock:100 },
  { slug:'airpods-3rd-gen', name:'AirPods (3rd gen)', tagline:'Contoured comfort. Dynamic sound.', description:'AirPods 3rd generation with Spatial Audio, Adaptive EQ, and MagSafe Charging Case for up to 30 hours total listening time.', price:16900, images:['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80'], category:'airpods', featured:false, specs:{'Chip':'Apple H1','Battery':'Up to 6h (30h with case)','Water Resistance':'IPX4','Charging':'MagSafe'}, stock:90 },
  { slug:'apple-watch-series-9', name:'Apple Watch Series 9', tagline:'Smarter. Brighter. Mightier.', description:'Apple Watch Series 9 with S9 chip, Double Tap gesture, and the brightest always-on display ever on Apple Watch.', price:39900, images:['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80'], category:'watch', featured:false, specs:{'Chip':'Apple S9','Display':'Always-On Retina LTPO OLED','Health':'ECG | Blood Oxygen | Heart Rate','Battery':'Up to 18h','Water':'50 meters'}, stock:40 },
  { slug:'magsafe-charger', name:'MagSafe Charger', tagline:'Perfectly aligned. Instantly charged.', description:'MagSafe Charger connects magnetically to iPhone for faster wireless charging up to 15W with a flexible 1m cable.', price:3900, images:['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'], category:'accessories', featured:false, specs:{'Compatibility':'iPhone 12+','Power':'Up to 15W','Cable':'1m','Connector':'USB-C'}, stock:200 },
  { slug:'apple-pencil-2nd-gen', name:'Apple Pencil (2nd gen)', tagline:'The most capable Apple Pencil yet.', description:'Apple Pencil 2nd generation with magnetic attach, wireless charging, pixel-perfect precision, and Double Tap to switch tools.', price:12900, images:['https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80'], category:'accessories', featured:false, specs:{'Compatibility':'iPad Pro (3rd gen+), iPad Air (4th gen+)','Charging':'Wireless MagSafe','Latency':'9ms','Double Tap':'Switch tools'}, stock:70 },
];

// ─── Email ────────────────────────────────────────────────────────────────────

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}`; }

function buildInvoice(order: IOrder): string {
  const rows = order.items.map(i => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1d1d1f">${i.name}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#6e6e73;text-align:center">${i.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#6e6e73;text-align:right">${fmt(i.price)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:500;text-align:right">${fmt(i.subtotal)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <tr><td style="background:#000;padding:24px 40px;border-radius:12px 12px 0 0;text-align:center">
    <p style="color:#fff;font-size:22px;font-weight:600;margin:0;letter-spacing:-0.3px">Apple Store</p>
  </td></tr>
  <tr><td style="background:#fff;padding:40px">
    <h1 style="font-size:28px;font-weight:600;color:#1d1d1f;margin:0 0 8px;letter-spacing:-0.5px">Thank you, ${order.customer.name.split(' ')[0]}.</h1>
    <p style="font-size:16px;color:#6e6e73;margin:0 0 32px">Your order has been confirmed.</p>
    <div style="background:#f5f5f7;border-radius:8px;padding:16px 20px;margin-bottom:32px">
      <p style="margin:0;font-size:12px;color:#6e6e73;text-transform:uppercase;letter-spacing:0.5px">Order Number</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:600;color:#1d1d1f;letter-spacing:1px">${order.orderNumber}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <thead><tr>
        <th style="font-size:12px;color:#6e6e73;font-weight:500;text-align:left;padding-bottom:8px;border-bottom:2px solid #f0f0f0">Product</th>
        <th style="font-size:12px;color:#6e6e73;font-weight:500;text-align:center;padding-bottom:8px;border-bottom:2px solid #f0f0f0">Qty</th>
        <th style="font-size:12px;color:#6e6e73;font-weight:500;text-align:right;padding-bottom:8px;border-bottom:2px solid #f0f0f0">Unit</th>
        <th style="font-size:12px;color:#6e6e73;font-weight:500;text-align:right;padding-bottom:8px;border-bottom:2px solid #f0f0f0">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px">
      <tr><td style="font-size:14px;color:#6e6e73;padding:4px 0">Subtotal</td><td style="font-size:14px;color:#6e6e73;text-align:right;padding:4px 0">${fmt(order.subtotal)}</td></tr>
      <tr><td style="font-size:14px;color:#6e6e73;padding:4px 0">Tax (8%)</td><td style="font-size:14px;color:#6e6e73;text-align:right;padding:4px 0">${fmt(order.tax)}</td></tr>
      <tr><td style="font-size:16px;font-weight:600;color:#1d1d1f;padding:12px 0 4px;border-top:2px solid #1d1d1f">Total</td><td style="font-size:16px;font-weight:600;color:#1d1d1f;text-align:right;padding:12px 0 4px;border-top:2px solid #1d1d1f">${fmt(order.total)}</td></tr>
    </table>
    <div style="margin-top:40px;padding-top:32px;border-top:1px solid #f0f0f0">
      <h2 style="font-size:14px;font-weight:600;color:#1d1d1f;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px">Shipping To</h2>
      <p style="font-size:14px;color:#6e6e73;margin:0;line-height:1.6">${order.customer.name}<br/>${order.customer.address.line1}<br/>${order.customer.address.city}, ${order.customer.address.state} ${order.customer.address.zip}</p>
    </div>
  </td></tr>
  <tr><td style="background:#f5f5f7;padding:24px;border-radius:0 0 12px 12px;text-align:center">
    <p style="font-size:12px;color:#6e6e73;margin:0">Copyright &copy; ${new Date().getFullYear()} Apple Inc. &nbsp;·&nbsp; <span style="color:#aaa">Demo store — no real charges</span></p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

// ─── DB connection ────────────────────────────────────────────────────────────

let connected = false;
async function connectDB() {
  if (connected || mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });
  connected = true;
  // Seed if empty
  const count = await Product.countDocuments();
  if (count === 0) await Product.insertMany(SEED);
}

// ─── App ──────────────────────────────────────────────────────────────────────

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function genId() { return Array.from(randomBytes(8), b => ALPHABET[b % ALPHABET.length]).join(''); }

const app = express();
app.use(express.json());
app.use((_req, res, next) => {
  const origin = _req.headers.origin ?? '';
  const allowed = [process.env.FRONTEND_URL ?? '', 'http://localhost:5173', 'http://localhost:4173'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (_req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

// Health
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured !== undefined) filter.featured = req.query.featured === 'true';
    const data = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ data, total: data.length });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/products/:idOrSlug
app.get('/api/products/:idOrSlug', async (req, res) => {
  try {
    await connectDB();
    const { idOrSlug } = req.params;
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
    const product = isObjectId
      ? await Product.findById(idOrSlug)
      : await Product.findOne({ slug: idOrSlug });
    if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
    res.json({ data: product });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  try {
    await connectDB();
    const { customer, items } = req.body;
    if (!customer || !items?.length) { res.status(400).json({ error: 'customer and items required' }); return; }

    const resolvedItems = await Promise.all(items.map(async (item: { productId: string; quantity: number }) => {
      const p = await Product.findById(item.productId);
      if (!p) throw new Error(`Product not found: ${item.productId}`);
      return { productId: p._id, name: p.name, price: p.price, quantity: item.quantity, subtotal: p.price * item.quantity, image: p.images?.[0] ?? '' };
    }));

    const subtotal = resolvedItems.reduce((a, i) => a + i.subtotal, 0);
    const tax = Math.round(subtotal * 0.08);
    const order = await Order.create({
      orderNumber: `ORD-${genId()}`, status: 'paid', customer,
      items: resolvedItems, subtotal, tax, total: subtotal + tax,
    });

    // Fire-and-forget email
    const resend = new Resend(process.env.RESEND_API_KEY);
    resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
      to: customer.email,
      subject: `Your Apple Store Order — ${order.orderNumber}`,
      html: buildInvoice(order as IOrder),
    }).catch(console.error);

    res.status(201).json({ data: { _id: order._id, orderNumber: order.orderNumber, total: order.total, status: order.status } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default app;
