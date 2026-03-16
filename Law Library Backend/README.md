# LawConnect Law Library

GitHub-ready LawConnect law library project with:
- fixed frontend filenames
- Express backend
- MongoDB with Mongoose
- seed data for 17 Sri Lankan law articles
- API routes that connect directly to the frontend pages

## Final stable frontend filenames
Keep these names exactly the same:

```text
public/
  library.html
  category.html
  article.html
  library.css
  library-data.js
  library-home.js
  category.js
  article.js
```

## Backend files
```text
server.js
package.json
.env.example
models/LawArticle.js
scripts/importSeed.js
data/law_articles.json
data/categories.json
```

## Setup
1. `npm install`
2. copy `.env.example` to `.env`
3. add your MongoDB connection string in `.env`
4. run `npm run seed`
5. run `npm run dev`
6. open `http://localhost:5000/library.html`

## API routes
- `GET /api/meta/categories`
- `GET /api/articles`
- `GET /api/articles?category=family`
- `GET /api/articles?featuredOnly=true`
- `GET /api/articles/:id`
- `GET /api/health`

## Notes
- If MongoDB is not connected, the app still works from the local JSON fallback.
- Once MongoDB is connected and seeded, the same frontend files will read from the database through the backend.
