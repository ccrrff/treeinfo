/**
 * COSTREE - 메인 스크립트
 * js/main.js
 */

(function () {
  'use strict';

  /* -------------------------------------------------------
     상품 그리드 - Supabase에서 로드 (index.html 인라인 스크립트에서 처리)
  ------------------------------------------------------- */

  /* -------------------------------------------------------
     히어로 슬라이더 자동 재생
  ------------------------------------------------------- */
  function initHeroSlider() {
    var slides = document.querySelectorAll('.hero-slide');
    var dots   = document.querySelectorAll('.hero-dot');
    if (!slides.length) return;

    var current = 0;
    var timer;

    function goTo(idx) {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function startAuto() {
      timer = setInterval(function () { goTo(current + 1); }, 5000);
    }

    function resetAuto() {
      clearInterval(timer);
      startAuto();
    }

    var prevBtn = document.getElementById('heroPrev');
    var nextBtn = document.getElementById('heroNext');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(current - 1); resetAuto();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(current + 1); resetAuto();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(this.dataset.index, 10)); resetAuto();
      });
    });

    startAuto();
  }

  /* -------------------------------------------------------
     메가메뉴 토글
  ------------------------------------------------------- */
  function initMegaMenu() {
    var megaMenu    = document.getElementById('megaMenu');
    if (!megaMenu) return;

    // 외부 클릭 시 닫기
    document.addEventListener('click', function (e) {
      if (megaMenu.hidden) return;
      var clickedInside = megaMenu.contains(e.target);
      if (!clickedInside) {
        megaMenu.hidden = true;
        megaMenu.style.display = '';
      }
    });
  }

  /* -------------------------------------------------------
     카테고리 필터 (클릭 시 active 클래스)
  ------------------------------------------------------- */
  function initCategory() {
    var items = document.querySelectorAll('.category-item');
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        items.forEach(function (i) { i.style.borderColor = ''; });
        this.style.borderColor = '#2E7D32';
      });
    });
  }

  /* -------------------------------------------------------
     검색 경로 계산
  ------------------------------------------------------- */
  function getSearchPath() {
    var base = window.location.pathname;
    if (base.indexOf('/shopping/') !== -1) {
      return 'list.html';
    } else if (base === '/' || base.endsWith('/index.html')) {
      return 'shopping/list.html';
    } else {
      return '../shopping/list.html';
    }
  }

  function handleSearchSubmit(form) {
    var q = form.querySelector('input[name="q"]').value.trim();
    if (q) {
      window.location.href = getSearchPath() + '?q=' + encodeURIComponent(q);
    }
  }

  /* -------------------------------------------------------
     검색 폼
  ------------------------------------------------------- */
  function initSearch() {
    var form = document.getElementById('frmSearch');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleSearchSubmit(form);
      });
    }

    // 모바일 검색 모달
    var modal = document.getElementById('searchModal');
    var openBtn = document.getElementById('mobileSearchBtn');
    var closeBtn = document.getElementById('searchModalClose');
    var overlay = modal ? modal.querySelector('.search-modal-overlay') : null;
    var modalForm = document.getElementById('frmSearchModal');

    if (!modal || !openBtn) return;

    function openModal() {
      modal.hidden = false;
      var input = modalForm ? modalForm.querySelector('input[name="q"]') : null;
      if (input) setTimeout(function () { input.focus(); }, 100);
    }

    function closeModal() {
      modal.hidden = true;
    }

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    if (modalForm) {
      modalForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handleSearchSubmit(modalForm);
      });
    }
  }

  /* -------------------------------------------------------
     스크롤 투 탑 버튼
  ------------------------------------------------------- */
  function initScrollTop() {
    var btn = document.getElementById('scrollTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------------------------------------------------------
     DOMContentLoaded
  ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeroSlider();
    initMegaMenu();
    initCategory();
    initSearch();
    initScrollTop();
  });

})();
