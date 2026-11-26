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

  const bakerImplications = {
    landis2021: ["Starter care", "Treat your starter as an individual: use a consistent feeding routine and note how long it takes to rise, when it peaks, and how it smells. Use those repeatable signs—not a universal clock—to decide when it is ready to leaven dough."],
    reese2020: ["Starter care and flour choice", "For a reliable baseline, keep the flour and feeding routine steady while you learn how your starter behaves. If you change flour or routine, give the culture time to settle and observe it before changing several other variables."],
    minervini2014: ["Starter feeding and fermentation planning", "Use feed ratio, temperature, hydration, flour, and refresh frequency as connected controls. A larger refresh generally gives the culture more fresh food and can take longer to peak; judge readiness by activity and your dough schedule rather than assuming a fixed ratio guarantees a particular flavour."],
    devuyst2005: ["Starter maintenance", "Regular feeds and a reasonably consistent environment help keep a starter predictable. After a substantial change in flour, temperature, or feeding schedule, expect its rise pattern and aroma to shift temporarily; observe a few feeds before relying on your usual timing."],
    ganzle1998: ["Bulk fermentation and proof timing", "Dough temperature changes fermentation speed, so use temperature to help plan your schedule. Warmer dough usually progresses faster and cooler dough more slowly; watch dough expansion and texture, and do not treat one study's organism-specific optimum as a universal home-baking target."],
    ganzle2014: ["Bulk fermentation and cold proof", "Fermentation time and temperature shape acidity and aroma. A cool, longer proof can develop flavour, but it also extends fermentation: monitor dough strength and proof rather than extending time blindly, especially if the dough is already very active."],
    arendt2007: ["Bulk fermentation and dough handling", "Acidity and enzyme activity affect dough strength and crumb. If a loaf spreads or feels slack, compare dough temperature and bulk-fermentation progress across bakes; over-fermentation is one possibility, but flour strength, hydration, and shaping also matter."],
    rizzello2007: ["Safety and claims about the finished loaf", "This study used selected cultures and controlled processing, so it does not show that an ordinary home sourdough becomes gluten-free. Sourdough bread is not safe for someone with coeliac disease; use medically appropriate gluten-free food and avoid cross-contamination."],
    scazzina2009: ["Choosing and eating the finished loaf", "The reported blood-glucose response is a result from a specific comparison, not a promise for every sourdough or person. Flour, recipe, fermentation, serving size, and individual health all matter; do not use this study to make treatment decisions."],
    "ka-create": ["Building a starter", "Use the guide's day-by-day signs to follow activity, but allow for variation in room temperature and flour. A new starter may have an early burst and then quieten; wait for dependable, repeated rising after feeds before relying on it to raise bread."],
    "ka-maintain": ["Starter storage and refresh before baking", "A refrigerated routine can reduce daily maintenance for occasional bakers. Refresh the starter ahead of mixing and check that it has regained reliable activity; adjust the lead time to your kitchen temperature and the starter's response."],
    "perfectloaf-starter": ["Building a starter and choosing flour", "Whole-grain flour, including rye, can provide a nutrient-rich start, but it is not essential and a starter can behave differently with different flours. Choose a flour you can keep using, and track rise and aroma as it develops."],
    "ka-bakers-pct": ["Scaling and mixing the dough", "Baker's percentages make it easier to scale a formula while preserving ingredient proportions. Scale every ingredient against total flour, and remember that starter contains both flour and water—include those amounts in the formula when calculating true hydration." ]
  };

  function bakeCard(b, recipes) {
    const recipe = recipes.find((r) => r.id === b.recipe);
    const photo = b.photo
      ? `<div class="photo"><img src="${esc(b.photo)}" alt="${esc(b.title)}" loading="lazy"></div>`
      : `<div class="photo" aria-hidden="true">Photo to come</div>`;
    return `<article class="bake">
      ${photo}
      <div class="meta"><time datetime="${esc(b.date)}">${esc(fmtDate(b.date))}</time>${recipe ? `<span>${esc(recipe.name)}</span>` : ""}<span class="rating" aria-label="Rated ${b.rating} of 5">${[...Array(5)].map((_, i) => i < b.rating ? "★" : "☆").join("")}</span></div>
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
    const implication = entry.homeBaker || bakerImplications[entry.id];
    const bakerNote = implication
      ? `<section class="home-baker"><h3>What does this mean for the home baker?</h3><p class="when">Relevant stage: ${esc(implication[0])}</p><p>${esc(implication[1])}</p></section>`
      : entry.takeaway ? `<section class="home-baker"><h3>What does this mean for the home baker?</h3><p>${esc(entry.takeaway)}</p></section>` : "";
    return `<article class="research-entry">
      <div class="research-meta"><span class="tag">${esc(entry.type || "Resource")}</span><span>${esc(entry.publisher || "")}</span><span>${esc(year)}</span></div>
      <h2>${esc(entry.title)}</h2>
      <p class="research-author">${esc(entry.authors)}</p>
      <p>${esc(entry.summary)}</p>
      ${bakerNote}
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
