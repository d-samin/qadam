// js/app.js — главная, каталог, навигатор, специалисты, поддержка, события, безопасность

var $=function(s){return document.querySelector(s)};

var PAGES=[
    ['home','Главная'],
    ['specialists','Специалисты'],
    ['navigator','Навигатор'],
    ['support','Поддержка'],
    ['events','События'],
    ['safety','Безопасность']
];

var S={q:'',step:0,A:{},sort:'r',mode:'sp',map:0,err:''},F={};

function rf(){F={feat:[]}}
rf();

function ls(k,d){
    try{return JSON.parse(localStorage.getItem(k))||d}
    catch(e){return d}
}

function sv(k,v){
    try{localStorage.setItem(k,JSON.stringify(v))}
    catch(e){}
}

function go(v){location.hash=v}

function view(){
    var h=location.hash.slice(1);
    return h=='hard'||h=='catalog'||PAGES.some(function(p){
        return p[0]==h;
    })?h:'home';
}

// function tag(n,t){
//     return '<span class="tag">Страница 0'+n+' / '+t+'</span>';
// }

function tag(n,t){
    return '<span class="tag">'+n+' / '+t+'</span>';
}

function sel(id,l,o,v){
    return '<label for="'+id+'">'+l+'</label><select id="'+id+'">'+o.map(function(x){
        x=[].concat(x);
        if(x.length<2)x[1]=x[0];
        return '<option value="'+esc(x[0])+'"'+(String(v)===String(x[0])?' selected':'')+'>'+esc(x[1])+'</option>';
    }).join('')+'</select>';
}

function ava(s){
    return '<div class="av2" style="--h:'+(s.id*57%360)+'">'+s.name.split(' ').map(function(w){
        return w[0];
    }).join('')+'</div>';
}

function isFav(id){return ls('fav',[]).indexOf(id)>-1}

function price(p){
    return p?'от '+p.toLocaleString('ru-RU')+' ₸':'Бесплатно';
}

function spCard(s){
    return '<article class="card sc"><div class="hd">'+ava(s)+'<div><h3>'+esc(s.name)+'</h3><div class="mute">'+esc(s.role)+' · '+s.exp+' лет опыта</div></div></div><div class="row" style="margin:10px 0"><span class="tag ok">Документы проверены</span><span class="st">★ '+s.rating.toFixed(1)+' <small class="mute">('+s.rev+' отзывов)</small></span></div><p class="mute">Дети '+s.ages[0]+'–'+s.ages[1]+' лет · '+s.langs.map(L).join(' / ')+'<br>'+esc(s.tags.slice(0,2).join(' · '))+'</p><div class="meta"><span>'+s.city+' · '+s.fmt.join(', ')+'</span><b style="color:var(--ink)">'+price(s.price)+'</b></div><div class="row" style="margin-top:12px"><a class="btn" href="specialist.html?id='+s.id+'">Подробнее</a><button class="btn out" data-fav="'+s.id+'">'+(isFav(s.id)?'★ В избранном':'☆ В избранное')+'</button></div></article>';
}

function ceCard(c){
    return '<article class="card sc"><div class="hd"><div class="av2" style="--h:200">🏥</div><div><h3>'+esc(c.name)+'</h3><div class="mute">'+c.city+', '+c.dist+'</div></div></div><p class="mute">'+esc(c.info)+'</p><div class="row"><span class="tag ok">Центр проверен</span><span class="st">★ '+c.rating+'</span></div><p class="mute">'+c.feat.join(' · ')+'</p><div class="meta"><span>'+esc(c.addr)+'</span><b style="color:var(--ink)">'+price(c.price)+'</b></div></article>';
}

function catCards(){
    return '<div class="grid">'+CATS.map(function(c){
        return '<a class="pic" href="category.html?c='+c.id+'"><img src="img/'+c.id+'.jpg" alt="" loading="lazy"><b>'+c.n+'</b><small>'+c.s+'</small></a>';
    }).join('')+'</div>';
}

function blk(h,t,b,l){
    return '<section class="card"><h2>'+h+'</h2><p class="mute">'+t+'</p><button class="btn full" data-go="'+l+'">'+b+'</button></section>';
}

/* ---------- Главная ---------- */

function home(){
    var top=SPEC.slice()
        .sort(function(a,b){return b.rating-a.rating})
        .slice(0,4);

    return '<section class="card hero"><span class="tag">Поддержка начинается здесь</span><h1>Каждый ребёнок заслуживает возможностей. Каждая семья — поддержки.</h1><p class="mute" style="font-size:16px">Найдите проверенных специалистов, получите поддержку и откройте новые возможности для развития ребёнка.</p><div class="row"><button class="btn" data-go="specialists">Найти специалиста</button><button class="btn out" data-go="navigator">Не знаю, с чего начать</button><button class="btn out" data-go="hard">Мне сейчас тяжело</button></div></section>'

    // 1. Направления помощи
    +'<div class="row between" style="margin:6px 4px 10px"><h2 style="margin:0">Направления помощи</h2><a href="#catalog" class="mute">Все категории</a></div>'+catCards()

    // 2. Специалисты
    +'<div class="row between" style="margin:6px 4px 10px"><h2 style="margin:0">Специалисты</h2><a href="#specialists" class="mute">Все специалисты</a></div><div class="grid">'+top.map(spCard).join('')+'</div>'

    // 3. Остальные блоки
    +'<div class="two">'+blk('💜 Поддержка родителям','Психологи, группы взаимопомощи, помощь с документами и льготами.','Открыть поддержку','support')+blk('🎈 Inclusive Together','Городские мероприятия, доступные разным детям, с заранее указанными условиями.','Смотреть афишу','events')+'</div>'

    +blk('🛡️ Ваша безопасность','Какие данные мы собираем, зачем, где храним и как проверяем специалистов.','Как мы защищаем данные','safety');
}

