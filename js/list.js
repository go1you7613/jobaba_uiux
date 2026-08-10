/* ================================================================
   일자리 찾기(목록) 스크립트

   분류 구조 — 세부분류는 각 탭의 **현행 운영 코드체계를 그대로** 쓴다.
     공공일자리 : 직무중심 대분류 12 → CMMN_370 채용분야 25 (2단계)
                  ※ 공공은 코드 계층이 1단계뿐이라 3단계가 존재하지 않는다.
     기업채용   : 직무중심 대분류 12 → 모집분야 중분류(3차 136) → 소분류(5차 933) (3단계)
                  ※ 현행 화면처럼 3단계를 모두 상시 노출한다.

   대분류 12만 공통 진입축으로 두어 개인화 관심직무 축을 보존한다
   (OLD/개인화_로그인전후_규칙.md §1). 코드 변환·재분류가 없으므로
   기존 조회 쿼리를 그대로 재사용할 수 있다.

   화면 소스는 <body data-jobsource="public|corp">로 구분한다.
   데이터는 js/jobcode.js(실제 운영 코드값)를 사용하며 서버 통신은 없다.
   ================================================================ */
(function () {
  "use strict";

  var J = window.JOBCODE;
  if (!J) return;

  var SOURCE = document.body.getAttribute("data-jobsource") === "corp" ? "corp" : "public";
  var IS_CORP = SOURCE === "corp";

  var LABEL = {
    "public": { sub: "채용분야", note: "공공일자리 채용분야(CMMN_370 · NCS 대분류 25) 기준 — 공공 공고는 이 단계가 최하위입니다" },
    "corp":   { sub: "모집분야 중분류", note: "(신)잡아바 분류체계(CMMN_276) 기준 — 현행 기업채용의 모집분야 중분류·소분류를 그대로 사용합니다" }
  };

  var catGrid = document.querySelector("[data-jobcat]");
  var subWrap = document.querySelector("[data-jobcat-sub]");
  var subLabel = document.querySelector("[data-jobcat-sub-label]");
  var subChips = document.querySelector("[data-jobcat-sub-chips]");
  var jdBox = document.querySelector("[data-jobdetail]");
  var jdLabel = document.querySelector("[data-jobdetail-label]");
  var searchBox = document.getElementById("detail-search");
  var searchToggle = document.querySelector("[data-search-toggle]");
  var appliedBox = document.querySelector("[data-applied-chips]");
  var resCount = document.querySelector("[data-result-count]");
  var resCond = document.querySelector("[data-result-cond]");
  var SRC_NAME = IS_CORP ? "기업채용" : "공공일자리";
  var jdChips = document.querySelector("[data-jobdetail-chips]");
  var jdSrc = document.querySelector("[data-jobdetail-src]");
  var kwInput = searchBox ? searchBox.querySelector(".searchbox__keyword input") : null;
  var runBtn = document.querySelector("[data-search-run]");
  var jobList = document.querySelector(".joblist");

  // 선택 상태
  //  대분류 : 단일 선택 — 12개 직무 그리드에서 고르면 목록에 "즉시" 반영
  //  2단계  : 공공=다중 선택(최하위 계층), 기업=단일 선택이지만 소분류를 여는 "경로"
  //  3단계  : 기업 전용 다중 선택 — 최하위 계층
  //
  // state   : 사용자가 지금 만지는 "임시 선택"
  // applied : 실제 목록에 반영된 "확정 조건". 상세 조건(중분류·소분류·채용분야·키워드)은
  //           [선택한 조건으로 검색]을 눌러야 이쪽으로 넘어온다(상세 검색 안에서만 검색 실행).
  var state = { nb: null, nbName: "", sub: [], det: [], kw: "" };
  var applied = { nb: null, nbName: "", sub: [], det: [], kw: "" };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // 검색·표시에 쓸 "가장 하위 단계" 조건만 뽑는다.
  // 하위(소분류/채용분야)를 고르면 상위(대분류)는 그 하위를 포함하는 개념이므로 조건에서 제외한다.
  // → 최하위 기준으로만 검색되어, "상위 대분류까지 함께 검색되는 것처럼" 보이던 문제를 없앤다.
  //   (기업 중분류는 소분류로 내려가는 경로일 뿐이라 조건이 되지 않는다.)
  function condsOf(s) {
    if (s.det.length) return s.det.map(function (x) { return { kind: "det", cd: x.cd, nm: x.nm }; });
    if (!IS_CORP && s.sub.length) return s.sub.map(function (x) { return { kind: "sub", cd: x.cd, nm: x.nm }; });
    if (s.nb) return [{ kind: "nb", cd: s.nb, nm: s.nbName }];
    return [];
  }

  function cloneState(s) {
    return { nb: s.nb, nbName: s.nbName, sub: s.sub.slice(), det: s.det.slice(), kw: s.kw };
  }

  // 현재 선택(state)을 확정(applied)으로 넘기고 결과를 갱신한다.
  // [개발 연동] 실서비스는 여기서 applied 조건으로 목록 API를 호출한다.
  function commit(opts) {
    applied = cloneState(state);
    renderApplied();
    renderResult();
    pulseList();
    if (opts && opts.scroll && jobList) {
      jobList.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // 목록이 새 조건으로 갱신됐음을 짧게 시각적으로 알린다.
  function pulseList() {
    if (!jobList) return;
    jobList.classList.add("is-refreshing");
    setTimeout(function () { jobList.classList.remove("is-refreshing"); }, 180);
  }

  // 공공은 현행 화면이 이미 건수를 노출하므로 그대로 유지한다(추가 집계 없음).
  // 기업은 현행에 건수가 없어 표시하지 않는다.
  function chip(name, code, on, cnt) {
    var suffix = (cnt === undefined || cnt === null) ? "" : ' <em>(' + cnt + ')</em>';
    return '<button type="button" class="chip" data-code="' + esc(code) + '"' +
           ' aria-pressed="' + (on ? "true" : "false") + '">' + esc(name) + suffix + "</button>";
  }

  // 결과 영역 갱신 — 대분류만 선택해도 검색 결과가 나오는 구조.
  // 하위 분류는 결과를 더 좁히는 선택 사항일 뿐 필수가 아니다.
  // [개발 연동] 실서비스는 여기서 목록 API를 호출한다. 프로토타입은 건수·조건 문구만 바꾼다.
  function renderResult() {
    // 결과 문구는 확정(applied) 조건 기준으로 만든다. 계층은 ' > '로 이어 드릴다운 경로를 보여주되,
    // 실제 검색 축은 항상 최하위 단계다(condsOf 참고).
    if (resCond) {
      var path = [SRC_NAME];
      if (applied.nbName) path.push(applied.nbName);
      if (!IS_CORP && applied.sub.length) {
        path.push(applied.sub[0].nm + (applied.sub.length > 1 ? " 외 " + (applied.sub.length - 1) : ""));
      }
      if (applied.det.length) {
        path.push(applied.det[0].nm + (applied.det.length > 1 ? " 외 " + (applied.det.length - 1) : ""));
      }
      var txt = path.join(" > ").replace(SRC_NAME + " > ", SRC_NAME + " · ");
      if (applied.kw) txt += ' · "' + applied.kw + '"';
      resCond.textContent = txt;
    }
    // 공공은 채용분야별 실측 건수가 있어 합산할 수 있다. 기업은 현행에 건수가 없어 그대로 둔다.
    if (resCount && !IS_CORP) {
      var n;
      if (applied.sub.length) {
        n = applied.sub.reduce(function (a, x) {
          var hit = J.pub.filter(function (p) { return p.cd === x.cd; })[0];
          return a + (hit ? hit.cnt : 0);
        }, 0);
      } else if (applied.nb) {
        n = J.pub.filter(function (p) { return p.nb === applied.nb; })
                 .reduce(function (a, p) { return a + p.cnt; }, 0);
      } else {
        n = J.pub.reduce(function (a, p) { return a + p.cnt; }, 0);
      }
      resCount.textContent = n;
    }
  }

  // 선택 조건 칩 — 지금 선택(state) 중 "가장 하위 단계"만 즉시(라이브) 노출한다.
  // (하위를 고르면 상위 대분류는 조건에서 빠지므로, 상·하위가 함께 나열되지 않는다.)
  // 표시는 선택 즉시 반영하되, 목록 결과 자체는 [선택한 조건으로 검색]에서만 갱신한다.
  // × 클릭 시 해당 조건만 해제하고 즉시 재검색한다.
  function renderApplied() {
    if (!appliedBox) return;
    var conds = condsOf(state);
    appliedBox.innerHTML = conds.length
      ? conds.map(function (o) {
          return '<button type="button" class="chip" data-applied="' + o.kind + '" data-acode="' + esc(o.cd) +
                 '" aria-pressed="true">' + esc(o.nm) + " ×</button>";
        }).join("")
      : '<span class="searchbox__applied-empty">선택한 조건이 없습니다.</span>';
  }

  // 2단계 : 선택한 대분류에 매핑된 현행 코드 목록
  function subItems(nb) {
    return IS_CORP
      ? J.corp3.filter(function (c) { return c.nb === nb; })
      : J.pub.filter(function (p) { return p.nb === nb; });
  }

  // 3단계 : 기업채용만 존재 (CMMN_276 5차)
  function renderDetail(code, name) {
    if (!jdBox) return;
    var items = IS_CORP ? (J.corp5[code] || []) : [];
    if (!items.length) {
      jdBox.hidden = true;
      return;
    }
    jdBox.hidden = false;
    if (jdLabel) jdLabel.textContent = name + " 소분류";
    if (jdChips) {
      jdChips.innerHTML = items.map(function (it) { return chip(it[1], it[0], false); }).join("");
    }
    state.det = [];
  }

  function renderSub(nb, nbName) {
    if (!subChips) return;
    var items = subItems(nb);
    if (!items.length) {
      if (subWrap) subWrap.hidden = true;
      if (jdBox) jdBox.hidden = true;
      subChips.innerHTML = "";
      return;
    }
    if (subWrap) subWrap.hidden = false;
    if (subLabel) subLabel.textContent = nbName + " " + LABEL[SOURCE].sub;
    // 하위 분류는 아무것도 선택하지 않은 상태로 연다.
    // 대분류만 골라도 검색이 되고, 중분류·소분류는 결과를 좁히는 선택 사항이다.
    subChips.innerHTML = items.map(function (it) { return chip(it.nm, it.cd, false, it.cnt); }).join("");
    state.sub = [];
    state.det = [];
    if (jdChips) jdChips.innerHTML = "";
    if (jdLabel) jdLabel.textContent = "모집분야 소분류";
    if (jdBox) jdBox.hidden = false;
  }

  // 1단계 : 직무중심 대분류 12 (단일 선택, 재클릭 시 해제)
  if (catGrid) {
    catGrid.addEventListener("click", function (e) {
      var item = e.target.closest(".jobcat__item");
      if (!item) return;
      var wasOn = item.getAttribute("aria-pressed") === "true";
      catGrid.querySelectorAll(".jobcat__item").forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
      });
      if (wasOn) {
        clearAll();
        return;
      }
      item.setAttribute("aria-pressed", "true");
      state.nb = item.getAttribute("data-cat");
      state.nbName = item.querySelector(".jobcat__name").textContent;
      state.sub = [];
      state.det = [];
      renderSub(state.nb, state.nbName);
      // 12개 직무(대분류) 선택은 상세 검색을 거치지 않고 목록에 "즉시" 반영한다.
      commit();
    });
  }

  function chipName(el) {
    return el.textContent.replace(/\s*\(\d+\)\s*$/, "").trim();
  }

  // 2단계 선택 — 상세 검색 안의 선택이므로 즉시 반영하지 않고 임시 선택(state)만 갱신한다.
  if (subChips) {
    subChips.addEventListener("click", function (e) {
      var c = e.target.closest(".chip");
      if (!c) return;
      var cd = c.getAttribute("data-code"), nm = chipName(c);
      if (IS_CORP) {
        // 기업 : 단일 선택 — 선택한 중분류의 소분류를 이어서 보여준다(중분류 자체는 조건이 아님)
        subChips.querySelectorAll(".chip").forEach(function (x) {
          x.setAttribute("aria-pressed", x === c ? "true" : "false");
        });
        state.sub = [{ cd: cd, nm: nm }];
        renderDetail(cd, nm);
      } else {
        // 공공 : 하위 계층이 없으므로 다중 선택(최하위 = 채용분야)
        var on = c.getAttribute("aria-pressed") === "true";
        c.setAttribute("aria-pressed", on ? "false" : "true");
        state.sub = on
          ? state.sub.filter(function (x) { return x.cd !== cd; })
          : state.sub.concat([{ cd: cd, nm: nm }]);
      }
      // 선택 조건 표시는 즉시 반영(라이브). 목록 결과는 [선택한 조건으로 검색]에서 갱신.
      renderApplied();
    });
  }

  // 3단계 선택 (기업 전용, 다중) — 선택 조건 표시는 즉시, 목록 결과는 검색 시.
  if (jdChips) {
    jdChips.addEventListener("click", function (e) {
      var c = e.target.closest(".chip");
      if (!c) return;
      var cd = c.getAttribute("data-code"), nm = chipName(c);
      var on = c.getAttribute("aria-pressed") === "true";
      c.setAttribute("aria-pressed", on ? "false" : "true");
      state.det = on
        ? state.det.filter(function (x) { return x.cd !== cd; })
        : state.det.concat([{ cd: cd, nm: nm }]);
      // 선택 조건 표시는 즉시 반영(라이브). 목록 결과는 [선택한 조건으로 검색]에서 갱신.
      renderApplied();
    });
  }

  // 선택 조건 칩의 × — 해당 조건만 해제한다
  if (appliedBox) {
    appliedBox.addEventListener("click", function (e) {
      var c = e.target.closest("[data-applied]");
      if (!c) return;
      var kind = c.getAttribute("data-applied"), cd = c.getAttribute("data-acode");
      if (kind === "nb") { clearAll(); return; }
      if (kind === "sub") {
        state.sub = state.sub.filter(function (x) { return x.cd !== cd; });
        if (subChips) {
          var t = subChips.querySelector('.chip[data-code="' + cd + '"]');
          if (t) t.setAttribute("aria-pressed", "false");
        }
        if (IS_CORP && jdBox) { jdBox.hidden = true; state.det = []; }
      } else {
        state.det = state.det.filter(function (x) { return x.cd !== cd; });
        if (jdChips) {
          var d = jdChips.querySelector('.chip[data-code="' + cd + '"]');
          if (d) d.setAttribute("aria-pressed", "false");
        }
      }
      // 선택 조건에서 직접 지우면 즉시 반영한다.
      commit();
    });
  }

  // 선택 전체 해제
  function clearAll(closeBox) {
    if (catGrid) {
      catGrid.querySelectorAll(".jobcat__item").forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
      });
    }
    state = { nb: null, nbName: "", sub: [], det: [], kw: "" };
    if (kwInput) kwInput.value = "";
    if (subChips) subChips.innerHTML = "";
    if (jdChips) jdChips.innerHTML = "";
    if (subWrap) subWrap.hidden = true;
    if (jdBox) jdBox.hidden = true;
    commit();
    if (closeBox) openSearch(false);
  }

  // 상세 검색 열고 닫기 (기본 닫힘)
  function openSearch(on) {
    if (!searchBox || !searchToggle) return;
    searchBox.hidden = !on;
    searchToggle.setAttribute("aria-expanded", on ? "true" : "false");
  }
  if (searchToggle) {
    searchToggle.addEventListener("click", function () {
      openSearch(searchToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  // 키워드 : 상세 조건이므로 즉시 반영하지 않고 [검색] 또는 Enter 시 반영한다.
  if (kwInput) {
    kwInput.addEventListener("input", function () { state.kw = kwInput.value.trim(); });
    kwInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); commit({ scroll: true }); }
    });
  }

  // [선택한 조건으로 검색] — 상세 검색 안의 조건(중분류·소분류·채용분야·키워드)을 목록에 반영한다.
  // 검색 실행은 이 버튼(상세 검색 내부)에서만 일어난다.
  if (runBtn) {
    runBtn.addEventListener("click", function () { commit({ scroll: true }); });
  }

  // 결과 정렬 탭 (신규 / 인기 / 마감임박)
  // [개발 연동] 탭 전환 = 목록 API의 정렬 파라미터 변경. 프로토타입은 상태만 바꾼다.
  var sortTabs = document.querySelector(".sorttabs");
  if (sortTabs) {
    sortTabs.addEventListener("click", function (e) {
      var t = e.target.closest(".sorttabs__item");
      if (!t) return;
      sortTabs.querySelectorAll(".sorttabs__item").forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
      });
    });
  }

  // 공고 더보기 — 프로토타입에서는 다음 6건을 한 번에 노출한다.
  var jobListMore = document.querySelector("[data-joblist-more]");
  if (jobListMore && jobList) {
    jobListMore.addEventListener("click", function () {
      var hiddenCards = jobList.querySelectorAll(".jobcard--more[hidden]");
      hiddenCards.forEach(function (card) { card.hidden = false; });
      var shown = document.querySelector("[data-joblist-shown]");
      if (shown) shown.textContent = jobList.querySelectorAll(".jobcard:not([hidden])").length;
      jobListMore.disabled = true;
      jobListMore.setAttribute("aria-label", "현재 준비된 공고를 모두 표시했습니다");
    });
  }

  var resetBtn = document.querySelector("[data-reset]");
  if (resetBtn) resetBtn.addEventListener("click", function () { clearAll(true); });

  if (jdSrc) jdSrc.textContent = IS_CORP ? "※ " + LABEL[SOURCE].note : "";

  // 초기 진입 : 마크업에 선택된 대분류가 있으면 그 기준으로 렌더하고 즉시 반영한다
  var initial = catGrid && catGrid.querySelector('.jobcat__item[aria-pressed="true"]');
  if (initial) {
    state.nb = initial.getAttribute("data-cat");
    state.nbName = initial.querySelector(".jobcat__name").textContent;
    renderSub(state.nb, state.nbName);
  }
  commit();
})();
