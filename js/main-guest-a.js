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

  function setupRecentSearch(){
    var form = document.querySelector("[data-recent-search-form]");
    var input = document.querySelector("[data-recent-search-input]");
    var recent = document.querySelector("[data-recent-searches]");
    var list = document.querySelector("[data-recent-search-list]");
    var cookieName = "jobabaRecentSearches";
    var maxItems = 3;
    var maxAge = 60 * 60 * 24 * 365;
    var items;

    if(!form || !input || !recent || !list) return;

    function readCookie(){
      var prefix = cookieName + "=";
      var cookie = document.cookie.split("; ").find(function(item){
        return item.indexOf(prefix) === 0;
      });

      if(!cookie) return [];
      try{
        var value = JSON.parse(decodeURIComponent(cookie.slice(prefix.length)));
        return Array.isArray(value) ? value.filter(function(item){ return typeof item === "string"; }).slice(0, maxItems) : [];
      }catch(error){
        return [];
      }
    }

    function writeCookie(){
      document.cookie = cookieName + "=" + encodeURIComponent(JSON.stringify(items)) + "; Max-Age=" + maxAge + "; Path=/; SameSite=Lax";
    }

    function render(){
      list.textContent = "";
      items.forEach(function(keyword){
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = keyword;
        button.title = keyword;
        button.addEventListener("click", function(){
          input.value = keyword;
          save(keyword);
          input.focus();
        });
        list.appendChild(button);
      });
      recent.hidden = items.length === 0;
    }

    function save(value){
      var keyword = value.trim().slice(0, 80);
      var normalized = keyword.toLocaleLowerCase("ko-KR");

      if(!keyword) return;
      items = [keyword].concat(items.filter(function(item){
        return item.toLocaleLowerCase("ko-KR") !== normalized;
      })).slice(0, maxItems);
      writeCookie();
      render();
    }

    items = readCookie();
    render();
    form.addEventListener("submit", function(event){
      event.preventDefault();
      save(input.value);
    });
  }

  function setupAffiliateSlider(root){
    var track = root.querySelector("[data-affiliate-track]");
    var previous = root.querySelector("[data-affiliate-prev]");
    var next = root.querySelector("[data-affiliate-next]");
    var behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

    if(!track || !previous || !next) return;
    previous.addEventListener("click", function(){
      track.scrollBy({ left: -330, behavior: behavior });
    });
    next.addEventListener("click", function(){
      track.scrollBy({ left: 330, behavior: behavior });
    });
  }

  function setupMobileMenu(){
    var header = document.querySelector(".header");
    var headerInner = header ? header.querySelector(".header__inner") : null;
    var desktopNav = headerInner ? headerInner.querySelector(".gnb") : null;
    var searchButton = headerInner ? headerInner.querySelector(".header__search-icon") : null;
    var returnFocus = null;

    if(!header || !headerInner || !desktopNav || headerInner.querySelector("[data-mobile-menu-toggle]")) return;

    var toggle = document.createElement("button");
    toggle.className = "header__menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "전체 메뉴 열기");
    toggle.setAttribute("aria-controls", "mobile-menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("data-mobile-menu-toggle", "");
    toggle.innerHTML = '<i data-lucide="menu" aria-hidden="true"></i>';
    headerInner.insertBefore(toggle, searchButton ? searchButton.nextSibling : null);

    var menu = document.createElement("div");
    menu.className = "mobile-menu";
    menu.id = "mobile-menu";
    menu.hidden = true;
    menu.innerHTML =
      '<div class="mobile-menu__backdrop" data-mobile-menu-close></div>'+
      '<section class="mobile-menu__panel" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" tabindex="-1">'+
        '<div class="mobile-menu__head">'+
          '<h2 id="mobile-menu-title">전체 메뉴</h2>'+
          '<button type="button" class="mobile-menu__close" data-mobile-menu-close aria-label="전체 메뉴 닫기">'+
            '<i data-lucide="x" aria-hidden="true"></i>'+
          '</button>'+
        '</div>'+
        '<div class="mobile-menu__body"></div>'+
      '</section>';

    var body = menu.querySelector(".mobile-menu__body");
    var mobileNav = desktopNav.cloneNode(true);
    var utilityLeft = document.querySelector(".utilbar__left");
    var utilityRight = document.querySelector(".utilbar__right");
    mobileNav.className = "mobile-menu__nav";
    mobileNav.setAttribute("aria-label", "모바일 전체 메뉴");
    [].forEach.call(mobileNav.querySelectorAll(".gnb__unit"), function(unit){
      var top = [].slice.call(unit.children).find(function(child){
        return child.classList.contains("gnb__item");
      });
      if(top && unit.firstElementChild !== top) unit.insertBefore(top, unit.firstElementChild);
    });
    body.appendChild(mobileNav);

    if(utilityLeft){
      var shortcuts = utilityLeft.cloneNode(true);
      shortcuts.className = "mobile-menu__shortcuts";
      body.appendChild(shortcuts);
    }
    if(utilityRight){
      var account = utilityRight.cloneNode(true);
      account.className = "mobile-menu__account";
      body.appendChild(account);
    }
    document.body.appendChild(menu);

    var panel = menu.querySelector(".mobile-menu__panel");

    function open(){
      returnFocus = document.activeElement;
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "전체 메뉴 닫기");
      document.body.classList.add("is-mobile-menu-open");
      panel.focus();
    }

    function close(restoreFocus){
      if(menu.hidden) return;
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "전체 메뉴 열기");
      document.body.classList.remove("is-mobile-menu-open");
      if(restoreFocus !== false && returnFocus && document.contains(returnFocus)) returnFocus.focus();
      returnFocus = null;
    }

    toggle.addEventListener("click", function(){
      if(menu.hidden) open();
      else close();
    });
    menu.addEventListener("click", function(event){
      if(event.target.closest("[data-mobile-menu-close]") || event.target.closest("a[href]")) close();
    });
    document.addEventListener("keydown", function(event){
      if(menu.hidden) return;
      if(event.key === "Escape"){
        event.preventDefault();
        close();
        return;
      }
      if(event.key !== "Tab") return;

      var focusable = [].slice.call(panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if(!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if(event.shiftKey && document.activeElement === first){
        event.preventDefault();
        last.focus();
      }else if(!event.shiftKey && document.activeElement === last){
        event.preventDefault();
        first.focus();
      }
    });

    var mobileQuery = window.matchMedia("(max-width: 768px)");
    function closeOnDesktop(event){ if(!event.matches) close(false); }
    if(mobileQuery.addEventListener) mobileQuery.addEventListener("change", closeOnDesktop);
    else mobileQuery.addListener(closeOnDesktop);

    if(window.lucide) window.lucide.createIcons();
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
    [].forEach.call(document.querySelectorAll("[data-affiliate-slider]"), setupAffiliateSlider);
    setupMobileMenu();
    setupRecentSearch();
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