/* ---------- Каталог ---------- */

function catalog(){
    return '<section class="card">'+'<h1>Особенности развития</h1><p class="mute">Выберите направление или найдите особенность по названию.</p><input id="q" value="'+esc(S.q)+'" placeholder="Например: заикание, РАС, дислексия" aria-label="Поиск"></section><div id="cl">'+catBody()+'</div>';
}

function catBody(){
    var q=S.q.trim().toLowerCase();

    if(!q)return catCards();

    var r=allItems().filter(function(x){
        return x.name.toLowerCase().indexOf(q)>-1;
    });

    return r.length
        ?'<div class="card">'+r.map(function(x){
            return '<a class="lnk" href="'+x.href+'"><span>'+esc(x.name)+'</span><small>'+x.cat+'</small></a>';
        }).join('')+'</div>'
        :'<div class="card">Ничего не найдено. Пройдите <a href="#navigator">навигатор</a>.</div>';
}

/* ---------- Специалисты ---------- */

function match(s){
    var q=S.q.trim().toLowerCase();

    if(q&&(s.name+' '+s.role+' '+s.tags.join(' ')).toLowerCase().indexOf(q)<0)return 0;

    if(F.role&&s.role!=F.role)return 0;
    if(F.cond&&s.tags.indexOf(F.cond)<0)return 0;

    if(F.age){
        var a=AG[+F.age];
        if(s.ages[0]>a[2]||s.ages[1]<a[1])return 0;
    }

    if(F.age===0){}

    if(F.city&&s.city!=F.city)return 0;
    if(F.dist&&s.dist!=F.dist)return 0;
    if(F.fmt&&s.fmt.indexOf(F.fmt)<0)return 0;

    if(F.lang&&s.langs.indexOf(F.lang)<0)return 0;
    if(F.pmax&&s.price>+F.pmax)return 0;
    if(F.exp&&s.exp<+F.exp)return 0;

    if(F.qual&&s.qual.join().indexOf(F.qual)<0)return 0;
    if(F.day&&s.days.indexOf(F.day)<0)return 0;
    if(F.rt&&s.rating<+F.rt)return 0;

    for(var i=0;i<F.feat.length;i++){
        if(s.feat.indexOf(F.feat[i])<0)return 0;
    }

    return 1;
}

function cm(c){
    var q=S.q.trim().toLowerCase();

    if(q&&c.name.toLowerCase().indexOf(q)<0)return 0;
    if(F.city&&c.city!=F.city)return 0;
    if(F.dist&&c.dist!=F.dist)return 0;
    if(F.pmax&&c.price>+F.pmax)return 0;
    if(F.rt&&c.rating<+F.rt)return 0;

    for(var i=0;i<F.feat.length;i++){
        if(c.feat.indexOf(F.feat[i])<0)return 0;
    }

    return 1;
}

function chips(){
    var c=[];
    ['role','cond','city','dist','fmt','qual','day'].forEach(function(k){
        if(F[k])c.push([k,F[k]]);
    });

    if(F.age)c.push(['age',AG[+F.age][0]]);
    if(F.lang)c.push(['lang',L(F.lang)]);

    if(F.pmax)c.push(['pmax',F.pmax=='0.1'?'Бесплатно':'до '+(+F.pmax).toLocaleString('ru-RU')+' ₸']);

    if(F.exp)c.push(['exp','от '+F.exp+' лет']);
    if(F.rt)c.push(['rt','★ от '+F.rt]);

    F.feat.forEach(function(x){
        c.push(['feat:'+x,x]);
    });

    return c;
}

