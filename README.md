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

## Asking GitHub Copilot to make changes

**Copilot Chat (free plan).** Open this repository on github.com and click the Copilot icon at the top of the page. Ask in plain words, for example:

- "In data/bakes.json, add a bake from 30 November 2026 called 'Seeded loaf', rated 4, with the summary '…'."
- "Change the home page heading to 'Bread worth waiting for'."
- "Make the Order page say we bake on Fridays instead of Saturdays."

Copilot suggests the change. Then you apply it: open the file, click the pencil icon, paste the change, and click **Commit changes**.

**Copilot cloud agent (paid Copilot Pro plan).** Create an issue that describes the change, then assign it to **Copilot**, or start a task from the Agents tab. Copilot makes the change on a separate branch and opens a pull request. Look over the pull request, then click **Merge** to publish it.

The live site updates about a minute after a change lands on the `main` branch.
