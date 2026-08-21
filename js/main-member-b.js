/* ================================================================
   로그인 후 메인(타입B) 스크립트
   - main-guest-b.js와 동일한 캐러셀 로직을 쓰되 데이터가 개인화된다.
   - 각 추천 항목은 why(추천 사유)를 함께 보유한다.
     근거: OLD/개인화_로그인전후_규칙.md §4 "추천 사유 표기로 설명가능성 확보"
   ================================================================ */
(function () {
  "use strict";

  var heroSlides = [
    {
      badge: "2026 청년 일자리 박람회",
      title: "여름방학, <b>취업 준비</b>의<br>가장 빠른 출발",
      sub: "공공·기업 채용부터 청년 지원정책까지 한 번에 만나보세요",
      cta: "박람회 참가 신청 →",
      href: "#",
      icon: "briefcase-business"
    },
    {
      badge: "잡아바 취업지원 서비스",
      title: "혼자 고민하지 말고<br><b>취업 전문가</b>와 함께",
      sub: "진로 설정부터 서류·면접까지 1:1 맞춤 상담을 받아보세요",
      cta: "취업 상담 신청 →",
      href: "#",
      icon: "messages-square"
    },
    {
      badge: "청년 역량강화 프로그램",
      title: "실무에 바로 쓰는<br><b>직무 역량</b>을 완성하세요",
      sub: "온라인 강의와 직무캠프로 취업 경쟁력을 차근차근 높여보세요",
      cta: "교육 프로그램 보기 →",
      href: "#",
      icon: "graduation-cap"
    }
  ];

  // 내 맞춤 추천(featured) — 매칭율 순. why는 추천 사유 표기용
  var featuredSlidesByTarget = {
    youth: [
      {
        badges: ["매칭 92%", "마감임박"],
        coverTitle: "공공데이터 활용<br>웹서비스 개발(신입)",
        tag: "경기도청 산하기관 · 경기 수원",
        title: "공공데이터 활용 웹서비스 개발자",
        items: ["청년(만 19~34세) · 학력무관 · 신입", "정규직 (수습 3개월) · 접수 ~D-7", "공공데이터 활용 경험 우대"],
        why: "관심직무 IT·개발 · 희망지역 수원 일치, 지원이력 없음",
        href: "detail-member.html"
      },
      {
        badges: ["매칭 84%", "D-10"],
        coverTitle: "프론트엔드 개발<br>청년인턴",
        tag: "IT 서비스 기업 · 경기 성남",
        title: "웹 프론트엔드 개발 청년인턴",
        items: ["청년(만 19~34세) · 전공무관", "채용연계형 인턴 3개월 · 접수 ~D-10", "JavaScript·React 경험 우대"],
        why: "저장검색 「판교 · 인턴」 조건과 부합",
        href: "detail-member.html"
      },
      {
        badges: ["자격 충족", "D-3"],
        coverTitle: "청년 노동자 통장<br>참여자 모집",
        tag: "경기도 · 경기도 거주 청년",
        title: "2026 경기도 청년 노동자 통장",
        items: ["경기도 거주 만 19~39세 근로청년", "매월 10만원 저축 · 2년 지원", "온라인 신청 · 접수 ~D-3"],
        why: "연령·거주지 요건 충족 (참고 안내이며 최종 자격은 기관 확인)",
        href: "detail-policy-member.html"
      },
      {
        badges: ["매칭 78%", "모집중"],
        coverTitle: "SW 품질 테스터<br>직무캠프",
        tag: "경기일자리재단 · 경기 수원",
        title: "현직자와 함께하는 SW QA 직무캠프",
        items: ["미취업 청년 · 교육비 전액 지원", "실무 프로젝트 포함 6주 과정", "우수 수료자 취업 연계"],
        why: "최근 본 공고와 직무 분야가 유사",
        href: "detail-member.html"
      }
    ],
    senior: [
      {
        badges: ["접수중", "D-43"],
        coverTitle: "중장년 인턴십<br>참여 근로자 모집",
        tag: "경기도 · 신청·접수",
        title: "2026년 중장년 인턴십 참여 근로자 등록",
        items: ["중장년(만 40~64세) 대상", "인턴 1인당 월 120만원 지원(기업)", "접수 ~2026.08.31"],
        href: "apply-member.html"
      },
      {
        badges: ["접수중", "D-35"],
        coverTitle: "중장년 기회강사<br>양성과정 모집",
        tag: "경기북부 · 신청·접수",
        title: "경기북부 직업교육 중장년 기회강사 양성과정",
        items: ["중장년(만 40~64세) 대상", "직업교육 기회강사 양성 프로그램", "접수 ~2026.08.23"],
        href: "#"
      },
      {
        badges: ["잡아바 운영", "730명"],
        coverTitle: "경기 베이비부머<br>인턴십 지원",
        tag: "경기도 · 중장년 인턴십",
        title: "경기 베이비부머 인턴십 지원사업",
        items: ["중장년 인턴십 730명 규모", "3개월간 인턴 채용 기업에 월 120만원 지원", "상시 모집"],
        href: "#"
      },
      {
        badges: ["채용행사", "5070"],
        coverTitle: "경기도 5070<br>일자리박람회",
        tag: "경기도 · 채용행사",
        title: "경기도 5070 일자리박람회",
        items: ["중장년 맞춤 일자리 정보 제공", "남·북부 권역 및 7개 시·군 개최", "현장 채용 상담 진행"],
        href: "#"
      }
    ]
  };

  // 내 조건에 맞는 채용·정책(미니 카드)
  var miniItemsByTarget = {
    youth: [
      { icon: "code-2", title: "프론트엔드 개발 청년인턴", meta: "경기 판교 · 인턴 · ~D-10", why: "저장검색 조건 부합", href: "detail-member.html" },
      { icon: "wallet", title: "청년 노동자 통장 (경기)", meta: "현금성 · 월 10만원 매칭 · ~D-3", why: "자격요건 충족", href: "detail-policy-member.html" },
      { icon: "clipboard-check", title: "SW 품질 테스터 직무캠프", meta: "경기 수원 · 정규직 · ~D-14", why: "최근 본 공고와 유사", href: "detail-member.html" }
    ],
    senior: [
      { icon: "briefcase-business", title: "경기북부 직업교육 중장년 기회강사 양성과정", meta: "경기 북부 · 신청·접수 · ~D-35", href: "#" },
      { icon: "wallet", title: "경기도일자리재단 중장년 사업", meta: "유연일자리 · 월 40만원 매칭 · 상시", href: "#" },
      { icon: "graduation-cap", title: "중장년내일센터 전직지원", meta: "경력진단·재취업지원 · 상시", href: "#" }
    ]
  };

  var targetLabel = { youth: "청년", senior: "중장년" };

  function isExternal(href) {
    return /^https?:\/\//.test(href);
  }

  // 이동할 화면이 없는 항목("#")은 href 자체를 비워 클릭·앵커 이동을 막는다
  function isNoLink(href) {
    return !href || href === "#";
  }

  function setHref(el, href) {
    if (isNoLink(href)) el.removeAttribute("href");
    else el.href = href;
  }

  function setupCarousel(root, initialSlides, render) {
    var dotsRoot = root.querySelector(".vs-hero__dots, .fc-dots");
    var toggle = root.querySelector(".vs-carousel-toggle");
    var previous = root.querySelector(".vs-hero__arrow.prev");
    var next = root.querySelector(".vs-hero__arrow.next");
    var slides = initialSlides;
    var index = 0;
    var timer = null;
    var isPaused = false;

    function refreshIcons() {
      if (window.lucide) window.lucide.createIcons();
    }

    function buildDots() {
      dotsRoot.innerHTML = "";
      slides.forEach(function (_, dotIndex) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", (dotIndex + 1) + "번 슬라이드 보기");
        dot.addEventListener("click", function () { show(dotIndex); restart(); });
        dotsRoot.appendChild(dot);
      });
      dotsRoot.querySelector("button").classList.add("is-on");
      dotsRoot.querySelector("button").setAttribute("aria-current", "true");
    }

    function show(target) {
      index = (target + slides.length) % slides.length;
      root.classList.add("is-changing");
      window.setTimeout(function () {
        render(slides[index]);
        dotsRoot.querySelectorAll("button").forEach(function (dot, dotIndex) {
          var active = dotIndex === index;
          dot.classList.toggle("is-on", active);
          dot.setAttribute("aria-current", active ? "true" : "false");
        });
        root.classList.remove("is-changing");
        refreshIcons();
      }, 160);
    }

    function restart() {
      window.clearInterval(timer);
      if (!isPaused) timer = window.setInterval(function () { show(index + 1); }, 5000);
    }

    function setPaused(paused) {
      isPaused = paused;
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? "자동 롤링 재생" : "자동 롤링 일시정지");
      toggle.innerHTML = '<i data-lucide="' + (paused ? "play" : "pause") + '"></i>';
      restart();
      refreshIcons();
    }

    buildDots();

    if (previous) previous.addEventListener("click", function () { show(index - 1); restart(); });
    if (next) next.addEventListener("click", function () { show(index + 1); restart(); });
    toggle.addEventListener("click", function () { setPaused(!isPaused); });
    root.addEventListener("mouseenter", function () { window.clearInterval(timer); });
    root.addEventListener("mouseleave", restart);
    root.addEventListener("focusin", function () { window.clearInterval(timer); });
    root.addEventListener("focusout", restart);

    render(slides[0]);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
    else restart();

    return {
      setSlides: function (newSlides) {
        slides = newSlides;
        buildDots();
        show(0);
        restart();
      }
    };
  }

  var hero = document.querySelector('[data-carousel="hero"]');
  if (hero) {
    setupCarousel(hero, heroSlides, function (slide) {
      hero.querySelector(".vs-hero__badge").textContent = slide.badge;
      hero.querySelector(".vs-hero__title").innerHTML = slide.title;
      hero.querySelector(".vs-hero__sub").textContent = slide.sub;
      var link = hero.querySelector(".vs-hero__cta a");
      link.textContent = slide.cta;
      setHref(link, slide.href);
      hero.querySelector(".vs-hero__art").innerHTML = '<i data-lucide="' + slide.icon + '"></i>';
    });
  }

  var featured = document.querySelector('[data-carousel="featured"]');
  var featuredCarousel = null;
  if (featured) {
    featuredCarousel = setupCarousel(featured, featuredSlidesByTarget.youth, function (slide) {
      featured.querySelector(".fc-badges").innerHTML = slide.badges.map(function (badge, badgeIndex) {
        return '<span class="badge ' + (badgeIndex ? "badge--danger" : "badge--solid") + '">' + badge + "</span>";
      }).join("");
      featured.querySelector(".fc-title").innerHTML = slide.coverTitle;
      featured.querySelector(".fd-tag").textContent = slide.tag;
      featured.querySelector(".fd-title").textContent = slide.title;
      featured.querySelector(".vs-feat-detail ul").innerHTML = slide.items.map(function (item) {
        return "<li>" + item + "</li>";
      }).join("");
      // 추천 사유 — 슬라이드마다 함께 교체한다
      var why = featured.querySelector(".fd-why");
      if (why) why.textContent = slide.why || "";
      var btn = featured.querySelector(".vs-feat-detail .btn");
      setHref(btn, slide.href);
      if (isExternal(slide.href)) {
        btn.target = "_blank";
        btn.rel = "noopener";
      } else {
        btn.removeAttribute("target");
        btn.removeAttribute("rel");
      }
    });
  }

  function renderMini(target) {
    var heading = document.querySelector(".vs-mini-head strong");
    var row = document.querySelector(".vs-mini-row");
    if (!row) return;
    if (heading) heading.textContent = "내 조건에 맞는 채용·정책";
    row.innerHTML = miniItemsByTarget[target].map(function (item) {
      var extAttrs = isExternal(item.href) ? ' target="_blank" rel="noopener"' : "";
      var hrefAttr = isNoLink(item.href) ? "" : ' href="' + item.href + '"';
      return '<a class="vs-mini-card"' + hrefAttr + extAttrs + '>' +
        '<div class="mc-thumb"><i data-lucide="' + item.icon + '"></i></div>' +
        '<div class="mc-title">' + item.title + '</div>' +
        '<div class="mc-meta">' + item.meta + '</div>' +
        (item.why ? '<div class="mc-why">' + item.why + '</div>' : "") + '</a>';
    }).join("");
    if (window.lucide) window.lucide.createIcons();
  }

  var picker = document.querySelector("[data-picker]");
  if (picker) {
    var pickerBtn = picker.querySelector(".pick__btn");
    var pickerValue = picker.querySelector("[data-picker-value]");
    var pickerList = picker.querySelector(".pick__list");
    var options = Array.prototype.slice.call(picker.querySelectorAll(".pick__opt"));

    function closeList() {
      pickerList.hidden = true;
      pickerBtn.setAttribute("aria-expanded", "false");
    }

    function openList() {
      pickerList.hidden = false;
      pickerBtn.setAttribute("aria-expanded", "true");
      var selected = options.filter(function (o) { return o.getAttribute("aria-selected") === "true"; })[0];
      (selected || options[0]).focus();
    }

    function selectOption(opt) {
      var target = opt.getAttribute("data-value") === "senior" ? "senior" : "youth";
      options.forEach(function (o) {
        var on = o === opt;
        o.classList.toggle("is-selected", on);
        o.setAttribute("aria-selected", on ? "true" : "false");
        o.tabIndex = on ? 0 : -1;
      });
      pickerValue.textContent = opt.textContent;
      if (featuredCarousel) featuredCarousel.setSlides(featuredSlidesByTarget[target]);
      renderMini(target);
    }

    pickerBtn.addEventListener("click", function () {
      if (pickerList.hidden) openList(); else closeList();
    });
    pickerBtn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openList();
      }
    });

    options.forEach(function (opt, i) {
      opt.addEventListener("click", function () {
        selectOption(opt);
        closeList();
        pickerBtn.focus();
      });
      opt.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          var step = e.key === "ArrowDown" ? 1 : -1;
          options[(i + step + options.length) % options.length].focus();
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOption(opt);
          closeList();
          pickerBtn.focus();
        } else if (e.key === "Escape") {
          closeList();
          pickerBtn.focus();
        }
      });
    });

    document.addEventListener("click", function (e) {
      if (!picker.contains(e.target)) closeList();
    });
  }
})();