function side(){
    var roles=[],conds=[];

    SPEC.forEach(function(s){
        if(roles.indexOf(s.role)<0)roles.push(s.role);
        s.tags.forEach(function(t){
            if(conds.indexOf(t)<0)conds.push(t);
        });
    });

    var ci=['Алматы','Астана','Шымкент','Другой город'].map(function(c){
        return[c];
    });

    return '<h2>Фильтры</h2>'
    +sel('f-role','Направление',[['','Все']].concat(roles),F.role)
    +sel('f-cond','Особенность развития',[['','Любая']].concat(conds),F.cond)
    +sel('f-age','Возраст детей',[['','Любой']].concat(AG.map(function(a,i){
        return[i?String(i):'0',a[0]];
    })),F.age)
    +sel('f-city','Город',[['','Все города']].concat(ci),F.city)
    +(DIST[F.city]?sel('f-dist','Район',[['','Все районы']].concat(DIST[F.city].map(function(d){
        return[d];
    })),F.dist):'')
    +sel('f-fmt','Формат',[['','Любой'],['Центр','Центр'],['Дома','Выезд на дом'],['Онлайн','Онлайн']],F.fmt)
    +sel('f-lang','Язык',[['','Любой'],['kk','Қазақша'],['ru','Русский']],F.lang)
    +sel('f-pmax','Цена',[['','Любая'],['0.1','Бесплатно'],['5000','до 5 000 ₸'],['10000','до 10 000 ₸'],['20000','до 20 000 ₸']],F.pmax)
    +sel('f-exp','Опыт',[['','Любой'],['3','от 3 лет'],['5','от 5 лет'],['10','от 10 лет']],F.exp)
    +sel('f-qual','Квалификация',[['','Любая'],['Высшее','Высшее образование'],['Высшая категория','Высшая категория'],['Сертификат','Сертификаты']],F.qual)
    +sel('f-day','Дни приёма',[['','Любые']].concat(DAYS.map(function(d){
        return[d];
    })),F.day)
    +sel('f-rt','Рейтинг (подтверждённые клиенты)',[['','Любой'],['4.5','от 4.5'],['4.8','от 4.8']],F.rt)
    +'<label>Условия и доступность</label>'
    +FEATS.map(function(f){
        return '<label class="ck"><input type="checkbox" data-feat="'+f+'"'+(F.feat.indexOf(f)>-1?' checked':'')+'>'+f+'</label>';
    }).join('')
    +'<p class="mute" style="margin-top:10px">Статус проверки: показаны только подтверждённые профили.</p>';
}

function specs(){
    return '<section class="card">'+'<h1>Найдите своего специалиста</h1><input id="q" value="'+esc(S.q)+'" placeholder="Имя, специальность или особенность" aria-label="Поиск"></section><div class="lay"><aside class="card" id="side">'+side()+'</aside><div id="res"></div></div>';
}

function res(){
    var l,c=chips(),so=function(a,b){
        return S.sort=='p'?a.price-b.price:S.sort=='e'?b.exp-a.exp:b.rating-a.rating;
    };

    l=(S.mode=='sp'?SPEC.filter(match):CENTERS.filter(cm)).sort(so);

    var h='<div class="card"><div class="row between"><b>📍 '+(F.city||'Все города')+' · найдено: '+l.length+'</b><div style="min-width:170px"><select id="sortb" aria-label="Сортировка"><option value="r"'+(S.sort=='r'?' selected':'')+'>По рейтингу</option><option value="p"'+(S.sort=='p'?' selected':'')+'>По цене</option><option value="e"'+(S.sort=='e'?' selected':'')+'>По опыту</option></select></div></div>'

    +'<div class="row" style="margin-top:10px"><div class="seg" style="flex:1"><button data-mode="sp" class="'+(S.mode=='sp'?'on':'')+'">Специалисты</button><button data-mode="ce" class="'+(S.mode=='ce'?'on':'')+'">Центры</button></div><div class="seg" style="flex:1"><button data-map="0" class="'+(S.map?'':'on')+'">Список</button><button data-map="1" class="'+(S.map?'on':'')+'">Карта</button></div></div>'
    +c.map(function(x){
        return '<button class="chip" data-rm="'+esc(x[0])+'">'+esc(x[1])+' ×</button>';
    }).join('')+(c.length?'<button class="chip rs" data-rm="*">Сбросить все</button>':'')+'</div>';

    if(S.map)h+='<div class="map" aria-label="Схема расположения (демо)">'+l.map(function(x,i){
        return '<span class="pin" style="left:'+(10+(i*37+String(x.id).length*11)%78)+'%;top:'+(12+(i*29)%65)+'%" title="'+esc(x.name)+'">📍</span>';
    }).join('')+'</div><div class="card">'+l.map(function(x){
        return '<a class="lnk" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(x.addr)+'"><span>'+esc(x.name)+'</span><small>'+esc(x.addr)+'</small></a>';
    }).join('')+'</div>';
    else h+=l.length?l.map(S.mode=='sp'?spCard:ceCard).join(''):'<div class="card">По этим фильтрам никого нет. Уберите часть меток или <a href="#navigator">пройдите навигатор</a>, либо <a href="#hard" data-cbgo>закажите звонок консультанта</a>.</div>';

    $('#res').innerHTML=h;
}

/* ---------- Навигатор ---------- */

