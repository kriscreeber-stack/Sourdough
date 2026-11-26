# SlowRise

My home sourdough baking: bakes, recipes and notes, shared with friends. Hosted free on GitHub Pages.

## How to update it

All the content lives in the `data` folder. You can edit these files right on github.com (open the file, click the pencil icon, then **Commit changes**). The site updates about a minute later.

- `data/bakes.json`: one entry per bake (date, title, rating 1–5, summary, what to change next time, photo).
- `data/recipes.json`: recipes with weights in grams. Baker's percentages are worked out for you.
- `data/menu.json`: loaves and CHF prices for ordering later. `ordersOpen` stays `false` until ordering starts.

To add a photo, upload it into a `photos` folder and set `"photo": "photos/your-file.jpg"` on the bake.

## Pages

`index.html` (home), `bakes.html`, `recipes.html`, `about.html`, `order.html`. Styles are in `assets/style.css`, and `assets/site.js` turns the data files into pages.
