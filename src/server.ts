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
  {
    slug: 'etiopia-yirgacheffe-natural',
    name: 'Etiopía Yirgacheffe',
    tagline: 'El café que huele a jazmín y sabe a durazno.',
    description: 'Un natural de proceso lento de la región de Yirgacheffe, considerada la cuna del café. Este lote proviene de la familia Dukamo, que cultiva en las alturas de Kochere a más de 1.950 metros. Cada cereza se seca al sol por 30 días sobre camas elevadas, desarrollando una dulzura frutal única.',
    price: 189000,
    images: ['https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=800&q=80'],
    category: 'africa',
    featured: true,
    specs: {
      'Origen': 'Etiopía · Yirgacheffe, Kochere',
      'Altitud': '1.950 – 2.100 msnm',
      'Proceso': 'Natural (secado en camas elevadas)',
      'Tueste': 'Ligero',
      'Notas': 'Durazno, jazmín, té negro, miel de abeja',
      'Productor': 'Familia Dukamo',
      'Cosecha': '2024',
      'Historia': 'Los Dukamo llevan tres generaciones en estas laderas. Cuando los visité por primera vez, me recibieron con un café preparado en jebena — la ceremonia tradicional etíope. Ese primer sorbo cambió todo lo que creía saber sobre café.'
    },
    stock: 40
  },
  {
    slug: 'kenya-aa-kirinyaga',
    name: 'Kenia AA Kirinyaga',
    tagline: 'Acidez vibrante. Fruta negra y vino.',
    description: 'Lote AA del Monte Kenia, procesado en la cooperativa Ngariama. El varietal SL28 y SL34 cultivado en los suelos volcánicos ricos en fósforo del Condado de Kirinyaga produce una de las tazas más complejas de África oriental.',
    price: 215000,
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80'],
    category: 'africa',
    featured: true,
    specs: {
      'Origen': 'Kenia · Condado de Kirinyaga',
      'Altitud': '1.700 – 1.900 msnm',
      'Proceso': 'Lavado doble fermentación',
      'Tueste': 'Ligero-Medio',
      'Notas': 'Grosella negra, vino tinto, tamarindo, azúcar negra',
      'Varietal': 'SL28, SL34',
      'Cooperativa': 'Ngariama Farmers',
      'Historia': 'El sistema de doble fermentación keniano es único en el mundo. En Kirinyaga lo vi de cerca: cerezas seleccionadas a mano, pulpadas en el día, fermentadas 24 horas, lavadas en canales de agua limpia. Un proceso de una precisión obsesiva.'
    },
    stock: 30
  },
  {
    slug: 'colombia-huila-washed',
    name: 'Colombia Huila',
    tagline: 'Caramelo, manzana roja, chocolate suizo.',
    description: 'Micro-lote de la finca El Paraíso, en las montañas del Macizo Colombiano. Don Rodrigo García, tercera generación caficultor, selecciona cada cereza en su punto exacto de maduración. Un lavado clásico que saca lo mejor del varietal Caturra.',
    price: 165000,
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80'],
    category: 'latinoamerica',
    featured: true,
    specs: {
      'Origen': 'Colombia · Huila, Macizo Colombiano',
      'Altitud': '1.750 – 1.950 msnm',
      'Proceso': 'Lavado',
      'Tueste': 'Medio',
      'Notas': 'Caramelo, manzana roja, chocolate con leche, nuez',
      'Varietal': 'Caturra, Castillo',
      'Productor': 'Don Rodrigo García',
      'Historia': 'Don Rodrigo me dijo algo que no olvidé: "El café malo se hace en la planta, el café bueno se hace en la mano." Recorre su finca todos los días, palpa las cerezas, huele las flores. La calidad no es accidente en El Paraíso.'
    },
    stock: 50
  },
  {
    slug: 'guatemala-antigua-honey',
    name: 'Guatemala Antigua',
    tagline: 'Miel, especias, y un abrazo de cuerpo.',
    description: 'Procesado en honey sobre las laderas del volcán Agua en Antigua, este café del productor Marcos Orozco combina la dulzura de un natural con la limpieza de un lavado. El resultado es una taza redonda, especiada y de cuerpo notable.',
    price: 158000,
    images: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80'],
    category: 'latinoamerica',
    featured: false,
    specs: {
      'Origen': 'Guatemala · Antigua, Sacatepéquez',
      'Altitud': '1.500 – 1.700 msnm',
      'Proceso': 'Honey (Yellow)',
      'Tueste': 'Medio',
      'Notas': 'Panela, cardamomo, ciruela, chocolate amargo',
      'Varietal': 'Bourbon, Caturra',
      'Productor': 'Marcos Orozco',
      'Historia': 'El proceso honey de Marcos es particular: deja un 40% de mucílago sobre el grano y lo mueve a mano cuatro veces al día durante 18 días. Es laborioso, casi meditativo. Pero en taza, ese trabajo se siente.'
    },
    stock: 45
  },
  {
    slug: 'peru-cusco-washed',
    name: 'Perú Cusco',
    tagline: 'Limpio, equilibrado, chocolate al vino.',
    description: 'De las alturas de la comunidad Quechua de Yanatile, en el Valle de La Convención. Este lote lavado de la variedad Typica es un café de una limpieza excepcional y un equilibrio perfecto entre acidez y dulzura.',
    price: 142000,
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'],
    category: 'latinoamerica',
    featured: false,
    specs: {
      'Origen': 'Perú · Cusco, Valle de La Convención',
      'Altitud': '1.600 – 1.900 msnm',
      'Proceso': 'Lavado',
      'Tueste': 'Ligero-Medio',
      'Notas': 'Chocolate negro, uva, mandarina, azúcar rubia',
      'Varietal': 'Typica, Bourbon',
      'Comunidad': 'COCLA · Yanatile',
      'Historia': 'La comunidad de Yanatile produce a 3.200 metros sobre el nivel del mar. Cuando llegamos a buscar el lote, tardamos 6 horas en 4x4 desde Cusco. Esos productores no tienen un supermercado cerca. Tienen café, y lo cuidan como un tesoro.'
    },
    stock: 35
  },
  {
    slug: 'indonesia-sumatra-mandheling',
    name: 'Sumatra Mandheling',
    tagline: 'Tierra, cedro, chocolate oscuro.',
    description: 'El icónico Mandheling de la región de Lintong en el norte de Sumatra. Procesado en húmedo (wet-hulled o Giling Basah), este método único indonesio produce un perfil terroso y de cuerpo excepcional que no encontrarás en ningún otro origen.',
    price: 172000,
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80'],
    category: 'asia',
    featured: false,
    specs: {
      'Origen': 'Indonesia · Sumatra, Lintong',
      'Altitud': '1.100 – 1.500 msnm',
      'Proceso': 'Wet-Hulled (Giling Basah)',
      'Tueste': 'Medio-Oscuro',
      'Notas': 'Cedro, tabaco, chocolate amargo, tierra húmeda',
      'Varietal': 'Sumatra Typica, Tim Tim',
      'Historia': 'El Giling Basah es el método que hace al Sumatra inconfundible. El pergamino se retira del grano cuando todavía tiene 25-35% de humedad, creando esa textura única y ese perfil terroso que divide aguas. A mí me conquistó en la primera taza.'
    },
    stock: 25
  },
  {
    slug: 'panama-geisha-boquete',
    name: 'Panamá Geisha',
    tagline: 'El café más elegante del mundo.',
    description: 'El varietal Geisha de las alturas de Boquete, Chiriquí. El mismo origen que en 2004 cambió la industria del café especialidad para siempre. Este lote lavado de la Finca Lerida expresa la floritura y el jasmin que hicieron famoso a este varietal.',
    price: 480000,
    images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80'],
    category: 'latinoamerica',
    featured: true,
    specs: {
      'Origen': 'Panamá · Boquete, Chiriquí',
      'Altitud': '1.600 – 1.900 msnm',
      'Proceso': 'Lavado',
      'Tueste': 'Ligero',
      'Notas': 'Jazmín, durazno blanco, bergamota, té de flores',
      'Varietal': 'Geisha (Harar)',
      'Finca': 'Finca Lerida',
      'Historia': 'El Geisha es el varietal que le demostró al mundo que el café podía ser tan complejo como el mejor vino. La primera vez que lo cateé, pensé que alguien había puesto flores en mi taza. No hay otra experiencia igual en el mundo del café.'
    },
    stock: 15
  },
  {
    slug: 'blend-buenos-aires',
    name: 'Blend Buenos Aires',
    tagline: 'Nuestro homenaje a la ciudad.',
    description: 'Creado especialmente para espresso, este blend combina un Brazil Cerrado con un Colombia Huila en una proporción 60/40. El resultado es una base chocolatosa con acidez justa, ideal para cortado, latte o para tomar solo como los porteños.',
    price: 128000,
    images: ['https://images.unsplash.com/photo-1487790945753-f89b1a693d1d?w=800&q=80'],
    category: 'blend',
    featured: false,
    specs: {
      'Composición': 'Brazil Cerrado 60% + Colombia Huila 40%',
      'Proceso': 'Lavado + Natural',
      'Tueste': 'Medio-Oscuro',
      'Notas': 'Chocolate con leche, avellana, dulce de leche, cuerpo cremoso',
      'Ideal para': 'Espresso, cortado, latte',
      'Historia': 'Este blend lo desarrollamos con una sola pregunta en mente: ¿qué café elegiría un porteño de toda la vida? Uno que te abrace, que sea redondo, que no moleste pero que tampoco sea aburrido. Creemos que lo logramos.'
    },
    stock: 80
  },
  {
    slug: 'etiopia-guji-natural',
    name: 'Etiopía Guji',
    tagline: 'Frambuesa, rosa, vino blanco.',
    description: 'De la zona de Guji en el sur de Etiopía, este natural de la cooperativa Shakiso Express es uno de los cafés más vibrantes que tuvimos en Origen. Notas de frambuesa fresca y rosa que evolucionan a vino blanco a medida que enfría.',
    price: 198000,
    images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80'],
    category: 'africa',
    featured: false,
    specs: {
      'Origen': 'Etiopía · Guji, Shakiso',
      'Altitud': '1.900 – 2.200 msnm',
      'Proceso': 'Natural',
      'Tueste': 'Ligero',
      'Notas': 'Frambuesa, rosa, vino blanco, maracuyá',
      'Cooperativa': 'Shakiso Express',
      'Cosecha': '2024',
      'Historia': 'Guji es la región que compite con Yirgacheffe por el trono etíope. Los cafés de Shakiso son más salvajes, más frutales, más expresivos. La primera vez que catamos este lote, todos en el equipo paramos y nos miramos: "¿Seguro que esto es café?"'
    },
    stock: 20
  },
  {
    slug: 'colombia-nariño-washed',
    name: 'Colombia Nariño',
    tagline: 'Dulzura de panela, mandarina, limpieza total.',
    description: 'Del extremo sur de Colombia, en las montañas que bordean Ecuador. Los cafés de Nariño crecen en uno de los terroirs más singulares del país: suelos volcánicos, temperaturas frías y una diferencia térmica día-noche que potencia el desarrollo del azúcar en la cereza.',
    price: 155000,
    images: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80'],
    category: 'latinoamerica',
    featured: false,
    specs: {
      'Origen': 'Colombia · Nariño, La Unión',
      'Altitud': '1.800 – 2.100 msnm',
      'Proceso': 'Lavado',
      'Tueste': 'Ligero',
      'Notas': 'Panela, mandarina, pera, té verde',
      'Varietal': 'Caturra, Colombia',
      'Productor': 'Asociación ASPROCAFE',
      'Historia': 'En Nariño hay una paradoja climática: está cerca del ecuador, pero la altitud y las corrientes del Pacífico hacen que las temperaturas bajen hasta 8°C de noche. Eso hace que la cereza madure lento, concentrando azúcares. El resultado es una dulzura que no necesita ser explicada.'
    },
    stock: 40
  },
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
    <p style="color:#fff;font-size:22px;font-weight:600;margin:0;letter-spacing:0.15em;font-family:Georgia,serif">ORIGEN</p>
  </td></tr>
  <tr><td style="background:#fff;padding:40px">
    <h1 style="font-size:28px;font-weight:600;color:#1d1d1f;margin:0 0 8px;letter-spacing:-0.5px;font-family:Georgia,serif">Gracias, ${order.customer.name.split(' ')[0]}.</h1>
    <p style="font-size:16px;color:#6e6e73;margin:0 0 32px">Tu pedido fue confirmado. Pronto lo estamos preparando.</p>
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
    <p style="font-size:12px;color:#6e6e73;margin:0">Copyright &copy; ${new Date().getFullYear()} Origen Coffee &nbsp;·&nbsp; <span style="color:#aaa">Tienda demo — sin cobros reales</span></p>
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
      subject: `Tu pedido en Origen Coffee — ${order.orderNumber}`,
      html: buildInvoice(order as IOrder),
    }).catch(console.error);

    res.status(201).json({ data: { _id: order._id, orderNumber: order.orderNumber, total: order.total, status: order.status } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default app;