var CON={
    'Ребёнок мало говорит':['Логопед','Речь и коммуникация','Логопед','Оценка речевых и коммуникативных потребностей.'],
    'Не понимает обращённую речь':['Логопед','Речь, слух, понимание языка','Сурдолог / аудиолог','Проверка слуха, затем логопед.'],
    'Не получается правильно произносить звуки':['Логопед','Речевые нарушения','Логопед','Диагностика звукопроизношения.'],
    'Трудно читать и писать':['Дефектолог','Обучение','Дефектолог / нейропсихолог','Оценка навыков чтения и письма.'],
    'Сложно концентрироваться':['Невролог','Внимание и когнитивные навыки','Невролог / нейропсихолог','Оценка внимания и нагрузки.'],
    'Трудно взаимодействовать с людьми':['Дефектолог','Социальная коммуникация','Психолог / дефектолог','Оценка социальных навыков.'],
    'Есть трудности с движением':['Невролог','Моторика и реабилитация','Невролог / реабилитолог','Оценка моторного развития.'],
    'Ребёнку трудно переносить звуки или прикосновения':['Эрготерапевт','Сенсорные потребности','Эрготерапевт','Сенсорная регуляция и бытовые навыки.'],
    'Есть эмоциональные или поведенческие трудности':['Психолог','Психологическая поддержка','Детский психолог','Поддержка ребёнка и семьи.']
};

var NV=[
    {k:'known',t:'Что вам уже известно?',q:'У вашего ребёнка есть установленный диагноз или заключение?',o:['Да, есть диагноз','Есть заключение специалистов, но диагноза нет','Я замечаю определённые трудности','Пока не знаю']},
    {k:'conc',m:1,t:'Что вас беспокоит?',q:'Можно выбрать несколько вариантов.',o:Object.keys(CON).concat(['Другое'])},
    {k:'age',t:'Возраст ребёнка',q:'Сколько лет ребёнку?',o:AG.map(function(a){return a[0]})},
    {k:'place',t:'Где вам удобнее получать помощь?',q:'Выберите вариант.',o:['Алматы','Астана','Другой город Казахстана','Онлайн','Выезд специалиста на дом']},
    {k:'pref',m:1,t:'Что для вас важно?',q:'Отметьте всё подходящее (можно ничего не выбирать).',o:['Казахский язык','Русский язык','Ценовой диапазон до 10 000 ₸','Бесплатные услуги','Посещение с родителем','Доступность для коляски','Тихая комната','Удобное расписание']}
];

var NOTE=[
    'Выберите, что сейчас важнее всего: специалисты подберутся под текущие задачи.',
    'Заключение поможет специалисту, но загружать его на сайт не нужно.',
    'Это нормально: отметьте всё, что замечаете. Мы предложим первичную оценку.',
    'Ничего страшного: можно начать с консультанта или педиатра.'
];

function pickF(){
    rf();
    S.q='';

    var A=S.A,x=CON[(A.conc||[])[0]],ai=NV[2].o.indexOf(A.age),p=A.place;

    if(x)F.role=x[0];
    if(ai>0)F.age=String(ai);

    if(p=='Алматы'||p=='Астана')F.city=p;
    if(p=='Онлайн')F.fmt='Онлайн';
    if(p&&p[0]=='В')F.fmt='Дома';

    (A.pref||[]).forEach(function(t){
        if(t=='Казахский язык')F.lang='kk';
        if(t=='Русский язык')F.lang='ru';
        if(t.indexOf('до 10')>-1)F.pmax='10000';
        if(t=='Бесплатные услуги')F.pmax='0.1';
        if(t=='Доступность для коляски')F.feat.push('Для коляски');
        if(t=='Тихая комната')F.feat.push('Тихая зона');
        if(t.indexOf('родителем')>-1)F.feat.push('С сопровождающим');
    });
}

function cbForm(){
    return '<div class="card hl" id="cbx"><h2>Помогите мне выбрать</h2><p class="mute">Консультант поможет выбрать вид врача или конкретного специалиста. Не сообщайте диагноз ребёнка: он не нужен для записи на звонок.</p>'
    +sel('cb-t','Что нужно',['Выбрать вид врача','Выбрать конкретного специалиста','Узнать про запись и стоимость','Помощь с документами и льготами'])
    +sel('cb-w','Удобное время звонка',['Утро (9–12)','День (12–17)','Вечер (17–20)'])
    +'<label for="cb-n">Имя взрослого</label><input id="cb-n" autocomplete="name"><label for="cb-p">Телефон</label><input id="cb-p" type="tel" placeholder="+7 700 000 00 00" autocomplete="tel"><label class="ck"><input type="checkbox" id="cb-c">Согласен(на) передать имя и телефон консультанту для обратного звонка</label><p class="err" id="cb-e"></p><button class="btn full" data-act="cb">Заказать звонок</button></div>';
}

function navStep(){
    var s=NV[S.step],t='<section class="card">'+'<h1>Давайте разберёмся вместе</h1>'+'<div class="bars">'+[0,1,2,3,4,5].map(function(i){
        return '<i class="'+(i<=S.step?'on':'')+'"></i>';
    }).join('')+'</div><div class="mute">Шаг '+(S.step+1)+' из 6</div>';

    var h=t+'<h2 style="margin-top:14px">'+s.t+'</h2>'+(S.step==1&&S.A.known?'<div class="note">'+NOTE[NV[0].o.indexOf(S.A.known)]+'</div>':'')+'<p class="mute">'+s.q+'</p>';

    h+=s.m?s.o.map(function(o){
        return '<label class="ck"><input type="checkbox" name="m" value="'+esc(o)+'"'+((S.A[s.k]||[]).indexOf(o)>-1?' checked':'')+'>'+esc(o)+'</label>';
    }).join(''):sel('nv-s','Выберите из списка',[['','— выберите —']].concat(s.o.map(function(o){
        return[o];
    })),S.A[s.k]);

    return h+'<p class="err">'+S.err+'</p><div class="row">'+(S.step?'<button class="btn out" data-act="back">Назад</button>':'')+'<button class="btn" data-act="next">Далее</button></div></section>';
}

