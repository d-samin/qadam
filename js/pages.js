// Страницы направления (category.html) и особенности (condition.html)
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var NAVL = [["home", "Главная"], ["catalog", "Каталог"], ["navigator", "Навигатор"], ["specialists", "Специалисты"]];
  $("#top").innerHTML = '<header class="card"><div class="logo"><div class="lg">Q</div><div><b>QADAM</b><small>Вместе на каждом этапе</small></div></div><nav aria-label="Разделы">' + NAVL.map(function (p) { return '<a href="index.html#' + p[0] + '">' + p[1] + '</a>'; }).join("") + "</nav></header>";
  $("#bot").innerHTML = '<footer class="card"><p class="mute" style="margin:0">Материалы носят справочный характер и не заменяют консультацию врача или специалиста. Сайт не ставит диагнозов. <a href="apply.html">Вы специалист? Подайте заявку</a>.</p></footer>';
  var Q = new URLSearchParams(location.search), A = $("#app"), page = document.body.dataset.page;
  function ul(a) { return "<ul>" + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }
  function lead(x) { var k = x.indexOf(":"); return k > 0 ? "<li><b>" + esc(x.slice(0, k + 1)) + "</b>" + esc(x.slice(k + 1)) + "</li>" : "<li>" + esc(x) + "</li>"; }
  function nf() { A.innerHTML = '<section class="card"><h1>Страница не найдена</h1><p class="mute">Выберите направление в <a href="index.html#catalog">каталоге</a>.</p></section>'; }
  if (page === "category") {
    var c = catById(Q.get("c")); if (!c) return nf();
    document.title = c.n + ": QADAM";
    A.innerHTML = '<p class="mute"><a href="index.html#catalog">Каталог</a> › ' + esc(c.n) + '</p><section class="card"><img class="hero-img" src="img/' + c.id + '.jpg" alt=""><h1>' + esc(c.n) + '</h1><p class="mute">' + esc(c.d) + '</p><a class="btn" href="index.html?cat=' + c.id + '#specialists">Найти специалистов по этому направлению</a></section>' +
      c.groups.map(function (g) { return '<section class="card"><h2>' + esc(g.t) + "</h2>" + g.items.map(function (x) { return '<a class="lnk" href="condition.html?i=' + x.id + '">' + esc(x.t) + "<span>›</span></a>"; }).join("") + "</section>"; }).join("") +
      (c.note ? '<div class="note">' + esc(c.note) + "</div>" : "");
  } else {
    var f = findItem(Q.get("i")); if (!f) return nf();
    var K = CONTENT[f.x.id] || {}, cc = f.c;
    document.title = f.x.t + ": QADAM";
    var faq = (K.faq || []).concat(DEF.faq).map(function (q) { return "<details><summary>" + esc(q.q) + "</summary><p>" + esc(q.a) + "</p></details>"; }).join("");
    A.innerHTML = '<p class="mute"><a href="index.html#catalog">Каталог</a> › <a href="category.html?c=' + cc.id + '">' + esc(cc.n) + "</a></p>" +
      '<section class="card"><h1>' + esc(f.x.t) + "</h1><h2>Что это такое?</h2><p>" + esc(K.what || cc.d + " Подробное описание этой особенности готовит редактор вместе с профильным специалистом.") + "</p></section>" +
      '<section class="card"><h2>Как могут проявляться потребности ребёнка?</h2>' + (K.signs ? '<p class="mute">Это возможные варианты, а не обязательный список и не способ поставить диагноз самостоятельно. У каждого ребёнка бывает по-своему.</p>' + ul(K.signs) : '<p class="mute">Описание возможных проявлений готовится. Потребности у каждого ребёнка свои, поэтому единого списка признаков нет.</p>') + "</section>" +
      '<section class="card"><h2>Какие специалисты могут помогать?</h2>' + ul(K.sp || cc.sp) + '<div class="note">Не нужно автоматически назначать ребёнку всех этих специалистов: направления зависят от индивидуальных потребностей.</div></section>' +
      '<section class="card"><h2>Где получить помощь?</h2><a class="btn" href="index.html?cat=' + cc.id + '#specialists">Найти специалистов по этому направлению</a></section>' +
      '<section class="card"><h2>Полезная информация для родителей</h2><ul>' + DEF.parents.map(lead).join("") + "</ul></section>" +
      '<section class="card"><h2>Вопросы и ответы</h2>' + faq + "</section>" +
      '<section class="card"><h2>Источники</h2>' + (K.src ? ul(K.src) + '<p class="mute">Перед публикацией источники должен проверить редактор и профильный специалист.</p>' : '<p class="mute">Источники появятся после проверки материала редактором и профильным специалистом.</p>') + "</section>";
  }
})();
