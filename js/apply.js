(function () {
  "use strict";

  var carousel = document.querySelector("[data-apply-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-slide]"));
    var status = carousel.querySelector(".ap-carousel__status");
    var toggle = carousel.querySelector("[data-carousel-toggle]");
    var index = 0;
    var playing = true;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.hidden = i !== index;
        slide.classList.toggle("is-active", i === index);
      });
      if (status) status.textContent = (index + 1) + " / " + slides.length;
      if (window.lucide) window.lucide.createIcons();
    }

    function restart() {
      window.clearInterval(timer);
      if (playing) timer = window.setInterval(function () { show(index + 1); }, 5000);
    }

    carousel.querySelector("[data-carousel-prev]").addEventListener("click", function () {
      show(index - 1);
      restart();
    });
    carousel.querySelector("[data-carousel-next]").addEventListener("click", function () {
      show(index + 1);
      restart();
    });
    toggle.addEventListener("click", function () {
      playing = !playing;
      toggle.setAttribute("aria-label", playing ? "자동 전환 정지" : "자동 전환 시작");
      toggle.innerHTML = '<i data-lucide="' + (playing ? "pause" : "play") + '"></i>';
      restart();
      if (window.lucide) window.lucide.createIcons();
    });
    restart();
  }

  var detailToggle = document.querySelector("[data-detail-toggle]");
  var detailPanel = document.getElementById("apply-detail-filter");
  var selectedBox = document.querySelector("[data-apply-selected]");
  var resultCount = document.querySelector("[data-apply-count]");
  var empty = document.querySelector("[data-apply-empty]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-apply-card]"));

  if (detailToggle && detailPanel) {
    detailToggle.addEventListener("click", function () {
      var nextOpen = detailToggle.getAttribute("aria-expanded") !== "true";
      detailToggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      // 패널 표시 상태만 전환한다. 체크박스의 현재 선택값은 유지한다.
      detailPanel.hidden = !nextOpen;
      detailToggle.innerHTML = '<span data-detail-toggle-label>상세 검색 ' + (nextOpen ? "닫기" : "열기") + '</span><i data-lucide="chevron-' + (nextOpen ? "up" : "down") + '" aria-hidden="true"></i>';
      if (window.lucide) window.lucide.createIcons();
    });
  }

  function checkedValues(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector + " input[type=checkbox]:not([data-apply-select-all]):checked")).map(function (input) {
      return input.value || input.parentNode.textContent.trim();
    });
  }

  function filterInputs(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector + " input[type=checkbox]:not([data-apply-select-all])"));
  }

  function syncSelectAll(group) {
    var selectAll = group.querySelector("[data-apply-select-all]");
    var inputs = Array.prototype.slice.call(group.querySelectorAll('input[type="checkbox"]:not([data-apply-select-all])'));
    var checkedCount = inputs.filter(function (input) { return input.checked; }).length;
    if (!selectAll) return;
    selectAll.checked = checkedCount === inputs.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < inputs.length;
  }

  function renderSelection() {
    var regions = checkedValues("#apply-region-filter");
    var types = checkedValues("#apply-type-filter");
    if (!selectedBox) return;
    var allRegions = regions.length === filterInputs("#apply-region-filter").length;
    var allTypes = types.length === filterInputs("#apply-type-filter").length;
    var values = (allRegions ? [] : regions).concat(allTypes ? [] : types);
    if (!regions.length) values.push("지역 미선택");
    if (!types.length) values.push("사업유형 미선택");
    selectedBox.innerHTML = values.length
      ? '<span class="ap-selected__label">선택 조건</span>' + values.map(function (value) {
          return '<span class="chip" aria-pressed="true">' + value.replace(/[&<>"']/g, "") + '</span>';
        }).join("") + '<button type="button" class="ap-selected__reset" data-apply-reset>전체 초기화</button>'
      : '<span class="small muted">전체 지역·사업유형을 대상으로 검색합니다.</span>';
  }

  function applyFilters() {
    var regions = checkedValues("#apply-region-filter");
    var types = checkedValues("#apply-type-filter");
    var visible = 0;
    cards.forEach(function (card) {
      var regionMatch = regions.indexOf(card.getAttribute("data-region")) !== -1;
      var typeMatch = types.indexOf(card.getAttribute("data-type")) !== -1;
      card.hidden = !(regionMatch && typeMatch);
      if (!card.hidden) visible += 1;
    });
    if (resultCount) resultCount.textContent = visible;
    if (empty) empty.hidden = visible !== 0;
    renderSelection();
  }

  function resetFilters() {
    document.querySelectorAll("#apply-region-filter input[type=checkbox], #apply-type-filter input[type=checkbox]").forEach(function (input) {
      input.checked = true;
      input.indeterminate = false;
    });
    applyFilters();
  }

  document.querySelectorAll("[data-apply-select-all]").forEach(function (selectAll) {
    selectAll.addEventListener("change", function () {
      var group = selectAll.closest("[data-filter-group]");
      if (!group) return;
      group.querySelectorAll('input[type="checkbox"]:not([data-apply-select-all])').forEach(function (input) {
        input.checked = selectAll.checked;
      });
      selectAll.indeterminate = false;
      applyFilters();
    });
  });
  document.querySelectorAll("#apply-region-filter input[type=checkbox]:not([data-apply-select-all]), #apply-type-filter input[type=checkbox]:not([data-apply-select-all])").forEach(function (input) {
    input.addEventListener("change", function () {
      var group = input.closest("[data-filter-group]");
      if (group) syncSelectAll(group);
      applyFilters();
    });
  });
  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-apply-reset]")) resetFilters();
  });
  applyFilters();
})();
