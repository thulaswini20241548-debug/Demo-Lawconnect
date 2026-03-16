const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
}, { _id: false });

const lawArticleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, index: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  readTime: { type: String, required: true },
  lastUpdated: { type: String, required: true },
  plainLanguage: [{ type: String }],
  whatYouCanDo: [{ type: String }],
  whenToContactLawyer: { type: String, default: '' },
  keyTakeaway: { type: String, default: '' },
  sources: [sourceSchema],
  keywords: [{ type: String }],
  language: { type: String, default: 'English' },
  country: { type: String, default: 'Sri Lanka' },
  featured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  searchText: { type: String, default: '' }
}, { timestamps: true, collection: 'law_articles' });

module.exports = mongoose.model('LawArticle', lawArticleSchema);