function navigator_(){
    if(S.step<5)return navStep();

    var A=S.A,o=NV[0].o,recs=[],dirs=[];

    if(A.known!=o[0])recs.push(['Педиатр','Первичная оценка общего развития и необходимости дальнейшего обследования.']);

    (A.conc||[]).forEach(function(c){
        var x=CON[c];
        if(x){
            if(!recs.some(function(r){return r[0]==x[2]}))recs.push([x[2],x[3]]);
            if(dirs.indexOf(x[1])<0)dirs.push(x[1]);
        }
    });

    var unsure=A.known==o[3]||!dirs.length;
    pickF();
    var m=SPEC.filter(match).slice(0,3);

    return '<section class="card">'+'<h1>Ваши результаты</h1><p><span class="tag ok">Анкета заполнена</span></p><div class="mute">'+[A.known,A.age,A.place].join(' · ')+'</div><h2 style="margin-top:14px">По вашим ответам стоит рассмотреть консультации</h2>'
    +recs.map(function(r,i){
        return '<div class="card lil" style="padding:14px"><b>'+(i+1)+'. '+r[0]+'</b><div class="mute">'+r[1]+'</div></div>';
    }).join('')
    +'<div class="note">Это возможные направления для обсуждения со специалистом, а не диагноз и не медицинское назначение.</div></section>'
    +(unsure?cbForm():'')+'<h2 style="margin:6px 4px 10px">Подходящие специалисты</h2>'
    +(m.length?'<div class="grid">'+m.map(spCard).join('')+'</div>':'<div class="card">С такими условиями специалистов пока нет. Нажмите «Подобрать специалистов» и ослабьте фильтры или закажите звонок.</div>')
    +'<section class="card"><h2>Ваш маршрут</h2><ol><li><b>С чего начать:</b> запишитесь на первичную консультацию — '+(recs[0]?recs[0][0]:'педиатр')+'.</li><li><b>К кому в первую очередь:</b> '+(recs[0]?recs[0][0]:'педиатр')+(recs[1]?', затем '+recs[1][0]:'')+'.</li><li><b>Что спросить:</b> что специалист наблюдает; какие шаги и в каком порядке; как понять, что помощь работает; как часто нужны занятия.</li><li><b>Другие направления:</b> '+(dirs.join(', ')||'психологическая поддержка семьи')+'.</li><li><b>Где найти поддержку:</b> <a href="#support">раздел «Поддержка»</a> и <a href="#catalog">каталог особенностей</a>.</li></ol>'
    +'<button class="btn full" data-act="pick">Подобрать специалистов</button><button class="btn out full" data-act="save">Сохранить маршрут в кабинет</button><button class="btn out full" data-act="reset">Пройти заново</button><p class="mute" id="sv"></p></section>'
    +(unsure?'':cbForm());
}

/* ---------- Поддержка ---------- */

var GR=[
    'Родители детей с РАС',
    'Родители детей с речевыми нарушениями',
    'Родители детей с двигательными особенностями',
    'Родители детей с нарушениями слуха и зрения',
    'Родители детей с редкими состояниями',
    'Родители, только начинающие путь',
    'Школьная адаптация',
    'Подростковый возраст'
];

var RES={
    'Социальные льготы и пособия':['Каталог услуг на eGov','Информация о пособиях и порядке оформления'],
    'Средства реабилитации':['Порядок получения технических средств','Специальные социальные услуги'],
    'Инклюзивное образование (ПМПК)':['Запись на ПМПК','Права ребёнка в школе'],
    'Поиск государственных и частных центров':['Реестр организаций вашего города','Проверка лицензии на eLicense']
};

