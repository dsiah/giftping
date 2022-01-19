import express from 'express';
import multer from 'multer';
import path from 'path';
import { auth, requiresAuth } from 'express-openid-connect';
import { Client } from 'pg';
import { promisify } from 'util';
import fs from 'fs';
import convert from 'heic-convert';
import {
  buildGetGiftQuery,
  buildPostGiftQuery,
  buildDeleteGiftQuery,
  buildGetGiftQueryByAuthor,
} from './utils/pg';

const storage = multer.diskStorage({
  destination: (req, file, next) => {
    next(null, 'uploads/');
  },
  filename: (req, file, next) => {
    next(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ dest: 'uploads/', storage });

const port = 3000;
const app = express();

app.use(express.json());
app.set('view engine', 'pug');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.GIFTING_SECRET,
  baseURL: `http://localhost:${port}`,
  clientID: process.env.GIFTING_AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.GIFTING_AUTH0_ISSUER_BASE_URL,
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
app.use(express.static(path.join(__dirname, '../uploads')));

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});
client.connect();

app.get('/', requiresAuth(), async (req, res) => {
  const query = buildGetGiftQueryByAuthor(req.oidc.user.sub);
  const gifts = await client.query(query);

  res.render('gift-index', {
    title: 'Your Gifts',
    gifts: gifts.rows,
  });
});

app.get('/profile', requiresAuth(), async (req, res) => {
  res.json(req.oidc.user);
});

app.get('/gift/:giftId', requiresAuth(), async (req, res) => {
  const statement = buildGetGiftQuery(Number.parseInt(req.params.giftId));
  const gift = await client.query(statement);

  return res.json(gift.rows); // TODO
});

app.get('/gift', requiresAuth(), async (req, res) => {
  res.render('add-gift', {});
});

app.post('/gift', requiresAuth(), upload.single('image'), async (req, res) => {
  const author = req.oidc.user.sub;
  const filePath = req.file ? { file: req.file.path } : {};
  const statement = buildPostGiftQuery({ ...req.body, author, ...filePath });

  const dbRes = await client.query(statement);

  res.render('add-gift', { dbRes }); // TODO add 'toast' notification for success

  if (req.file?.path.indexOf('HEIC') > -1) {
    const fpath = path.join(__dirname, `../${req.file.path}`);
    const inputBuffer = await promisify(fs.readFile)(fpath);
    const images = await convert.all({
      buffer: inputBuffer, // the HEIC file buffer
      format: 'JPEG', // output format
    });

    for (let idx in images) {
      const image = images[idx];
      const outputBuffer = await image.convert();
      const opath = path.join(__dirname, `../${req.file.path}.jpg`);
      await promisify(fs.writeFile)(opath, outputBuffer);
    }
  }
});

app.delete('/gift/:giftId', requiresAuth(), async (req, res) => {
  const statement = buildDeleteGiftQuery(Number.parseInt(req.params.giftId));

  await client.query(statement);

  res.json({ deletedId: req.params.giftId });
});

app.listen(port, () => {
  console.log(`✨ GiftPing ✨ listening at http://localhost:${port}`);
});
