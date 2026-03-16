const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LawArticle = require('../models/LawArticle');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const seedPath = path.join(__dirname, '..', 'data', 'law_articles.json');
const articles = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

async function run() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in .env');
  }
  await mongoose.connect(MONGODB_URI);
  await LawArticle.deleteMany({});
  await LawArticle.insertMany(articles);
  console.log(`Imported ${articles.length} law articles`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
