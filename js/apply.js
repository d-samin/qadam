// Подача заявки: данные уходят в базу функцией submit_application, файлы в закрытое хранилище
var $ = function (s) { return document.querySelector(s); };
var KINDS = ['id', 'diploma', 'license'], TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
function ext(f) { return (f.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function human(m) { return /violates|invalid|check constraint/i.test(m) ? 'Проверьте поля формы: возраст, телефон, email.' : m; }
$('#f').addEventListener('submit', async function (e) {
  e.preventDefault();
  var btn = $('#go'), err = $('#err'), fd = new FormData(e.target); err.textContent = '';
  var files = KINDS.map(function (k) { return [k, fd.get(k)]; }).filter(function (x) { return x[1] && x[1].size; });
  var bad = files.filter(function (x) { return x[1].size > 5 * 1024 * 1024 || TYPES.indexOf(x[1].type) < 0; });
  if (bad.length) { err.textContent = 'Файлы: только PDF, JPG или PNG, до 5 МБ.'; return; }
  btn.disabled = true; btn.textContent = 'Отправляем…';
  var code = '';
  try {
    var r = await db.rpc('submit_application', {
      p_name: fd.get('name'), p_role: fd.get('role'), p_category: fd.get('category'), p_city: fd.get('city'),
      p_langs: fd.getAll('langs'), p_age_min: +fd.get('ageMin'), p_age_max: +fd.get('ageMax'), p_format: fd.get('format'),
      p_price: fd.get('price') ? +fd.get('price') : null, p_bio: fd.get('bio'), p_phone: fd.get('phone'), p_email: fd.get('email'),
      p_license_no: fd.get('license_no'), p_consent: fd.get('consent') === 'on'
    });
    if (r.error) throw new Error(human(r.error.message));
    var row = r.data[0]; code = row.out_code;
    for (var i = 0; i < files.length; i++) {
      var k = files[i][0], f = files[i][1], path = row.out_id + '/' + k + '-' + crypto.randomUUID() + '.' + ext(f);
      var u = await db.storage.from('documents').upload(path, f, { contentType: f.type });
      if (u.error) throw new Error('Файл «' + f.name + '» не загрузился');
      var d = await db.rpc('add_document', { p_code: code, p_kind: k, p_path: path, p_name: f.name });
      if (d.error) throw new Error(d.error.message);
    }
    $('#m').innerHTML = '<h1>Заявка отправлена</h1><p>Сохраните код заявки. По нему можно узнать статус проверки:</p><h2 style="letter-spacing:.08em">' + code + '</h2><p class="mute">Профиль появится на сайте после одобрения администратором.</p><a class="btn" href="index.html">На сайт</a>';
    window.scrollTo(0, 0);
  } catch (x) {
    err.textContent = x.message + (code ? ' Код вашей заявки: ' + code + '. Сохраните его и напишите администратору.' : '');
    btn.disabled = false; btn.textContent = 'Отправить заявку';
  }
});
var L = { pending: 'На проверке. Администратор ещё смотрит документы.', approved: 'Одобрена. Профиль виден на сайте.', rejected: 'Отклонена.', suspended: 'Профиль скрыт.' };
$('#chk').addEventListener('click', async function () {
  var c = $('#code').value.trim(); if (!c) { $('#st').textContent = 'Введите код заявки.'; return; }
  var r = await db.rpc('application_status', { p_code: c });
  if (r.error || !r.data.length) { $('#st').textContent = 'Заявка с таким кодом не найдена.'; return; }
  var d = r.data[0];
  $('#st').textContent = L[d.status] + (d.reason ? ' Причина: ' + d.reason : '') + (d.status === 'approved' && d.until ? ' Проверка действует до ' + d.until.slice(0, 10) + '.' : '');
});
