(function(){
  function setupSlider(root){
    var slides = [].slice.call(root.querySelectorAll("[data-slider-slide]"));
    var previous = root.querySelector("[data-slider-prev]");
    var next = root.querySelector("[data-slider-next]");
    var toggle = root.querySelector("[data-slider-toggle]");
    var status = root.querySelector("[data-slider-status]");
    var index = 0;
    var userPaused = false;

    if(slides.length < 2) return null;

    function show(target){
      index = (target + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex){
        var active = slideIndex === index;
        slide.hidden = !active;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        slide.setAttribute("tabindex", active ? "0" : "-1");
      });
      if(status) status.textContent = (index + 1) + " / " + slides.length;
    }

    function advance(){
      if(userPaused) return false;
      show(index + 1);
      return true;
    }

    if(previous) previous.addEventListener("click", function(){ show(index - 1); });
    if(next) next.addEventListener("click", function(){ show(index + 1); });
    if(toggle) toggle.addEventListener("click", function(){
      userPaused = !userPaused;
      toggle.textContent = userPaused ? "재생" : "정지";
      toggle.setAttribute("aria-label", root.getAttribute("aria-label") + (userPaused ? " 자동 전환 재생" : " 자동 전환 정지"));
    });

    show(0);
    return { advance: advance };
  }

  function setupJourneyTabs(root){
    var tabs = [].slice.call(root.querySelectorAll("[data-journey-tab]"));
    var panels = [].slice.call(root.querySelectorAll("[data-journey-panel]"));

    function activate(tab, moveFocus){
      var panelId = tab.getAttribute("aria-controls");

      tabs.forEach(function(item){
        var active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", active ? "true" : "false");
        item.setAttribute("tabindex", active ? "0" : "-1");
      });
      panels.forEach(function(panel){
        var active = panel.id === panelId;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
        panel.setAttribute("aria-hidden", active ? "false" : "true");
      });
      if(moveFocus) tab.focus();
    }

    tabs.forEach(function(tab, tabIndex){
      tab.addEventListener("click", function(){ activate(tab, false); });
      tab.addEventListener("keydown", function(event){
        var targetIndex = tabIndex;

        if(event.key === "ArrowRight") targetIndex = (tabIndex + 1) % tabs.length;
        else if(event.key === "ArrowLeft") targetIndex = (tabIndex - 1 + tabs.length) % tabs.length;
        else if(event.key === "Home") targetIndex = 0;
        else if(event.key === "End") targetIndex = tabs.length - 1;
        else return;

        event.preventDefault();
        activate(tabs[targetIndex], true);
      });
    });

    if(tabs.length) activate(tabs[0], false);
  }

  function setupScrollReveals(){
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var targets = [];

    function addTarget(element, delay){
      if(!element || targets.indexOf(element) !== -1) return;
      element.setAttribute("data-scroll-reveal", "");
      element.style.setProperty("--reveal-delay", delay + "ms");
      targets.push(element);
    }

    function addGroup(rootSelector, itemSelector, startDelay, stagger){
      [].forEach.call(document.querySelectorAll(rootSelector), function(root){
        [].forEach.call(root.querySelectorAll(itemSelector), function(item, index){
          addTarget(item, startDelay + (index * stagger));
        });
      });
    }

    addGroup(".journey-section", ".section-title-row", 0, 0);
    addGroup(".journey-section", ".journey-tabs", 70, 0);
    addGroup(".journey-grid", ":scope > a", 130, 80);

    addGroup(".resource-section", ".section-title-row", 0, 0);
    addGroup(".resource-grid", ":scope > .resource-banner, :scope > .resource-education", 90, 90);

    addGroup(".exhibition-section", ".section-title-row", 0, 0);
    addGroup(".exhibition-layout", ":scope > .exhibition-feature, :scope > .exhibition-carousel", 90, 100);

    addGroup(".coach-section", ".coach-title", 0, 0);
    addGroup(".coach-grid", ":scope > a", 90, 70);

    if(reducedMotion || !("IntersectionObserver" in window)){
      targets.forEach(function(target){ target.classList.add("is-revealed"); });
      return;
    }

    document.documentElement.classList.add("scroll-reveal-ready");
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, {
      threshold:0.12,
      rootMargin:"0px 0px -8% 0px"
    });

    targets.forEach(function(target){ observer.observe(target); });
  }

  document.addEventListener("DOMContentLoaded", function(){
    var sequence = document.querySelector("[data-slider-sequence]");
    var roots = sequence ? [].slice.call(sequence.querySelectorAll("[data-slider]")) : [];
    var standaloneRoots = [].slice.call(document.querySelectorAll("[data-slider]")).filter(function(root){
      return !sequence || !sequence.contains(root);
    });
    var interval = sequence ? Number(sequence.getAttribute("data-rotation-interval")) || 3000 : 3000;
    var stagger = sequence ? Number(sequence.getAttribute("data-rotation-stagger")) || 300 : 300;
    var sliders;

    roots.sort(function(a, b){
      return Number(a.getAttribute("data-slider-order")) - Number(b.getAttribute("data-slider-order"));
    });
    sliders = roots.map(setupSlider).filter(Boolean);

    if(sliders.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      window.setInterval(function(){
        sliders.forEach(function(slider, sliderIndex){
          window.setTimeout(function(){ slider.advance(); }, sliderIndex * stagger);
        });
      }, interval);
    }

    standaloneRoots.forEach(function(root){
      var slider = setupSlider(root);
      var autoplayInterval = Number(root.getAttribute("data-autoplay-interval"));

      if(slider && autoplayInterval && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
        window.setInterval(function(){ slider.advance(); }, autoplayInterval);
      }
    });

    [].forEach.call(document.querySelectorAll("[data-journey-tabs]"), setupJourneyTabs);
    setupScrollReveals();
    setupProtoDestInfo();
  });

  /* ---- 이동 대상 안내 패널(프로토타입 전용) ----
     실서비스 화면이 없는 여정 카드를 클릭하면 같은 자리에 안내 패널을 띄운다.
     닫기 버튼 또는 Esc로 닫으며, 포커스는 원래 카드로 되돌린다.
     퍼블리싱 확정 시 이 블록과 .journey-info 마크업을 함께 제거한다. */
  function setupProtoDestInfo(){
    function close(panel){
      if(!panel || panel.hidden) return;
      var card = document.querySelector('[data-proto-open="' + panel.id + '"]');
      panel.hidden = true;
      if(card){ card.hidden = false; card.focus(); }
    }
    function closeAll(){
      [].forEach.call(document.querySelectorAll(".journey-info"), close);
    }

    document.addEventListener("click", function(e){
      var opener = e.target.closest("[data-proto-open]");
      if(opener){
        var panel = document.getElementById(opener.getAttribute("data-proto-open"));
        if(!panel) return;
        closeAll();
        opener.hidden = true;
        panel.hidden = false;
        var closeBtn = panel.querySelector("[data-proto-close]");
        if(closeBtn) closeBtn.focus();
        if(window.lucide) lucide.createIcons();
        return;
      }
      var closer = e.target.closest("[data-proto-close]");
      if(closer) close(closer.closest(".journey-info"));
    });

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeAll();
    });
  }
})();