function support(){
    var g=ls('grp',[]);

    return '<section class="card hero">'+'<h1>Вы не одни</h1><p class="mute">Тревога, усталость и одиночество — частая часть пути. Здесь можно получить помощь и для себя.</p><button class="btn" data-go="hard">Мне сейчас тяжело</button></section>'
    +'<section class="card"><h2>Психологическая поддержка</h2>'+['Индивидуальные консультации психолога','Онлайн-консультации','Семейные консультации','Группы психологической поддержки','Профилактика эмоционального выгорания','Адаптация после получения диагноза'].map(function(x){
        return '<a class="lnk" href="#specialists" data-psy>'+x+'<span>›</span></a>';
    }).join('')+'</section>'
    +'<section class="card"><h2>Практическая помощь</h2><ul><li>Социальные работники и информация о госуслугах</li><li>Объяснение социальных льгот и оформления документов</li><li>Поиск государственных и частных центров, средства реабилитации</li><li>Юридические консультации по образованию и правам ребёнка</li><li>Временная помощь семье, доступный транспорт, центры отдыха</li></ul></section>'
    +'<section class="card"><h2>На какую помощь может рассчитывать моя семья?</h2>'+sel('fh-c','Город',['Алматы','Астана','Шымкент','Другой город'])+sel('fh-k','Категория',Object.keys(RES))+'<div id="fh"></div><p class="mute">Порядок и размеры помощи меняются — проверяйте на официальных сайтах.</p></section>'
    +'<section class="card"><h2>Модерируемые группы</h2><p class="mute">Только для взрослых после регистрации. Нельзя публиковать данные детей; жалобы быстро рассматривают модераторы.</p>'+GR.map(function(x,i){
        return '<div class="lnk"><span>'+x+'</span><button class="chip" data-grp="'+i+'">'+(g.indexOf(i)>-1?'Вы в группе ✓':'Вступить')+'</button></div>';
    }).join('')+'</section>'
    +'<section class="card"><h2>Для всей семьи</h2><p class="mute">Встречи для отцов, занятия для братьев и сестёр, семейные выходные и совместные активности — в <a href="#events">афише событий</a>.</p></section>'
    +cbForm();
}

function fh(){
    var c=$('#fh-c').value,k=$('#fh-k').value;

    $('#fh').innerHTML='<div class="note">'+esc(c)+': '+esc(k)+'</div>'+RES[k].map(function(x){
        return '<a class="lnk" target="_blank" rel="noopener" href="https://egov.kz">'+esc(x)+'<span>eGov ›</span></a>';
    }).join('')+'<a class="lnk" target="_blank" rel="noopener" href="https://www.gov.kz">Портал социальных услуг — проверьте актуальный адрес<span>›</span></a>';
}

function hard(){
    return '<section class="card hero"><h1>Вы не обязаны справляться со всем самостоятельно</h1><p style="font-size:17px">Здесь можно найти человека, с которым получится обсудить свои переживания.</p><button class="btn full" data-act="psy">Записаться к психологу</button><button class="btn out full" data-go="support">Найти группу поддержки</button><button class="btn out full" data-act="cbgo">Связаться с консультантом</button><button class="btn out full" data-go="catalog">Посмотреть полезные материалы</button></section>'
    +'<section class="card sos"><h2>Если нужна срочная помощь</h2><p>Контакт-центр <a href="tel:111">111</a> работает круглосуточно на казахском и русском языках: психологическая и информационная поддержка по семейным вопросам и защите прав детей. Он не заменяет специализированную медицинскую консультацию.</p><p>Если есть угроза жизни — звоните <a href="tel:112">112</a>.</p></section><div id="cbw"></div>';
}

/* ---------- События ---------- */

var EF={cat:'',pr:'',ft:''};

function events(){
    var r=ls('reg',[]);
    var l=EV.filter(function(e){
        return(!EF.cat||e.cat==EF.cat)&&(!EF.pr||(EF.pr=='f'?e.free:!e.free))&&(!EF.ft||e.feat.indexOf(EF.ft)>-1);
    });

    return '<section class="card hero">'+'<h1>Городские активности — для всех детей</h1><p class="mute">Не делим детей по особенностям: обычные мероприятия становятся доступными, а организаторы заранее указывают условия.</p></section>'
    +'<section class="card"><div class="two"><div>'+sel('e-cat','Направление',[['','Все'],'Творчество','Технологии','Спорт','Культура','Социализация','Природа','Семья'],EF.cat)+'</div><div>'+sel('e-pr','Цена',[['','Любая'],['f','Бесплатные'],['p','Платные']],EF.pr)+'</div></div>'+sel('e-ft','Условие доступности',[['','Любое']].concat(FEATS.concat(['Небольшая группа'])),EF.ft)+'</section><div id="evl">'
    +(l.length?l.map(function(e){
        return '<article class="card sc"><div class="hd"><h3>'+e.t+'</h3><span class="tag">'+e.cat+'</span></div><div class="mute">'+e.age+' · '+e.city+' · '+new Date(e.date).toLocaleDateString('ru-RU')+' · '+(e.free?'Бесплатно':e.price+' ₸')+'</div><p>'+e.desc+'</p><b>Условия доступности</b><ul>'+e.feat.map(function(f){
            return '<li>'+f+'</li>';
        }).join('')+'</ul><button class="btn full" data-reg="'+e.id+'">'+(r.indexOf(e.id)>-1?'Вы записаны ✓':'Подробнее о регистрации')+'</button><p class="mute"></p></article>';
    }).join(''):'<div class="card">Ничего не найдено.</div>')+'</div>'
    +'<section class="card"><h2>Как организатору попасть в афишу</h2><ol><li>Регистрация организатора</li><li>Короткое обучение по инклюзивной организации</li><li>Указание условий доступности</li><li>Проверка командой QADAM</li><li>Публикация в афише</li><li>Регистрация детей родителями</li><li>Отзывы после мероприятия</li></ol></section>'
    +'<section class="card"><h2>Волонтёры</h2><p class="mute">Помощь с ориентацией на площадке, творческие занятия, сопровождение групп вместе с ответственным взрослым. Волонтёр не заменяет родителя, педагога или врача. Обязательны проверка, обучение и правила защиты детей; никаких индивидуальных встреч с несовершеннолетними без контроля.</p></section>';
}

