(function(){
  "use strict";

  var root=document.getElementById("catalog-root");
  if(!root) return;
  var kind=document.body.getAttribute("data-catalog-kind")||"business";
  var view=document.body.getAttribute("data-catalog-view")||"list";
  var member=document.body.getAttribute("data-user")==="member";

  var DATA={
    business:{
      title:"기업지원정책",subtitle:"경기도 기업의 성장·채용·수출·환경개선 지원정책을 조건으로 찾아보세요.",
      filters:[
        {key:"region",label:"지역",items:["경기전체","수원시","성남시","하남시","화성시","용인시"]},
        {key:"category",label:"지원분야",items:["전체","기업지원","창업지원","인력·고용","수출·판로","환경개선"]}
      ],
      tabs:["전체","기업지원","창업지원"],fundingLabel:"지원금 사업만 보기",popularTags:["청년채용","창업","환경개선","기업지원","수출판로","일경험"],
      hot:[
        ["마감임박","경기 레벨업 프로그램 지원기업 하반기 모집","D-1"],
        ["신규","미래내일 일경험 참여기업 지원사업","D-22"],
        ["창업지원","중소기업 AI 훈련 참여기업 모집","D-82"],
        ["상시상담","경기 스타트업 지원센터 상담 모집","상시"]
      ],
      cards:[
        {region:"하남시",category:"인력·고용",type:"기업지원",funding:false,days:0,org:"하남시청",title:"2026년 제2회 하남시 청년 채용 ZONE 참여기업 모집",period:"2026-07-06 ~ 2026-08-09",target:"도내 구인기업",tags:["청년채용","구인기업지원"]},
        {region:"화성시",category:"창업지원",type:"창업지원",funding:true,days:1,org:"화성시청",title:"사회적경제기업 지속성장 지원사업 대상자 추가 모집",period:"2026-07-27 ~ 2026-08-10",target:"예비창업자·사회적기업",tags:["창업육성","사회적경제"]},
        {region:"용인시",category:"환경개선",type:"기업지원",funding:true,days:2,org:"용인시청",title:"기업환경 개선사업 추가 모집",period:"2026-07-27 ~ 2026-08-11",target:"중소기업·일반기업",tags:["작업환경","환경개선"]},
        {region:"화성시",category:"기업지원",type:"기업지원",funding:true,days:2,org:"화성산업진흥원",title:"중소기업 노동자 기숙사 임차비 지원사업",period:"2026-07-27 ~ 2026-08-11",target:"도내 중소기업",tags:["기숙사임차비","기업지원"]},
        {region:"수원시",category:"수출·판로",type:"기업지원",funding:true,days:9,org:"수원시청",title:"국외 박람회 개별 참가업체 지원",period:"2026-08-04 ~ 2026-08-18",target:"수원시 소재 중소기업",tags:["해외박람회","수출판로"]},
        {region:"성남시",category:"인력·고용",type:"기업지원",funding:false,days:22,org:"이노비즈협회",title:"미래내일 일경험 인턴형 참여기업 지원",period:"2026-04-29 ~ 2026-08-31",target:"청년 채용 희망기업",tags:["인턴","청년일경험"]}
      ],
      detail:{org:"이노비즈협회",category:"기업지원",title:"2026년 미래내일 일경험(인턴형) 참여기업 지원사업 공고",days:"D-22",period:"2026-04-29 ~ 2026-08-31",target:"청년 일경험 제공이 가능한 기업",method:"온라인 접수",sections:[
        ["사업 개요","청년에게 직무 경험을 제공하고 참여기업의 인턴 운영비와 멘토링을 지원합니다."],
        ["지원 내용","참여 청년 인턴십 운영비, 기업 멘토 수당, 사전 직무교육과 현장 컨설팅을 지원합니다."],
        ["신청 자격","고용보험에 가입한 상시근로자를 보유하고 청년에게 적정한 직무와 근무환경을 제공할 수 있는 기업입니다."],
        ["신청 방법","신청·접수 또는 수행기관 홈페이지에서 신청서를 작성하고 필수 서류를 제출합니다."],
        ["문의","이노비즈협회 미래내일 일경험 운영팀 031-000-0000"]
      ]}
    },
    education:{
      title:"취업지원 정책",subtitle:"구직 단계와 관심 직무에 맞는 온·오프라인 취업교육을 찾아보세요.",
      filters:[
        {key:"region",label:"교육방식",items:["전체","온라인","집합교육","혼합교육"]},
        {key:"category",label:"교육분야",items:["전체","취업전략","직무역량","디지털","면접·자소서","자격과정"]}
      ],
      tabs:["전체","취업교육","직무교육"],fundingLabel:"무료교육만 보기",popularTags:["무료교육","취업연계","AI면접","반도체","디지털","자격과정"],
      hot:[
        ["마감임박","시스템반도체 아카데미 2차","D-1"],
        ["온라인","AI 면접의 이해와 퍼펙트 대비","상시"],
        ["무료교육","SW테스팅 전문가 원스톱 과정","D-3"],
        ["신규","생성형 AI 디자인 실무 혁신","D-19"]
      ],
      cards:[
        {region:"집합교육",category:"직무역량",type:"직무교육",funding:true,days:1,org:"한국폴리텍대학",title:"2026년 시스템반도체 아카데미 2차",period:"2026-08-31 ~ 2026-10-15",target:"경기도 고교 3학년·졸업생",tags:["반도체","취업연계"]},
        {region:"집합교육",category:"면접·자소서",type:"직무교육",funding:true,days:3,org:"경기도일자리재단",title:"교육부터 취업까지 SW테스팅 전문가 과정",period:"2026-08-17 ~ 2026-09-30",target:"미취업 경기도민",tags:["SW테스팅","원스톱"]},
        {region:"온라인",category:"면접·자소서",type:"취업교육",funding:true,days:99,org:"잡아바 러닝센터",title:"AI 면접의 이해와 퍼펙트 대비",period:"상시 수강",target:"취업 준비생",tags:["AI면접","온라인"]},
        {region:"혼합교육",category:"디지털",type:"직무교육",funding:false,days:19,org:"경기도기술학교",title:"생성형 AI를 활용한 디자인 실무 혁신 과정",period:"2026-09-01 ~ 2026-09-25",target:"디자인 직무 취업희망자",tags:["생성형AI","디지털"]},
        {region:"온라인",category:"취업전략",type:"취업교육",funding:true,days:99,org:"잡아바 러닝센터",title:"반도체 분야 기업 실전 취업 전략",period:"상시 수강",target:"반도체 직무 취업 준비생",tags:["취업전략","반도체"]},
        {region:"집합교육",category:"자격과정",type:"직무교육",funding:true,days:12,org:"경기도기술학교",title:"AI-POT 프롬프트 활용능력 무료 과정",period:"2026-08-24 ~ 2026-09-11",target:"경기도민",tags:["AI-POT","무료교육","자격과정"]}
      ],
      detail:{org:"한국폴리텍대학 성남캠퍼스",category:"취업교육",title:"2026년 시스템반도체 아카데미 교육생 모집(2차)",days:"D-1",period:"2026-07-08 ~ 2026-08-10",target:"경기도 거주 고등학교 3학년 또는 졸업생",method:"온라인·이메일 접수",sections:[
        ["교육 안내","AI 반도체 제조·패키징·테스트 공정기술을 이론과 실습으로 배우는 30일 과정입니다."],
        ["교육 내용","반도체 기초와 8대 공정, 증착·포토·식각 실습, 와이어본딩과 패키징, 기업 취업특강으로 구성됩니다."],
        ["교육 혜택","교육비 전액과 출석 기준 충족 시 훈련수당을 지원하며 참여기업 취업 연계를 제공합니다."],
        ["신청 방법","참여신청서, 개인정보 활용동의서, 고용보험 가입이력확인서 등 필수 서류를 제출합니다."],
        ["문의","한국폴리텍대학 성남캠퍼스 산학처 031-739-4029"]
      ]}
    }
  };

  function esc(value){return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function stateQuery(){return member?"?user=member":"";}
  function detailFile(){return "detail-"+(kind==="business"?"biz-policy":"edu")+".html"+stateQuery();}
  function listFile(){return "list-"+(kind==="business"?"biz-policy":"edu")+".html"+stateQuery();}

  function renderBusinessCard(card,index){
    var dday=card.days===0?"오늘마감":"D-"+card.days;
    var icon=kind==="education"?"graduation-cap":"landmark";
    return '<article class="policard policard--thumb" data-business-card data-region="'+esc(card.region)+'" data-field="'+esc(card.category)+'" data-type="'+esc(card.type)+'" data-funding="'+(card.funding?'true':'false')+'" data-tags="'+esc(card.tags.join(' '))+'" data-days="'+card.days+'" data-order="'+index+'">'+
      '<a class="card" href="'+detailFile()+'"><div class="policard__thumb"><i data-lucide="'+icon+'" aria-hidden="true"></i></div><div class="policard__body">'+
      '<div class="policard__orgline"><span class="badge">'+esc(card.type)+'</span><span class="card__org">'+esc(card.org)+'</span></div>'+
      '<div class="policard__head"><div class="card__title">'+esc(card.title)+'</div><span class="badge badge--solid policard__dday">'+dday+'</span></div>'+
      '<dl class="policard__info"><div><dt>모집일정</dt><dd>'+esc(card.period)+'</dd></div><div><dt>지원대상</dt><dd>'+esc(card.target)+'</dd></div></dl>'+
      '<div class="card__tags"><span class="card__tag">#'+esc(card.region)+'</span><span class="card__tag">#'+esc(card.category)+'</span>'+card.tags.map(function(tag){return '<span class="card__tag">#'+esc(tag)+'</span>';}).join('')+'</div>'+
      '</div></a></article>';
  }

  function renderBusinessList(data){
    root.className="container section business-catalog";
    var firstFilterLabel=data.filters[0].label;
    var secondFilterLabel=data.filters[1].label;
    var fundingGroupLabel=kind==="education"?"교육비":"사업유형";
    var hot=data.hot.map(function(item){return '<a class="card" href="'+detailFile()+'"><div class="hotissue__thumb"><i data-lucide="image" aria-hidden="true"></i></div><div class="card__badges"><span class="badge">'+esc(item[0])+'</span></div><div class="card__title">'+esc(item[1])+'</div><p class="hotissue__due">'+esc(item[2])+'</p></a>';}).join('');
    var deadline=data.cards.filter(function(card){return card.days<=7;}).slice(0,3).map(function(card){return '<li><a href="'+detailFile()+'"><span class="dday-list__d">'+(card.days===0?'오늘':'D-'+card.days)+'</span><span class="dday-list__title">'+esc(card.title)+'</span><span class="small muted">'+esc(card.category)+'</span></a></li>';}).join('');
    var region=data.filters[0].items.map(function(item,i){return '<button type="button" class="chip" data-value="'+esc(item)+'" aria-pressed="'+(i===0?'true':'false')+'">'+esc(item)+'</button>';}).join('');
    var field=data.filters[1].items.map(function(item,i){return '<button type="button" class="chip" data-value="'+esc(item)+'" aria-pressed="'+(i===0?'true':'false')+'">'+esc(item)+'</button>';}).join('');
    var tags=data.popularTags.map(function(item){return '<button type="button" class="chip" data-value="'+item+'" aria-pressed="false">#'+item+'</button>';}).join('');
    var tabs=data.tabs.map(function(item,index){return '<button type="button" role="tab" class="tab" aria-selected="'+(index===0?'true':'false')+'" '+(index===0?'':'tabindex="-1" ')+'data-business-tab="'+esc(item)+'" data-label="'+esc(item)+'">'+esc(item)+'</button>';}).join('');

    root.innerHTML='<p class="small muted"><a href="'+(member?'main-member-a.html':'main-guest-a.html')+'">홈</a> › '+esc(data.title)+'</p>'+
      '<h1 class="section__title" style="margin-top:8px">'+esc(data.title)+'</h1><p class="muted small">'+esc(data.subtitle)+'</p>'+
      '<section class="section" aria-labelledby="business-hot-title"><div class="section__head"><h2 id="business-hot-title">지금 주목할 '+esc(data.title)+'</h2></div><div class="grid grid--4 business-hot-grid" style="margin-top:12px">'+hot+'</div></section>'+
      '<section class="curation-hot" aria-labelledby="business-deadline-title" style="margin-top:20px"><div class="section__head" style="margin-bottom:8px"><h3 id="business-deadline-title" style="font-size:16px">마감임박 <span class="small muted">D-7 이내 · '+data.cards.filter(function(card){return card.days<=7;}).length+'건</span></h3><button type="button" class="btn btn--sm" data-business-deadline>마감임박 전체보기 <i data-lucide="arrow-down" aria-hidden="true"></i></button></div><ul class="dday-list" aria-label="마감임박 상위 3건">'+deadline+'</ul></section>'+
      '<div class="region-sep" style="margin-top:28px"><span class="region-sep__label">조건으로 찾기</span></div>'+
      '<div class="listfilter business-filter">'+
        '<div class="listfilter__row"><span class="listfilter__label">'+esc(firstFilterLabel)+'</span><div class="chips" role="group" aria-label="'+esc(firstFilterLabel)+'" data-business-filter="region">'+region+'</div></div>'+
        '<div class="listfilter__row"><span class="listfilter__label">'+esc(secondFilterLabel)+'</span><div class="chips" role="group" aria-label="'+esc(secondFilterLabel)+'" data-business-filter="field">'+field+'</div></div>'+
        '<div class="listfilter__row"><span class="listfilter__label">'+fundingGroupLabel+'</span><label class="business-funding"><input type="checkbox" data-business-funding> '+esc(data.fundingLabel)+'</label></div>'+
        '<div class="listfilter__row"><span class="listfilter__label">인기태그</span><div class="chips" role="group" aria-label="인기태그" data-business-filter="tag">'+tags+'</div></div>'+
      '</div>'+
      '<div class="listfilter__foot"><div class="listfilter__sel business-applied"><span class="small muted">선택 조건</span></div><button type="button" class="btn btn--sm" data-business-reset>조건 초기화</button></div>'+
      '<section id="policy-result" style="margin-top:24px">'+
        '<div class="tabs" role="tablist" aria-label="'+esc(data.title)+' 분류">'+tabs+'</div>'+
        '<div class="result-head" style="margin-top:20px"><div><strong data-business-count>'+data.cards.length+'</strong>건 · <span class="muted small">현재 조건 기준</span></div><div class="result-head__tools"><select class="select" data-business-sort aria-label="정렬"><option value="deadline">마감임박순</option><option value="latest">최신순</option></select><select class="select" aria-label="페이지당 결과 수"><option>20개씩</option><option>30개씩</option><option>50개씩</option></select></div></div>'+
        '<div class="grid business-policy-list" style="gap:12px;margin-top:16px">'+data.cards.map(renderBusinessCard).join('')+'</div>'+
        '<div class="catalog-empty" data-business-empty hidden><p>선택한 조건에 맞는 결과가 없습니다.</p><button type="button" class="btn btn--outline btn--sm" data-business-reset>조건 초기화</button></div>'+
      '</section>';
    setupBusinessList();
  }

  function setupBusinessList(){
    var activeType="전체",deadlineOnly=false;
    var cards=[].slice.call(root.querySelectorAll('[data-business-card]'));
    function selected(key){return [].slice.call(root.querySelectorAll('[data-business-filter="'+key+'"] .chip[aria-pressed="true"]')).map(function(button){return button.getAttribute('data-value');});}
    function broad(values,names){return !values.length||names.some(function(name){return values.indexOf(name)!==-1;});}
    function baseMatch(card){
      var regions=selected('region'),fields=selected('field'),tags=selected('tag');
      var region=broad(regions,["전체","경기전체"])||regions.indexOf(card.dataset.region)!==-1;
      var field=broad(fields,["전체"])||fields.indexOf(card.dataset.field)!==-1;
      var tag=!tags.length||tags.some(function(value){return card.dataset.tags.indexOf(value)!==-1;});
      var funding=!root.querySelector('[data-business-funding]').checked||card.dataset.funding==='true';
      return region&&field&&tag&&funding;
    }
    function renderApplied(){
      var box=root.querySelector('.business-applied');box.querySelectorAll('.badge').forEach(function(node){node.remove();});
      var values=selected('region').concat(selected('field')).filter(function(value){return value!=="전체"&&value!=="경기전체";});
      selected('tag').forEach(function(value){values.push('#'+value);});
      if(root.querySelector('[data-business-funding]').checked)values.push(kind==='education'?'무료교육':'지원금 사업');
      if(deadlineOnly)values.push('마감임박');
      values.forEach(function(value){var badge=document.createElement('span');badge.className='badge badge--strong';badge.textContent=value;box.appendChild(badge);});
    }
    function updateTabs(baseCards){
      root.querySelectorAll('[data-business-tab]').forEach(function(tab){var type=tab.dataset.businessTab;var count=type==='전체'?baseCards.length:baseCards.filter(function(card){return card.dataset.type===type;}).length;tab.textContent=tab.dataset.label+' '+count;});
    }
    function apply(){
      var baseCards=cards.filter(function(card){return baseMatch(card)&&(!deadlineOnly||Number(card.dataset.days)<=7);});
      updateTabs(baseCards);var visible=0;
      cards.forEach(function(card){var show=baseCards.indexOf(card)!==-1&&(activeType==='전체'||card.dataset.type===activeType);card.hidden=!show;if(show)visible++;});
      root.querySelector('[data-business-count]').textContent=visible;root.querySelector('[data-business-empty]').hidden=visible!==0;renderApplied();
    }
    root.querySelectorAll('[data-business-filter] .chip').forEach(function(button){button.addEventListener('click',function(){var group=button.closest('[data-business-filter]');var multi=group.dataset.businessFilter==='tag';if(multi){button.setAttribute('aria-pressed',button.getAttribute('aria-pressed')==='true'?'false':'true');}else{group.querySelectorAll('.chip').forEach(function(item){item.setAttribute('aria-pressed',item===button?'true':'false');});}deadlineOnly=false;apply();});});
    root.querySelector('[data-business-funding]').addEventListener('change',function(){deadlineOnly=false;apply();});
    root.querySelectorAll('[data-business-tab]').forEach(function(tab){tab.addEventListener('click',function(){activeType=tab.dataset.businessTab;root.querySelectorAll('[data-business-tab]').forEach(function(item){var on=item===tab;item.setAttribute('aria-selected',on?'true':'false');item.setAttribute('tabindex',on?'0':'-1');});apply();});});
    root.querySelector('[data-business-deadline]').addEventListener('click',function(){deadlineOnly=true;apply();root.querySelector('#policy-result').scrollIntoView({behavior:'smooth',block:'start'});});
    root.querySelector('[data-business-sort]').addEventListener('change',function(event){cards.sort(function(a,b){return event.target.value==='deadline'?Number(a.dataset.days)-Number(b.dataset.days):Number(a.dataset.order)-Number(b.dataset.order);});cards.forEach(function(card){root.querySelector('.business-policy-list').appendChild(card);});});
    root.querySelectorAll('[data-business-reset]').forEach(function(button){button.addEventListener('click',function(){root.querySelectorAll('[data-business-filter]').forEach(function(group){group.querySelectorAll('.chip').forEach(function(item,index){item.setAttribute('aria-pressed',index===0&&group.dataset.businessFilter!=='tag'?'true':'false');});});root.querySelector('[data-business-funding]').checked=false;activeType='전체';deadlineOnly=false;var first=root.querySelector('[data-business-tab="전체"]');root.querySelectorAll('[data-business-tab]').forEach(function(tab){var on=tab===first;tab.setAttribute('aria-selected',on?'true':'false');tab.setAttribute('tabindex',on?'0':'-1');});apply();});});
    apply();
  }

  function renderList(data){
    root.innerHTML='<div class="pagehead"><div class="container"><h1>'+data.title+'</h1><p>'+data.subtitle+'</p></div></div>'+
      '<div class="container">'+(member?'<p class="catalog-member-note"><i data-lucide="sparkles"></i>회원님의 관심 지역·분야를 기준으로 추천 결과를 함께 보여드립니다.</p>':'')+
      '<section class="catalog-hot" aria-labelledby="catalog-hot-title"><div class="section__head"><h2 id="catalog-hot-title">지금 주목할 '+data.title+'</h2></div><div class="catalog-hot__grid">'+data.hot.map(function(item){return '<a class="catalog-hot__card" href="'+detailFile()+'"><small>'+esc(item[0])+'</small><strong>'+esc(item[1])+'</strong><span>'+esc(item[2])+'</span></a>';}).join('')+'</div></section>'+
      '<section class="catalog-search" aria-label="'+data.title+' 검색"><div class="searchbox">'+
        '<label class="searchbox__keyword"><input type="search" data-catalog-keyword placeholder="사업명·기관명·키워드를 입력하세요" aria-label="'+data.title+' 키워드 검색"><i data-lucide="search" aria-hidden="true"></i></label>'+
        data.filters.map(function(group){return '<div class="catalog-filter"><span class="catalog-filter__label">'+group.label+'</span><div class="chips" data-filter="'+group.key+'">'+group.items.map(function(item,i){return '<button type="button" class="chip" data-value="'+esc(item)+'" aria-pressed="'+((member&&i===1)||(!member&&i===0)?'true':'false')+'">'+esc(item)+'</button>';}).join('')+'</div></div>';}).join('')+
        '<div class="searchbox__foot"><div class="catalog-applied" data-catalog-applied><span class="searchbox__applied-empty">선택한 조건이 없습니다.</span></div><div class="searchbox__actions"><button type="button" class="iconbtn" data-catalog-reset aria-label="선택 초기화" title="선택 초기화"><i data-lucide="rotate-ccw"></i></button><button type="button" class="btn btn--primary" data-catalog-search>선택한 조건으로 검색</button></div></div>'+
      '</div></section>'+
      '<section class="catalog-results" aria-labelledby="catalog-result-title"><div class="catalog-result-head"><p id="catalog-result-title">총 <strong data-catalog-count>'+data.cards.length+'</strong>개</p><select class="select" data-catalog-sort aria-label="정렬"><option value="deadline">마감임박순</option><option value="latest">최신순</option></select></div><div class="catalog-list" data-catalog-list>'+data.cards.map(function(card,index){return '<article class="catalog-card" data-catalog-card data-region="'+esc(card.region)+'" data-category="'+esc(card.category)+'" data-days="'+card.days+'" data-order="'+index+'"><div class="catalog-card__thumb"><i data-lucide="'+(kind==='business'?'landmark':'graduation-cap')+'"></i></div><div class="catalog-card__body"><span class="catalog-card__org">'+esc(card.org)+'</span><a class="catalog-card__title" href="'+detailFile()+'">'+esc(card.title)+'</a><div class="catalog-card__meta"><span><b>모집일정</b> '+esc(card.period)+'</span><span><b>지원대상</b> '+esc(card.target)+'</span></div><div class="catalog-card__tags"><span class="badge badge--strong">'+(card.days>90?'상시':'D-'+card.days)+'</span>'+card.tags.map(function(tag){return '<span class="badge">#'+esc(tag)+'</span>';}).join('')+'</div></div></article>';}).join('')+'</div><div class="catalog-empty" data-catalog-empty hidden><p>선택한 조건에 맞는 결과가 없습니다.</p><button type="button" class="btn btn--outline btn--sm" data-catalog-reset>조건 초기화</button></div></section></div>';
    setupList(data);
  }

  function setupList(data){
    var draft={region:[],category:[],keyword:""};
    function read(){
      ["region","category"].forEach(function(key){draft[key]=[].slice.call(root.querySelectorAll('[data-filter="'+key+'"] .chip[aria-pressed="true"]')).map(function(button){return button.getAttribute("data-value");});});
      draft.keyword=(root.querySelector('[data-catalog-keyword]').value||"").trim().toLowerCase();
    }
    function renderApplied(){
      read();var box=root.querySelector('[data-catalog-applied]');var values=draft.region.concat(draft.category).filter(function(v){return v!=="전체"&&v!=="경기전체";});
      if(draft.keyword) values.push('“'+draft.keyword+'”');
      box.innerHTML=values.length?values.map(function(value){return '<span class="chip" aria-pressed="true">'+esc(value)+'</span>';}).join(''):'<span class="searchbox__applied-empty">전체 조건으로 검색합니다.</span>';
    }
    function apply(){
      read();var visible=0;var broadRegion=draft.region.indexOf("전체")!==-1||draft.region.indexOf("경기전체")!==-1||!draft.region.length;
      var broadCategory=draft.category.indexOf("전체")!==-1||!draft.category.length;
      root.querySelectorAll('[data-catalog-card]').forEach(function(card){
        var text=card.textContent.toLowerCase();
        var region=broadRegion||draft.region.indexOf(card.getAttribute('data-region'))!==-1;
        var category=broadCategory||draft.category.indexOf(card.getAttribute('data-category'))!==-1;
        var keyword=!draft.keyword||text.indexOf(draft.keyword)!==-1;
        card.hidden=!(region&&category&&keyword);if(!card.hidden) visible++;
      });
      root.querySelector('[data-catalog-count]').textContent=visible;
      root.querySelector('[data-catalog-empty]').hidden=visible!==0;
      renderApplied();
    }
    root.querySelectorAll('[data-filter] .chip').forEach(function(button){button.addEventListener('click',function(){
      var group=button.closest('[data-filter]');var value=button.getAttribute('data-value');var broad=value==="전체"||value==="경기전체";
      if(broad){group.querySelectorAll('.chip').forEach(function(item){item.setAttribute('aria-pressed',item===button?'true':'false');});}
      else{var all=group.querySelector('[data-value="전체"], [data-value="경기전체"]');if(all) all.setAttribute('aria-pressed','false');button.setAttribute('aria-pressed',button.getAttribute('aria-pressed')==='true'?'false':'true');}
      if(!group.querySelector('.chip[aria-pressed="true"]')){var first=group.querySelector('.chip');if(first) first.setAttribute('aria-pressed','true');}
      renderApplied();
    });});
    root.querySelector('[data-catalog-keyword]').addEventListener('input',renderApplied);
    root.querySelector('[data-catalog-keyword]').addEventListener('keydown',function(event){if(event.key==='Enter'){event.preventDefault();apply();}});
    root.querySelector('[data-catalog-search]').addEventListener('click',apply);
    root.querySelectorAll('[data-catalog-reset]').forEach(function(button){button.addEventListener('click',function(){root.querySelector('[data-catalog-keyword]').value='';root.querySelectorAll('[data-filter]').forEach(function(group){group.querySelectorAll('.chip').forEach(function(item,index){item.setAttribute('aria-pressed',index===0?'true':'false');});});apply();});});
    root.querySelector('[data-catalog-sort]').addEventListener('change',function(event){var cards=[].slice.call(root.querySelectorAll('[data-catalog-card]'));cards.sort(function(a,b){return event.target.value==='deadline'?Number(a.dataset.days)-Number(b.dataset.days):Number(b.dataset.order)-Number(a.dataset.order);});cards.forEach(function(card){root.querySelector('[data-catalog-list]').appendChild(card);});});
    renderApplied();apply();
  }

  function renderDetail(data){var d=data.detail;var guestPrep="prep-hub-guest.html",memberPrep="prep-hub-member.html";
    root.className="container section public-detail catalog-detail";
    root.innerHTML='<p class="small muted"><a href="'+listFile()+'">'+data.title+'</a> › 상세</p><div class="detail-cols" style="margin-top:var(--sp-4)"><div class="public-detail__main"><section class="public-detail__document"><div class="detail-head catalog-detail__hero"><div><p class="public-detail__meta"><strong>'+esc(d.org)+'</strong><span>'+esc(d.category)+'</span></p><h1 class="detail-title">'+esc(d.title)+'</h1></div><span class="badge badge--solid catalog-detail__status">'+esc(d.days)+'</span></div><div class="public-detail__body"><div class="catalog-detail__poster"><div><span>'+esc(d.org)+'</span><strong>'+esc(d.title)+'</strong></div></div>'+d.sections.map(function(section){return '<div class="docsec"><div class="docsec__tit"><i data-lucide="check-circle"></i>'+esc(section[0])+'</div><p>'+esc(section[1])+'</p></div>';}).join('')+'<p class="public-detail__notice"><i data-lucide="lightbulb"></i>세부 일정과 제출서류는 제공기관 공고를 반드시 확인해 주세요.</p></div></section><div class="attach"><div class="attach__tit">첨부자료</div><a><i data-lucide="paperclip"></i>사업 공고문 및 신청서식.zip</a></div><div class="detail-disclaimer"><p>본 정보는 제공기관의 공고를 바탕으로 구성한 프로토타입이며 실제 일정과 지원 요건은 제공기관에서 최종 확인해야 합니다.</p></div><div class="public-detail__actions"><a class="btn btn--outline" href="'+listFile()+'">목록으로</a><a class="btn btn--primary" href="#"><i data-lucide="external-link"></i>제공기관 바로가기</a></div></div><aside class="public-detail__side"><div class="public-detail__side-sticky"><div class="apply-box public-detail__status"><div class="side-status"><span>진행 상태</span><span class="side-status__val"><b>'+esc(d.days)+'</b><span class="badge badge--solid">모집중</span></span></div><a class="btn btn--primary btn--block btn--lg" href="'+(kind==='education'&&!member?'detail-edu.html?user=member':'#')+'" '+(kind==='education'&&!member?'data-need-login':'')+'><i data-lucide="send"></i>'+'제공기관 바로가기'+'</a></div><div class="apply-box public-detail__summary"><dl class="sidesum"><div><dt>모집일정</dt><dd>'+esc(d.period)+'</dd></div><div><dt>지원대상</dt><dd>'+esc(d.target)+'</dd></div><div><dt>신청방법</dt><dd>'+esc(d.method)+'</dd></div></dl></div><section class="std-foot std-foot--side"><div class="std-foot__grid std-foot__grid--side"><div class="std-foot__col"><h3>이런 사업도 있어요</h3><ul><li><a href="apply-'+(member?'member':'guest')+'.html">마감 임박 지원사업</a></li><li><a href="'+listFile()+'">같은 분야 공고 더보기</a></li></ul></div><div class="std-foot__col"><h3>취업 준비가 고민이라면</h3><ul><li><a href="'+(member?memberPrep:guestPrep)+'">취업진단과 역량강화</a></li><li><a href="'+(member?memberPrep:guestPrep)+'">자소서·AI 면접 준비</a></li></ul></div><div class="std-foot__col"><h3>알아두면 좋은 정보</h3><ul><li><a>신청서 작성 전 체크리스트</a></li><li><a>제출서류 발급 방법</a></li></ul></div></div></section></div></aside></div>';
  }

  var data=DATA[kind]||DATA.business;
  if(view==="detail") renderDetail(data); else renderBusinessList(data);
  if(window.lucide) window.lucide.createIcons();
})();
