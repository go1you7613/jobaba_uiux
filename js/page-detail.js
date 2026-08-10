/* 기업채용 상세: 스티키 앵커 탭 및 스크롤 위치 동기화 */
(function(){
  "use strict";

  function initAnchorNavigation(root){
    var nav = root.querySelector("[data-detail-anchor-nav]");
    if(!nav) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var entries = links.map(function(link){
      var id = link.getAttribute("href").slice(1);
      return { link: link, target: document.getElementById(id) };
    }).filter(function(entry){ return entry.target; });
    if(!entries.length) return;

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ticking = false;
    var activeId = "";

    function activate(id){
      if(activeId === id) return;
      activeId = id;
      entries.forEach(function(entry){
        if(entry.target.id === id){
          entry.link.setAttribute("aria-current", "true");
        }else{
          entry.link.removeAttribute("aria-current");
        }
      });
    }

    function updateFromScroll(){
      var marker = nav.offsetHeight + 24;
      var current = entries[0];

      entries.forEach(function(entry){
        if(entry.target.getBoundingClientRect().top <= marker){
          current = entry;
        }
      });

      if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4){
        current = entries[entries.length - 1];
      }
      activate(current.target.id);
      ticking = false;
    }

    links.forEach(function(link){
      link.addEventListener("click", function(event){
        var id = link.getAttribute("href").slice(1);
        var target = document.getElementById(id);
        if(!target) return;

        event.preventDefault();
        target.scrollIntoView({behavior: reducedMotion ? "auto" : "smooth", block: "start"});
        activate(id);
        if(window.history && window.history.replaceState){
          window.history.replaceState(null, "", "#" + id);
        }
      });
    });

    window.addEventListener("scroll", function(){
      if(ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateFromScroll);
    }, {passive:true});
    window.addEventListener("resize", updateFromScroll);
    updateFromScroll();
  }

  document.addEventListener("DOMContentLoaded", function(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-detail-anchor-root]"), initAnchorNavigation);
  });
})();
