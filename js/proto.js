/* ================================================================
   잡아바 프로토타입 공통 스크립트
   - 공통 헤더/푸터/프로토바 주입 (data-user: guest|member)
   - 탭·칩·토글·로그인 유도 모달 인터랙션
   - 더미 데이터만 사용, 서버 통신 없음
   ================================================================ */
(function(){
  var modalReturnFocus = null;

  // To-Be GNB 6 상위메뉴 × 2Depth — 정보구조_IA_개편안.md §3 그대로.
  //   (기업서비스는 GNB 메뉴가 아니라 신설 페이지 — 유틸바로 별도 진입.)
  //   [메뉴명, 상위 링크키, [[하위명, 링크키], ...]]
  //   링크키 "list"/"corp"/"policy"는 로그인 상태에 따라 화면이 갈린다.
  //   "#"은 프로토타입 화면이 없는 항목(비활성 표시).
  var GNB = [
    ["일자리 찾기","list",[
      ["공공채용","list"],
      ["기업채용","corp"],
      ["온라인 채용관","#"],
      ["테마채용관","#"]
    ]],
    ["정책·지원 찾기","policy",[
      ["일자리 지원정책","policy"],
      ["기업 지원정책","bizpolicy"],
      ["정책활용꿀팁","#"],
      ["취업지원 정책","edu"]
    ]],
    ["신청·접수","apply",[
      ["지원사업","apply"],
      ["기간제 채용관","#"]
    ]],
    ["취업준비","prep",[
      ["취업진단","prep"],
      ["자소서첨삭","prep"],
      ["AI 역량검사","prep"],
      // 동영상강의: 현재 러닝센터 온라인교육 프로토타입으로 연결한다.
      // 운영 시 확정된 러닝센터 URL로 교체한다.
      ["동영상강의","learning-center.html"],
      ["잡학사전","#"]
    ]],
    // 대상별 5종은 GNB 드롭다운에 노출한다. 청년·중장년·장애인은 허브 탭,
    // 여성·외국인은 외부 서비스로 바로 진입한다.
    ["대상별 서비스","target",[
      ["청년","target-youth"],
      ["중장년","target-senior"],
      // [개발 연동] 여성은 꿈날개 외부 URL 확정 후 현재 # 링크를 교체한다.
      ["여성","external-women"],
      ["장애인","target-disabled"],
      // [개발 연동] 현재 잡아바 외국인채용관(exhb seq=149) 임시 연결 대상.
      // 외국인 일자리포털 오픈 시 실제 URL로 교체하며, 현재 다국어는 제공하지 않는다.
      ["외국인","external-foreigners"]
    ]],
    ["고객지원","#",[
      ["공지사항","#"],
      ["Q&A","#"],
      ["이벤트","#"]
    ]]
  ];

  function el(html){var t=document.createElement("template");t.innerHTML=html.trim();return t.content.firstChild;}

  // XSS 방지: 문서 title 등 문자열을 마크업에 넣기 전 이스케이프
  function esc(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  /* 정책 목록 인기태그는 통합검색으로 이동하지 않고 현재 정책공고 목록만 검색한다.
     서버 연동 전 프로토타입에서는 현재 화면에 있는 정책 카드의 제목·본문·태그를 검색한다. */
  function applyPolicyTagFilter(options){
    options = options || {};
    var result = document.getElementById("policy-result");
    var tagChips = [].slice.call(document.querySelectorAll('[data-action="filter-tag"]'));
    if(!result || !tagChips.length) return;

    var keywords = tagChips.filter(function(chip){
      return chip.getAttribute("aria-pressed") === "true";
    }).map(function(chip){
      return chip.textContent.trim().replace(/^#/, "").toLowerCase();
    });
    var cards = [].slice.call(result.querySelectorAll(".policard"));
    var visible = 0;

    cards.forEach(function(card){
      var haystack = card.textContent.replace(/\s+/g, " ").toLowerCase();
      // 인기태그끼리는 OR, 다른 조건 축과는 AND로 서버에서 결합한다.
      var matched = !keywords.length || keywords.some(function(keyword){ return haystack.indexOf(keyword) !== -1; });
      card.hidden = !matched;
      if(matched) visible++;
    });

    var resultCount = result.querySelector(".result-head strong");
    var resultContext = result.querySelector(".result-head .muted.small");
    if(resultCount){
      if(!resultCount.hasAttribute("data-policy-initial-count")){
        resultCount.setAttribute("data-policy-initial-count", resultCount.textContent.trim());
      }
      resultCount.textContent = keywords.length ? String(visible) : resultCount.getAttribute("data-policy-initial-count");
    }
    if(resultContext){
      if(!resultContext.hasAttribute("data-policy-initial-context")){
        resultContext.setAttribute("data-policy-initial-context", resultContext.textContent.trim());
      }
      resultContext.textContent = keywords.length
        ? "프로토타입 표본 · #" + keywords.join(" · #")
        : resultContext.getAttribute("data-policy-initial-context");
    }
    var pagination = result.querySelector("[data-policy-pagination]");
    if(pagination) pagination.hidden = !!keywords.length;

    var status = result.querySelector("[data-policy-tag-status]");
    if(!status){
      status = document.createElement("p");
      status.className = "small muted";
      status.setAttribute("data-policy-tag-status", "");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      var head = result.querySelector(".result-head");
      if(head) head.insertAdjacentElement("afterend", status);
      else result.insertBefore(status, result.firstChild);
    }
    status.hidden = !keywords.length;
    status.textContent = keywords.length
      ? "정책공고 내 키워드 “#" + keywords.join(" · #") + "” 검색 결과를 적용했습니다."
      : "";

    var empty = result.querySelector("[data-policy-tag-empty]");
    if(keywords.length && visible === 0){
      if(!empty){
        empty = document.createElement("p");
        empty.className = "empty";
        empty.setAttribute("data-policy-tag-empty", "");
        empty.setAttribute("role", "status");
        empty.textContent = "현재 프로토타입 표본에는 해당 키워드의 정책공고가 없습니다.";
        var grid = result.querySelector(".grid");
        if(grid) grid.insertAdjacentElement("afterend", empty);
        else result.appendChild(empty);
      }
      empty.hidden = false;
    } else if(empty){
      empty.hidden = true;
    }

    if(options.updateUrl && window.history && window.history.replaceState){
      var url = new URL(window.location.href);
      if(keywords.length) url.searchParams.set("policyKeyword", keywords.join(","));
      else url.searchParams.delete("policyKeyword");
      window.history.replaceState(null, "", url.href);
    }
    if(options.scroll){
      result.scrollIntoView({behavior:"smooth", block:"start"});
    }
  }
  window.applyPolicyTagFilter = applyPolicyTagFilter;

  function initPolicyTagFilter(){
    var chips = [].slice.call(document.querySelectorAll('[data-action="filter-tag"]'));
    if(!chips.length || !document.getElementById("policy-result")) return;
    var selected = (new URL(window.location.href)).searchParams.get("policyKeyword");
    if(selected){
      var values = selected.split(",").map(function(value){ return value.trim().toLowerCase(); });
      chips.forEach(function(chip){
        var value = chip.textContent.trim().replace(/^#/, "").toLowerCase();
        chip.setAttribute("aria-pressed", values.indexOf(value) !== -1 ? "true" : "false");
      });
    }
    applyPolicyTagFilter();
  }

  // 화면 타이틀: <title>의 "잡아바 프로토타입 — " 접두어와 "(로그인 전/후)" 표기를 제거
  function pageLabel(){
    var t = document.title.split("—").pop().trim();
    return t.replace(/\s*\(로그인\s*(전|후)\)/g, "").replace(/\s+/g, " ").trim() || "프로토타입 화면";
  }

  function renderProtoBar(user){
    var isBizMember = user === "biz-member";
    var isMember = user === "member" || isBizMember;
    var bar = el('<div class="proto-bar"></div>');
    bar.innerHTML =
      '<div class="proto-bar__left">'+
        '<span class="proto-bar__title">프로토타입</span>'+
        '<a class="proto-bar__btn" href="index.html">안내페이지 가기</a>'+
      '</div>'+
      '<div class="proto-bar__right">'+
        '<span class="proto-bar__page">'+esc(pageLabel())+'</span>'+
        '<span class="proto-bar__state">'+(isBizMember?"기업회원 로그인 후":(isMember?"로그인 후":"로그인 전"))+'</span>'+
        '<span class="proto-bar__note">'+
          (isBizMember ? "로그인한 기업회원에게 보이는 화면입니다." : (isMember ? "로그인한 회원에게 보이는 화면입니다." : "로그인하지 않은 상태에서 보이는 화면입니다."))+
        '</span>'+
      '</div>';
    document.body.insertBefore(bar, document.body.firstChild);
    if(window.JobabaFeatureDefinitions) window.JobabaFeatureDefinitions.init();
  }

  function renderHeader(user){
    var cur = location.pathname.split("/").pop();
    var isBizMember = user === "biz-member";
    var isMember = user === "member" || isBizMember;
    // 메인 디자인 타입(A/B) 유지 : "-b.html"로 끝나는 화면은 B타입으로 본다.
    // 로그인/로그아웃·로고 이동 시 같은 타입의 메인으로 연결해 A/B 비교 흐름이 끊기지 않게 한다.
    var isTypeB = /-b\.html$/.test(cur);
    var guestHome = isTypeB ? "main-guest-b.html" : "main-guest-a.html";
    var memberHome = isTypeB ? "main-member-b.html" : "main-member-a.html";
    // 상단 영역은 전 화면 동일(포털형). 회원/비회원은 유틸바 우측만 달라진다.
    var right = isBizMember
      ? '<span class="utilbar__me">잡아바기업</span>'+
        '<a>기업정보</a>'+
        '<a href="biz-home.html">로그아웃</a>'
      : isMember
      ? '<span class="utilbar__me">김청년님</span>'+
        '<a href="mypage-member.html#g-home">마이페이지</a>'+
        '<a href="'+guestHome+'">로그아웃</a>'
      : '<a href="'+memberHome+'">로그인</a><a>회원가입</a>';
    var utilityLeft = '<div class="utilbar__left">'+
      '<a class="utilbar__action" href="learning-center.html">러닝센터</a>'+
      '<a class="utilbar__action" href="'+(isMember?'apply-member.html':'apply-guest.html')+'">신청·접수</a>'+
      '<a class="utilbar__action" href="'+(isBizMember?'biz-home-member.html':'biz-home.html')+'">기업서비스</a>'+
    '</div>';
    // 기업서비스는 GNB 메뉴가 아니라 신설 페이지 — 위 유틸바로 진입(GNB 배열에서 제외).
    var menuItems = GNB;

    // 로그인 상태에 따라 갈리는 키를 실제 파일명으로 바꾼다.
    function resolve(key){
      if(key === "list")   return isMember ? "list-member.html" : "list-guest.html";
      if(key === "corp")   return isMember ? "list-corp-member.html" : "list-corp-guest.html";
      if(key === "policy") return isMember ? "list-policy-member.html" : "list-policy-guest.html";
      if(key === "bizpolicy") return "list-biz-policy.html" + (isMember ? "?user=member" : "");
      if(key === "edu") return "list-edu.html" + (isMember ? "?user=member" : "");
      if(key === "apply") return isMember ? "apply-member.html" : "apply-guest.html";
      if(key === "prep") return isMember ? "prep-hub-member.html" : "prep-hub-guest.html";
      if(key === "target") return isMember ? "target-hub-member.html" : "target-hub-guest.html";
      if(key.indexOf("external-") === 0) return "#";
      if(key.indexOf("target-") === 0){
        return (isMember ? "target-hub-member.html" : "target-hub-guest.html") + "?tab=" + key.slice(7);
      }
      return key;
    }

    var gnb = menuItems.map(function(g){
      var href = resolve(g[1]);
      var subs = g[2] || [];
      // 하위 화면에 있을 때도 상위 메뉴를 현재 위치로 표시한다.
      var currentTab = new URL(window.location.href).searchParams.get("tab");
      function isResolvedCurrent(resolved){
        if(resolved === "#") return false;
        var resolvedUrl = new URL(resolved, window.location.href);
        var resolvedFile = resolvedUrl.pathname.split("/").pop();
        var resolvedTab = resolvedUrl.searchParams.get("tab");
        return resolvedFile === cur && (!resolvedTab || resolvedTab === currentTab);
      }
      var inSub = subs.some(function(s2){
        return isResolvedCurrent(resolve(s2[1]));
      });
      var isCurrent = (href === cur || inSub) ? ' aria-current="page"' : '';
      var top = (href === "#")
        ? '<span class="gnb__item gnb__item--off">'+g[0]+'</span>'
        : '<a class="gnb__item" href="'+href+'"'+isCurrent+'>'+g[0]+'</a>';
      if(!subs.length) return '<div class="gnb__unit">'+top+'</div>';
      var sub = subs.map(function(s2){
        var sh = resolve(s2[1]);
        var noLink = (sh === "#" && s2[1].indexOf("external-") !== 0);
        var scur = isResolvedCurrent(sh) ? ' aria-current="page"' : '';
        return noLink
          ? '<span class="gnb__sub-item gnb__sub-item--off">'+s2[0]+'</span>'
          : '<a class="gnb__sub-item" href="'+sh+'"'+scur+'>'+s2[0]+'</a>';
      }).join("");
      return '<div class="gnb__unit"><div class="gnb__sub" role="group" aria-label="'+g[0]+' 하위메뉴">'+sub+'</div>'+top+'</div>';
    }).join("");
    var home = isBizMember ? "biz-home-member.html" : (isMember ? memberHome : guestHome);
    var logo = '<a class="logo logo--image" href="'+home+'"><img src="image/jobaba-logo-placeholder.svg" alt="잡아바 경기도일자리포털"></a>';
    var search = '<button class="header__search-icon" type="button" aria-label="통합검색 열기"><i data-lucide="search"></i></button>';
    var header = el(
        '<div>'+
        '<div class="utilbar"><div class="container utilbar__inner">'+
          utilityLeft+'<div class="utilbar__right">'+right+'</div>'+
        '</div></div>'+
        '<header class="header"><div class="container header__inner">'+
          logo+
          '<nav class="gnb">'+gnb+'</nav>'+
          search+
        '</div></header>'+
      '</div>'
    );
    var mount = document.getElementById("site-header");
    if(mount) mount.replaceWith(header);
  }

  function renderFooter(){
    var mount = document.getElementById("site-footer");
    if(!mount) return;
    // 푸터도 전 화면 동일(포털형)
    {
      var portalFooter = el(
        '<footer class="footer footer--portal">'+
          '<div class="footer__top">'+
            '<div class="container footer__top-inner">'+
              '<nav class="footer__links" aria-label="푸터 주요 링크">'+
                '<a class="footer__privacy">개인정보처리방침</a>'+
                '<a>경기도일자리재단</a>'+
                '<a>이용약관</a>'+
                '<a>API 신청</a>'+
              '</nav>'+
              '<div class="footer__social" aria-label="경기도일자리재단 공식 SNS">'+
                '<a aria-label="페이스북"><span aria-hidden="true">f</span></a>'+
                '<a aria-label="인스타그램"><span class="footer__social-instagram" aria-hidden="true">◎</span></a>'+
                '<a aria-label="유튜브"><span class="footer__social-youtube" aria-hidden="true">▶</span></a>'+
                '<a aria-label="블로그"><span aria-hidden="true">b</span></a>'+
              '</div>'+
            '</div>'+
          '</div>'+
          '<div class="container footer__body">'+
            '<div class="footer__info">'+
              '<p><strong>잡아바 및 러닝센터 이용문의</strong> : 031-270-9988 / <a href="mailto:jobaba@GJF.or.kr">jobaba@GJF.or.kr</a></p>'+
              '<p><strong>재단 사업문의</strong> : 031-270-9600</p>'+
              '<address>경기도 부천시 부흥로 424번길 25, 3층 경기도일자리재단 / 평일 09:00~18:00 <span>*주말 및 법정 공휴일 휴무</span></address>'+
              '<p class="footer__copyright">© 2016 GJF</p>'+
            '</div>'+
            '<a class="footer__brand" href="main-guest-a.html" aria-label="잡아바 홈으로 이동">'+
              '<img src="image/jobaba-logo-placeholder.svg" alt="잡아바 경기도일자리포털">'+
            '</a>'+
          '</div>'+
        '</footer>'
      );
      mount.replaceWith(portalFooter);
    }
  }

  /* ---- 우측 하단 플로팅 메뉴 ----
     현행 잡아바의 「상담톡」 플로팅.
     상시 노출 버튼은 상담톡 FAB + 맨 위로 버튼이고, 상담톡 클릭 시 상담톡 창을 연다.
     [개발 연동] 상담톡은 외부 상담 시스템(상담톡 채팅) 연동. */
  function renderFloat(user){
    // 별도 멀티사이트 화면(러닝센터)에는 잡아바 플로팅 퀵메뉴를 노출하지 않는다.
    if(document.body.getAttribute("data-site") === "external") return;
    var box = el(
      '<div class="floatmenu" data-floatmenu>'+
        '<button type="button" class="floatmenu__top" data-float-top aria-label="맨 위로">'+
          '<i data-lucide="arrow-up" aria-hidden="true"></i>'+
        '</button>'+
        '<button type="button" class="floatmenu__fab" data-float-chat aria-haspopup="dialog" aria-controls="chat-window" aria-expanded="false">'+
          '<i data-lucide="messages-square" aria-hidden="true"></i><span>상담톡</span>'+
        '</button>'+
      '</div>'
    );
    document.body.appendChild(box);

    box.querySelector("[data-float-chat]").addEventListener("click", function(){
      openChatWindow();
    });
    box.querySelector("[data-float-top]").addEventListener("click", function(){
      window.scrollTo({top:0, behavior:"smooth"});
    });
  }

  /* ---- 상담톡 창 ----
     상담톡 FAB 클릭 시 열리는 채팅 창.
     [개발 연동] 실제 서비스는 외부 상담 시스템(채팅 위젯)으로 대체된다. 여기서는 UI만 제공한다. */
  function ensureChatWindow(){
    if(document.getElementById("chat-window")) return document.getElementById("chat-window");
    var win = el(
      '<div class="chatwin" id="chat-window" role="dialog" aria-modal="false" aria-label="상담톡" hidden>'+
        '<div class="chatwin__head">'+
          '<span class="chatwin__title"><i data-lucide="messages-square" aria-hidden="true"></i>상담톡</span>'+
          '<button type="button" class="chatwin__close" data-chat-close aria-label="상담톡 닫기">'+
            '<i data-lucide="x" aria-hidden="true"></i>'+
          '</button>'+
        '</div>'+
        '<div class="chatwin__body">'+
          '<div class="chatwin__msg chatwin__msg--in">'+
            '<span class="chatwin__bubble">안녕하세요, 잡아바 상담톡입니다. 무엇을 도와드릴까요?</span>'+
          '</div>'+
        '</div>'+
        '<form class="chatwin__input" data-chat-form>'+
          '<input type="text" class="chatwin__field" placeholder="메시지를 입력하세요" aria-label="상담 메시지 입력" autocomplete="off">'+
          '<button type="submit" class="chatwin__send" aria-label="전송"><i data-lucide="send" aria-hidden="true"></i></button>'+
        '</form>'+
      '</div>'
    );
    document.body.appendChild(win);

    win.querySelector("[data-chat-close]").addEventListener("click", closeChatWindow);
    win.querySelector("[data-chat-form]").addEventListener("submit", function(e){
      e.preventDefault();
      var field = win.querySelector(".chatwin__field");
      var text = (field.value || "").trim();
      if(!text) return;
      var body = win.querySelector(".chatwin__body");
      body.appendChild(el('<div class="chatwin__msg chatwin__msg--out"><span class="chatwin__bubble">'+esc(text)+'</span></div>'));
      field.value = "";
      body.scrollTop = body.scrollHeight;
    });
    if(window.lucide) lucide.createIcons();
    return win;
  }
  function openChatWindow(){
    var win = ensureChatWindow();
    win.hidden = false;
    var fab = document.querySelector("[data-float-chat]");
    if(fab) fab.setAttribute("aria-expanded","true");
    var field = win.querySelector(".chatwin__field");
    if(field) field.focus();
  }
  function closeChatWindow(){
    var win = document.getElementById("chat-window");
    if(!win || win.hidden) return;
    win.hidden = true;
    var fab = document.querySelector("[data-float-chat]");
    if(fab){ fab.setAttribute("aria-expanded","false"); fab.focus(); }
  }

  /* ---- 헤더 통합검색 오버레이 ----
     헤더의 검색 아이콘(.header__search-icon) 클릭 시 전체 폭 검색 레이어를 연다.
     타입 B처럼 본문에 상시 검색이 없는 화면에서 1클릭으로 검색에 도달하게 하는 장치. */
  function ensureSearchOverlay(){
    if(document.getElementById("search-overlay")) return;
    var ov = el(
      '<div class="search-overlay" id="search-overlay" hidden>'+
        '<div class="search-overlay__sheet">'+
        '<div class="search-overlay__inner container">'+
          '<div class="search-overlay__head">'+
            '<strong>통합검색</strong>'+
            '<button type="button" class="search-overlay__close" data-search-close aria-label="검색 닫기">닫기</button>'+
          '</div>'+
          '<label class="search-overlay__field">'+
            '<input type="search" id="search-overlay-input" placeholder="채용, 정책, 지원사업을 검색하세요" aria-label="채용, 정책, 지원사업 통합검색">'+
            '<i data-lucide="search" aria-hidden="true"></i>'+
          '</label>'+
          '<div class="search-overlay__hint"><b>추천검색어</b>'+
            '<a>청년인턴</a><a>공공기관</a><a>면접수당</a><a>직무교육</a>'+
          '</div>'+
        '</div>'+
        '</div>'+
      '</div>'
    );
    document.body.appendChild(ov);
    if(window.lucide) lucide.createIcons();
  }
  function openSearchOverlay(){
    ensureSearchOverlay();
    var ov = document.getElementById("search-overlay");
    if(!ov) return;
    ov.hidden = false;
    document.body.classList.add("is-search-open");
    var input = document.getElementById("search-overlay-input");
    if(input) input.focus();
  }
  function closeSearchOverlay(){
    var ov = document.getElementById("search-overlay");
    if(!ov || ov.hidden) return;
    ov.hidden = true;
    document.body.classList.remove("is-search-open");
    var btn = document.querySelector(".header__search-icon");
    if(btn) btn.focus();
  }

  function openModal(modal, trigger){
    if(!modal) return;
    modalReturnFocus = trigger || document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-modal-open");
    var firstControl = modal.querySelector("[data-modal-close], a[href], button");
    if(firstControl) firstControl.focus();
  }

  function closeModal(modal){
    if(!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-modal-open");
    if(modalReturnFocus && document.contains(modalReturnFocus)) modalReturnFocus.focus();
    modalReturnFocus = null;
  }

  document.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
      closeSearchOverlay();
      closeChatWindow();
      closeModal(document.querySelector(".modal.is-open"));
    }
  });

  function findPanelControl(panel, fallback){
    var controls = document.querySelectorAll("[data-show]");
    var parentPanel = panel.parentElement && panel.parentElement.closest(".panel");
    var lnbControl = null;
    var matchedControl = null;
    for(var i=0; i<controls.length; i++){
      if(controls[i].getAttribute("data-show") !== panel.id) continue;
      if(controls[i].classList.contains("lnb__link")) lnbControl = controls[i];
      if(controls[i].closest(".panel") === parentPanel) matchedControl = controls[i];
    }
    return matchedControl || lnbControl || fallback;
  }

  function syncPanelControl(control){
    if(!control) return;
    var grp = control.closest("[data-showgroup]") || control.parentElement;
    if(!grp) return;
    [].forEach.call(grp.querySelectorAll("[data-show]"), function(x){
      var on = x === control;
      x.setAttribute("aria-selected", on ? "true" : "false");
      if(x.classList.contains("lnb__link")) x.setAttribute("aria-current", on ? "page" : "false");
    });
  }

  function activatePanelControl(control){
    var panel = document.getElementById(control.getAttribute("data-show"));
    if(!panel) return;

    var panelPath = [];
    var current = panel;
    while(current && current.classList.contains("panel")){
      panelPath.unshift(current);
      current = current.parentElement && current.parentElement.closest(".panel");
    }

    panelPath.forEach(function(pathPanel){
      [].forEach.call(pathPanel.parentElement.children, function(ch){
        if(ch.classList.contains("panel")) ch.hidden = true;
      });
      pathPanel.hidden = false;
      syncPanelControl(findPanelControl(pathPanel, pathPanel === panel ? control : null));
    });
  }

  /* ---- 인터랙션 위임 ---- */
  document.addEventListener("click", function(e){
    // 헤더 검색 아이콘 → 오버레이 열기 / 닫기
    if(e.target.closest(".header__search-icon")){
      e.preventDefault();
      openSearchOverlay();
      return;
    }
    if(e.target.closest("[data-search-close]") || e.target.id === "search-overlay"){
      e.preventDefault();
      closeSearchOverlay();
      return;
    }
    // 탭
    var tab = e.target.closest(".tab");
    if(tab && tab.parentElement){
      [].forEach.call(tab.parentElement.querySelectorAll(".tab"),function(t){t.setAttribute("aria-selected","false");});
      tab.setAttribute("aria-selected","true");
    }
    // 마이페이지 상세 콘텐츠 안의 실서비스 분류탭은 현재 패널 구조를 유지한 채 선택 상태만 전환한다.
    var detailTab = e.target.closest(".mypage-category-tabs button");
    if(detailTab && detailTab.parentElement){
      [].forEach.call(detailTab.parentElement.querySelectorAll("button"),function(t){t.setAttribute("aria-selected","false");});
      detailTab.setAttribute("aria-selected","true");
    }
    var keyword = e.target.closest(".mypage-keywords button");
    if(keyword){
      keyword.setAttribute("aria-pressed", keyword.getAttribute("aria-pressed")==="true" ? "false" : "true");
    }
    // 칩(다중 토글)
    // data-code / data-applied 칩은 목록 화면(js/list.js)이 상태를 직접 관리하므로 건드리지 않는다.
    // (여기서 함께 토글하면 list.js가 설정한 값이 곧바로 뒤집힌다)
    var chip = e.target.closest(".chip");
    if(chip && !chip.hasAttribute("data-code") && !chip.hasAttribute("data-applied")){
      var on = chip.getAttribute("aria-pressed")==="true";
      chip.setAttribute("aria-pressed", on?"false":"true");
      if(chip.getAttribute("data-action") === "filter-tag"){
        applyPolicyTagFilter({updateUrl:true, scroll:true});
      }
    }
    // 토글
    var tg = e.target.closest(".toggle");
    if(tg){
      var c = tg.getAttribute("aria-checked")==="true";
      tg.setAttribute("aria-checked", c?"false":"true");
    }
    // 패널 전환 (좌측 상위메뉴 / 콘텐츠 상단 하위탭 공용)
    //  - 컨트롤: [data-show="패널ID"], 같은 [data-showgroup] 내 형제와 활성 상태 공유
    //  - 패널: class="panel" 형제 중 대상만 표시
    var sw = e.target.closest("[data-show]");
    if(sw){
      e.preventDefault();
      activatePanelControl(sw);
    }
    // 로그인 유도 모달 열기 (게스트 상세의 찜/신청)
    var need = e.target.closest("[data-need-login]");
    if(need){
      e.preventDefault();
      var m = document.getElementById("login-modal");
      openModal(m, need);
    }
    // 지정 모달 열기 (예: 기업 상세의 잡아바 입사지원)
    var opener = e.target.closest("[data-modal-open]");
    if(opener){
      e.preventDefault();
      var target = document.getElementById(opener.getAttribute("data-modal-open"));
      openModal(target, opener);
    }
    // 모달 닫기
    if(e.target.closest("[data-modal-close]") || e.target.classList.contains("modal")){
      closeModal(e.target.closest(".modal") || document.querySelector(".modal.is-open"));
    }
  });

  /* ---- 초기화 ---- */
  function ensureLoginModal(user){
    if(user !== "guest" || document.getElementById("login-modal")) return;
    var modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "login-modal";
    modal.innerHTML = '<div class="modal__box"><h3>로그인이 필요해요</h3><p>로그인하면 신청·교육·취업준비 서비스를 이용하고 진행 이력을 관리할 수 있어요.</p><div class="modal__actions"><button class="btn btn--outline btn--block" data-modal-close>닫기</button><a class="btn btn--primary btn--block" href="main-member-a.html">로그인</a></div></div>';
    document.body.appendChild(modal);
  }

  document.addEventListener("DOMContentLoaded", function(){
    var user = document.body.getAttribute("data-user") || "guest";
    renderProtoBar(user);
    renderHeader(user);
    renderFooter();
    renderFloat(user);
    ensureLoginModal(user);
    initPolicyTagFilter();
    if(window.lucide) lucide.createIcons();

    // 마이페이지의 상위·중첩 패널로 직접 진입하는 링크 지원 (예: #s-resume, #ap-program)
    var initialPanelId = window.location.hash.slice(1);
    if(initialPanelId){
      var controls = document.querySelectorAll("[data-show]");
      for(var i=0; i<controls.length; i++){
        if(controls[i].getAttribute("data-show") === initialPanelId){
          controls[i].click();
          break;
        }
      }
    }
  });
})();
