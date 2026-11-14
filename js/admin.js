// Панель проверки: вход через Supabase Auth, очередь, документы, решение
var $ = function (s) { return document.querySelector(s); }, ST = 'pending';
var KIND = { id: 'Удостоверение', diploma: 'Диплом', license: 'Лицензия' };
function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
async function show() {
  var s = (await db.auth.getSession()).data.session, ok = false;
  if (s) {
    ok = (await db.rpc('is_admin')).data === true;
    if (!ok) { await db.auth.signOut(); $('#lerr').textContent = 'У этого аккаунта нет прав администратора'; }
  }
  $('#login').hidden = ok; $('#panel').hidden = !ok; $('#out').hidden = !ok; if (ok) load();
}
$('#out').onclick = async function () { await db.auth.signOut(); show(); };
$('#lb').onclick = async function () {
  $('#lerr').textContent = '';
  var r = await db.auth.signInWithPassword({ email: $('#em').value.trim(), password: $('#pw').value });
  if (r.error) { $('#lerr').textContent = 'Неверный email или пароль'; return; }
  $('#pw').value = ''; show();
};
$('#tabs').onclick = function (e) {
  if (!e.target.dataset.s) return; ST = e.target.dataset.s;
  [].forEach.call($('#tabs').children, function (b) { b.className = b.dataset.s === ST ? 'on' : ''; }); load();
};
async function load() {
  var r = await db.from('specialists').select('*, documents(id,kind,file_path)').eq('status', ST).order('created_at');
  if (r.error) { $('#list').innerHTML = '<div class="card err">' + esc(r.error.message) + '</div>'; return; }
  $('#list').innerHTML = r.data.length ? r.data.map(card).join('') : '<div class="card">В этом разделе заявок нет.</div>';
}
function card(s) {
  var docs = s.documents.map(function (d) { return '<button class="btn out" style="padding:8px 14px;margin:0 6px 6px 0" data-p="' + esc(d.file_path) + '" data-sid="' + s.id + '" data-k="' + d.kind + '">' + KIND[d.kind] + '</button>'; }).join('') || '<span class="err">Документы не загружены</span>';
  var act = ST === 'approved'
    ? '<textarea placeholder="Причина скрытия профиля" data-n></textarea><button class="btn full" data-d="suspend" data-id="' + s.id + '">Скрыть профиль</button>'
    : '<label class="ck"><input type="checkbox" data-c="identity">Личность совпадает с документом</label><label class="ck"><input type="checkbox" data-c="diploma">Диплом подтверждает специальность</label><textarea placeholder="Причина (обязательна при отклонении)" data-n></textarea><div class="row"><button class="btn" data-d="approve" data-id="' + s.id + '">Одобрить на 12 месяцев</button><button class="btn out" data-d="reject" data-id="' + s.id + '">Отклонить</button></div>';
  return '<article class="card"><div class="hd"><h3>' + esc(s.name) + '</h3><span class="tag">' + esc(s.created_at.slice(0, 10)) + '</span></div><p class="mute">' + esc(s.role) + ' · ' + esc(s.city) + ' · дети ' + s.age_min + '–' + s.age_max + ' · ' + esc(s.langs.join(', ')) + '<br>' + esc(s.phone) + ' · ' + esc(s.email) + (s.license_no ? '<br>Лицензия №' + esc(s.license_no) : '') + (s.reject_reason ? '<br>Причина: ' + esc(s.reject_reason) : '') + '</p>' + (s.bio ? '<p>' + esc(s.bio) + '</p>' : '') + '<div>' + docs + '</div><p class="err" data-e></p>' + act + '</article>';
}
$('#list').onclick = async function (e) {
  var t = e.target;
  if (t.dataset.p) {
    var w = window.open('', '_blank');
    var u = await db.storage.from('documents').createSignedUrl(t.dataset.p, 60);
    if (u.error) { w.close(); return; }
    w.location = u.data.signedUrl;
    db.from('audit_log').insert({ specialist_id: +t.dataset.sid, action: 'document_viewed', note: t.dataset.k });
    return;
  }
  if (!t.dataset.d) return;
  var box = t.closest('article'), ch = {};
  [].forEach.call(box.querySelectorAll('[data-c]'), function (c) { ch[c.dataset.c] = c.checked; });
  var r = await db.rpc('admin_decide', { p_id: +t.dataset.id, p_decision: t.dataset.d, p_note: box.querySelector('[data-n]').value, p_identity: !!ch.identity, p_diploma: !!ch.diploma });
  if (r.error) { box.querySelector('[data-e]').textContent = r.error.message; return; }
  load();
};
show();