/* ---------- Безопасность ---------- */

function safety(){
    var T=[
        ['Имя родителя','Регистрация и запись'],
        ['Телефон / email','Обратная связь'],
        ['Город','Поиск специалистов'],
        ['Возрастная группа ребёнка','Подбор услуг'],
        ['Диагноз','Только если нужен для функции и есть согласие'],
        ['Медзаключения, ПМПК, ИИН, фото ребёнка','НЕ собираем'],
        ['История записей','Только данные записи']
    ];

    // return '<section class="card hero">'+tag(7,'Безопасность')+'<h1>Ваша безопасность</h1><p class="mute">Мы собираем как можно меньше данных. Абсолютную безопасность обещать нельзя — ниже честно описаны меры и ограничения.</p></section>'
    return '<section class="card hero">'+'<h1>Ваша безопасность</h1><p class="mute">Мы собираем как можно меньше данных. Абсолютную безопасность обещать нельзя — ниже честно описаны меры и ограничения.</p></section>'
    +'<section class="card"><h2>Какие данные собираем</h2><table class="tb">'+T.map(function(r){
        return '<tr><td>'+r[0]+'</td><td class="mute">'+r[1]+'</td></tr>';
    }).join('')+'</table><p class="mute">Родитель не должен загружать заключения, чтобы смотреть каталог. Отдельного профиля ребёнка нет: всё управляется через аккаунт родителя.</p></section>'
    +'<section class="card"><h2>Как проверяем специалистов</h2><ol><li>Личность</li><li>Образование и дополнительные квалификации</li><li>Профессиональные полномочия (лицензия — для медицинских услуг; для педагогов — соответствие квалификационным требованиям)</li><li>Опыт</li><li>Регулярная перепроверка и разбор жалоб</li></ol><p><span class="tag ok">Личность подтверждена</span> <span class="tag ok">Квалификация проверена</span> <span class="tag ok">Лицензия проверена</span></p><p class="mute">Если документа нет или он не подходит, статус не присваивается. Проверка документов — не гарантия результата.</p></section>'
    +'<section class="card"><h2>Отзывы</h2><p class="mute">Оставляют только родители с подтверждённой записью. Модерация одинакова для положительных и отрицательных. Запрещено: диагнозы других детей, медицинские документы, адреса, фото детей без согласия, оскорбления, заведомая ложь. Центры не могут удалять подтверждённые отзывы или платить за оценки.</p></section>'
    +'<section class="card"><h2>Меры защиты и согласия</h2><ul><li>HTTPS, шифрование данных, разграничение прав, 2FA для администраторов, журнал действий, резервные копии, автоматический выход</li><li>Хранение данных на территории Казахстана — уточняется с юристом</li><li>Данные детей не передаются внешним ИИ-сервисам</li><li>Раздельные согласия: обработка данных, передача специалисту, рассылки (необязательно), фото/видео (если понадобится)</li><li>Вы можете посмотреть, исправить данные, отозвать согласие и запросить удаление</li></ul></section>'
    +'<section class="card"><h2>Пожаловаться</h2>'+sel('rp-t','Тема',['Пожаловаться на специалиста','Недостоверная информация','Жалоба на центр','Запросить повторную проверку','Подозрение на утечку данных'])+'<label for="rp-p">Ваш телефон или email для ответа</label><input id="rp-p"><p class="err" id="rp-e"></p><button class="btn full" data-act="rp">Отправить</button></section>';
}

/* ---------- Отрисовка и обработчики ---------- */

function render(){
    var v=view();

    $('#nav').innerHTML=PAGES.map(function(p){
        return '<a href="#'+p[0]+'"'+(p[0]==v?' class="on" aria-current="page"':'')+'>'+p[1]+'</a>';
    }).join('');

    $('#app').innerHTML={
        home:home,
        catalog:catalog,
        navigator:navigator_,
        specialists:specs,
        support:support,
        events:events,
        safety:safety,
        hard:hard
    }[v]();

    if(v=='specialists')res();
    if(v=='support')fh();

    window.scrollTo(0,0);
}

function cbSend(){
    var p=$('#cb-p').value.trim(),n=$('#cb-n').value.trim(),e=$('#cb-e');

    if(n.length<2||!/^\+?[0-9 ()-]{10,18}$/.test(p)){
        e.textContent='Укажите имя и телефон';
        return;
    }

    if(!$('#cb-c').checked){
        e.textContent='Нужно согласие';
        return;
    }

    var a=ls('cb',[]);
    a.push({
        t:$('#cb-t').value,
        w:$('#cb-w').value,
        n:n,
        p:p,
        at:Date.now()
    });

    sv('cb',a);

    $('#cbx').innerHTML='<h2>Заявка принята</h2><p>Консультант позвонит в выбранное время: '+esc($('#cb-w').value)+'. </p>';
}

