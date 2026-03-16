const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const LawArticle = require('./models/LawArticle');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const publicDir = path.join(__dirname, 'public');
const seedArticles = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'law_articles.json'), 'utf8'));
const categoryMeta = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'categories.json'), 'utf8'));

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

let dbReady = false;

async function connectMongo() {
  if (!MONGODB_URI) {
    console.log('No MONGODB_URI found. Using local JSON fallback.');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    dbReady = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB connection failed. Using local JSON fallback.');
  }
}

function normalize(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.__v;
  return obj;
}

async function readArticlesFromStore() {
  if (!dbReady) return [...seedArticles];
  const docs = await LawArticle.find({ isPublished: true }).sort({ featured: -1, title: 1 });
  return docs.map(normalize);
}

function buildCategories(articles) {
  return categoryMeta.map((category) => ({
    ...category,
    articleCount: articles.filter((article) => article.category === category.slug).length,
  }));
}

app.get('/api/meta/categories', async (req, res) => {
  try {
    const articles = await readArticlesFromStore();
    res.json(buildCategories(articles));
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories' });
  }
});

app.get('/api/articles', async (req, res) => {
  try {
    const { category = '', q = '', featuredOnly = 'false', sort = 'featured' } = req.query;
    let articles = await readArticlesFromStore();

    if (category && category !== 'all') {
      articles = articles.filter((article) => article.category === category);
    }

    if (featuredOnly === 'true') {
      articles = articles.filter((article) => article.featured);
    }

    if (q.trim()) {
      const query = q.toLowerCase();
      articles = articles.filter((article) => {
        const haystack = [
          article.title,
          article.summary,
          ...(article.plainLanguage || []),
          ...(article.whatYouCanDo || []),
          ...(article.keywords || []),
          article.searchText || ''
        ].join(' ').toLowerCase();
        return haystack.includes(query);
      });
    }

    if (sort === 'az') {
      articles.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'time') {
      articles.sort((a, b) => parseInt(a.readTime, 10) - parseInt(b.readTime, 10));
    } else {
      articles.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    res.json({ total: articles.length, articles });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load articles' });
  }
});

app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let article = null;
    if (dbReady) {
      article = normalize(await LawArticle.findOne({ id, isPublished: true }));
    } else {
      article = seedArticles.find((item) => item.id === id && item.isPublished);
    }
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const allArticles = await readArticlesFromStore();
    const related = allArticles
      .filter((item) => item.category === article.category && item.id !== article.id)
      .slice(0, 3)
      .map((item) => ({ id: item.id, title: item.title, summary: item.summary }));

    res.json({ article, related });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load article' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mode: dbReady ? 'mongodb' : 'json-fallback' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'library.html'));
});

app.listen(PORT, async () => {
  await connectMongo();
  console.log(`LawConnect running on http://localhost:${PORT}`);
});
