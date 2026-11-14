// Вставьте данные из Supabase: Project Settings → API
// Ключ anon public можно держать в браузере: доступ защищают правила в database/setup.sql
var QADAM = {
  url: 'https://bihkneikdblfxvokmzfs.supabase.co/rest/v1/',
  key: 'sb_publishable_YLoFaWYBenjN9xNw5Tc79w_b--8Jcox'
};
var db = supabase.createClient(QADAM.url, QADAM.key);