document.addEventListener('click',function(e){
    var t=e.target.closest('[data-go],[data-act],[data-rm],[data-mode],[data-map],[data-fav],[data-grp],[data-reg],[data-psy],[data-cbgo]');

    if(!t)return;

    var d=t.dataset;

    if(d.go){
        go(d.go);
        return;
    }

    if(d.psy!==undefined){
        rf();
        F.role='Психолог';
    }

    if(d.fav){
        var f=ls('fav',[]),i=f.indexOf(+d.fav);
        i>-1?f.splice(i,1):f.push(+d.fav);
        sv('fav',f);
        t.textContent=i>-1?'☆ В избранное':'★ В избранном';
        return;
    }

    if(d.rm){
        if(d.rm=='*')rf();
        else if(d.rm.indexOf('feat:')==0)F.feat.splice(F.feat.indexOf(d.rm.slice(5)),1);
        else{
            delete F[d.rm];
            if(d.rm=='city')delete F.dist;
        }

        $('#side').innerHTML=side();
        res();
        return;
    }

    if(d.mode){
        S.mode=d.mode;
        res();
        return;
    }

    if(d.map!==undefined){
        S.map=+d.map;
        res();
        return;
    }

    if(d.grp!==undefined){
        var g=ls('grp',[]);
        if(g.indexOf(+d.grp)<0)g.push(+d.grp);
        sv('grp',g);
        t.textContent='Вы в группе ✓';
        return;
    }

    if(d.reg){
        var r=ls('reg',[]);
        if(r.indexOf(+d.reg)<0)r.push(+d.reg);
        sv('reg',r);
        t.textContent='Вы записаны ✓';
        return;
    }

    if(d.cbgo!==undefined||d.act=='cbgo'){
        if(view()=='hard'){
            $('#cbw').innerHTML=cbForm();
            $('#cbx').scrollIntoView({behavior:'smooth'});
        }else{
            go('support');
        }
        return;
    }

    if(d.act=='psy'){
        rf();
        F.role='Психолог';
        go('specialists');
        return;
    }

    if(d.act=='next'){
        var s=NV[S.step];

        if(s.m){
            var v=[].map.call(document.querySelectorAll('[name=m]:checked'),function(x){
                return x.value;
            });

            if(s.k=='conc'&&!v.length){
                S.err='Выберите хотя бы один вариант';
                render();
                return;
            }

            S.A[s.k]=v;
        }else{
            var x=$('#nv-s').value;

            if(!x){
                S.err='Выберите вариант';
                render();
                return;
            }

            S.A[s.k]=x;
        }

        S.err='';
        S.step++;
        render();
        return;
    }

    if(d.act=='back'){
        S.step--;
        S.err='';
        render();
        return;
    }

    if(d.act=='reset'){
        S.step=0;
        S.A={};
        render();
        return;
    }

    if(d.act=='pick'){
        pickF();
        go('specialists');
        if(view()=='specialists')render();
        return;
    }

    if(d.act=='save'){
        sv('route',{A:S.A,at:Date.now()});
        $('#sv').textContent='Маршрут сохранён в этом браузере (в личном кабинете появится после подключения аккаунтов).';
        return;
    }

    if(d.act=='cb'){
        cbSend();
        return;
    }

    if(d.act=='rp'){
        var c=$('#rp-p').value.trim();

        if(c.length<5){
            $('#rp-e').textContent='Укажите контакт';
            return;
        }

        var a=ls('rp',[]);
        a.push({t:$('#rp-t').value,c:c,at:Date.now()});
        sv('rp',a);
        $('#rp-e').textContent='';
        $('#rp-p').value='';
        alert('Обращение принято и будет рассмотрено.');
    }
});

document.addEventListener('input',function(e){
    var t=e.target;

    if(t.id=='q'){
        S.q=t.value;

        if(view()=='catalog')$('#cl').innerHTML=catBody();
        else if(view()=='specialists')res();
    }
});

document.addEventListener('change',function(e){
    var t=e.target,i=t.id||'';

    if(i.indexOf('f-')==0){
        var k=i.slice(2);
        F[k]=t.value;

        if(k=='city'){
            delete F.dist;
            $('#side').innerHTML=side();
        }

        res();
        return;
    }

    if(t.dataset.feat){
        var a=F.feat,j=a.indexOf(t.dataset.feat);
        j>-1?a.splice(j,1):a.push(t.dataset.feat);
        res();
        return;
    }

    if(i=='sortb'){
        S.sort=t.value;
        res();
        return;
    }

    if(i=='fh-c'||i=='fh-k'){
        fh();
        return;
    }

    if(i.indexOf('e-')==0){
        EF[{'e-cat':'cat','e-pr':'pr','e-ft':'ft'}[i]]=t.value;
        var y=window.scrollY;
        render();
        window.scrollTo(0,y);
    }
});

var qc=new URLSearchParams(location.search).get('cat'),
RM={
    speech:'Логопед',
    learn:'Дефектолог',
    motor:'Невролог',
    emo:'Психолог',
    sensory:'Эрготерапевт',
    sense:'Сурдолог'
};

if(qc&&RM[qc]){
    F.role=RM[qc];
    if(!location.hash)location.hash='specialists';
}

window.addEventListener('hashchange',render);
render();