// Renders the site's content from the JSON files in /data.
// To add a bake, recipe or research entry, edit the corresponding JSON file. No code changes needed.
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = (d) => {
    try { return new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return d; }
  };
  const load = (file) => fetch("data/" + file, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(file); return r.json(); });
  const sampleNote = (list) => list.some((x) => x.example)
    ? '<p class="sample-note">These are example entries to show the layout. Real ones are coming soon.</p>' : "";

  function bakeCard(b, recipes) {
    const recipe = recipes.find((r) => r.id === b.recipe);
    const photo = b.photo
      ? `<div class="photo"><img src="${esc(b.photo)}" alt="${esc(b.title)}" loading="lazy"></div>`
      : `<div class="photo" aria-hidden="true">Photo to come</div>`;
    return `<article class="bake">
      ${photo}
      <div class="meta"><time datetime="${esc(b.date)}">${esc(fmtDate(b.date))}</time>${recipe ? `<span>${esc(recipe.name)}</span>` : ""}<span class="rating" aria-label="Rated ${b.rating} of 5">${"●".repeat(b.rating || 0)}${"○".repeat(5 - (b.rating || 0))}</span></div>
      <h3>${esc(b.title)}</h3>
      <p>${esc(b.summary)}</p>
      ${b.nextTime ? `<p class="when">Next time: ${esc(b.nextTime)}</p>` : ""}
    </article>`;
  }

  function recipeBlock(r) {
    const flour = r.ingredients.filter((i) => i.flour).reduce((a, i) => a + i.grams, 0);
    const total = r.ingredients.reduce((a, i) => a + i.grams, 0);
    const rows = r.ingredients.map((i) => `<tr><td>${esc(i.name)}</td><td class="num">${i.grams} g</td><td class="num">${Math.round((i.grams / flour) * 1000) / 10}%</td></tr>`).join("");
    const steps = r.method.map((m) => `<li><span class="when">${esc(m.when)}</span>${esc(m.step)}</li>`).join("");
    return `<article class="stack" id="${esc(r.id)}">
      <div class="stack" style="gap:.5rem"><span class="eyebrow">${esc(r.yield)}</span><h2>${esc(r.name)}</h2><p class="lede">${esc(r.intro)}</p></div>
      <div class="recipe">
        <div class="stack"><h3>Ingredients</h3>
          <div class="table-scroll"><table class="formula">
            <thead><tr><th>Ingredient</th><th class="num">Weight</th><th class="num">Baker's %</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr><td>Total dough</td><td class="num">${total} g</td><td></td></tr></tfoot>
          </table></div>
          <p class="when">Baker's percentages are relative to total flour (${flour} g = 100%).</p>
        </div>
        <div class="stack"><h3>Method</h3><ol class="method">${steps}</ol></div>
      </div>
    </article>`;
  }

  function researchEntry(entry) {
    const year = entry.year == null ? "Year not listed" : String(entry.year);
    return `<article class="research-entry">
      <div class="research-meta"><span class="tag">${esc(entry.type || "Resource")}</span><span>${esc(entry.publisher || "")}</span><span>${esc(year)}</span></div>
      <h2>${esc(entry.title)}</h2>
      <p class="research-author">${esc(entry.authors)}</p>
      <p>${esc(entry.summary)}</p>
      <a href="${esc(entry.url)}" target="_blank" rel="noopener noreferrer">Read the original source <span aria-hidden="true">↗</span></a>
    </article>`;
  }

  function menuBlock(m) {
    const fmt = (n) => `${m.currency} ${n.toFixed(2)}`;
    const items = m.items.map((i) => `<div class="menu-item">
      <h3>${esc(i.name)}</h3><span class="price">${fmt(i.price)}</span>
      <p><span class="dot${i.available && m.ordersOpen ? " on" : ""}"></span>${i.available && m.ordersOpen ? "Available this week" : "Not taking orders yet"} · ${esc(i.description)}</p>
    </div>`).join("");
    return `<div class="menu">${items}</div>`;
  }

  const fail = (el) => { el.innerHTML = '<p class="sample-note">Content could not load. If you opened this file directly, view it through the website link instead.</p>'; };

  // Keep the Research page discoverable in the shared navigation on every page.
  const nav = document.querySelector(".nav");
  if (nav && !nav.querySelector('a[href="research.html"]')) {
    const link = document.createElement("a");
    link.href = "research.html";
    link.textContent = "Research";
    const about = nav.querySelector('a[href="about.html"]');
    nav.insertBefore(link, about || null);
  }

  const bakesEl = document.getElementById("bakes");
  const recipesEl = document.getElementById("recipes");
  const researchEl = document.getElementById("research");
  const menuEl = document.getElementById("menu");

  if (bakesEl) {
    Promise.all([load("bakes.json"), load("recipes.json")]).then(([bakes, recipes]) => {
      bakes.sort((a, b) => b.date.localeCompare(a.date));
      const limit = Number(bakesEl.dataset.limit) || bakes.length;
      const shown = bakes.slice(0, limit);
      bakesEl.innerHTML = `<div class="bakes">${shown.map((b) => bakeCard(b, recipes)).join("")}</div>${sampleNote(shown)}`;
    }).catch(() => fail(bakesEl));
  }
  if (recipesEl) {
    load("recipes.json").then((recipes) => {
      recipesEl.innerHTML = `<div class="stack" style="gap:4rem">${recipes.map(recipeBlock).join("")}</div>${sampleNote(recipes)}`;
    }).catch(() => fail(recipesEl));
  }
  if (researchEl) {
    load("research.json").then((entries) => {
      researchEl.innerHTML = `<div class="research-list">${entries.map(researchEntry).join("")}</div>`;
    }).catch(() => fail(researchEl));
  }
  if (menuEl) {
    load("menu.json").then((m) => { menuEl.innerHTML = menuBlock(m); }).catch(() => fail(menuEl));
  }
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
