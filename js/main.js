/**
 * COSTREE - 메인 스크립트
 * js/main.js
 */

(function () {
  'use strict';

  /* -------------------------------------------------------
     상품 그리드 렌더링 (data.js의 COSTREE_PRODUCTS 사용)
  ------------------------------------------------------- */
  var PAGE_SIZE = 8;
  var currentPage = 0;

  function renderProducts(products, append) {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (!append) grid.innerHTML = '';

    var start = currentPage * PAGE_SIZE;
    var slice = products.slice(start, start + PAGE_SIZE);

    slice.forEach(function (p) {
      var card = document.createElement('div');
      card.className = 'product-card';
      var iconHtml = p.categoryIcon
        ? '<img src="' + p.categoryIcon + '" alt="" onerror="this.style.display=\'none\'">'
        : '';
      card.innerHTML =
        '<a href="shopping/product.html?id=' + p.id + '">' +
          '<div class="product-img-wrap">' +
            '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy"' +
            ' onerror="this.style.background=\'#e8f5e9\'">' +
          '</div>' +
        '</a>' +
        '<div class="product-info">' +
          '<div class="product-name">' + p.name + '</div>' +
          '<div class="product-desc">' + (p.description || '') + '</div>' +
          '<div class="category-badge">' + iconHtml +
            '<span>' + (p.category || '') + '</span>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });

    // 더 보기 버튼 표시 여부
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      var hasMore = (currentPage + 1) * PAGE_SIZE < products.length;
      loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
    }
  }

  function initProducts() {
    if (typeof COSTREE_PRODUCTS === 'undefined') return;
    renderProducts(COSTREE_PRODUCTS, false);

    var loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        currentPage++;
        renderProducts(COSTREE_PRODUCTS, true);
      });
    }
  }

  /* -------------------------------------------------------
     장바구니 이벤트 (이벤트 위임)
  ------------------------------------------------------- */
  function initCart() {
    var grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn-cart');
      if (!btn) return;
      var id = btn.dataset.id;
      var product = (COSTREE_PRODUCTS || []).find(function (p) { return String(p.id) === String(id); });
      if (product) {
        // 실제 장바구니 연동 전 임시 피드백
        btn.textContent = '담겼습니다!';
        btn.style.background = '#1B5E20';
        setTimeout(function () {
          btn.innerHTML = '<i class="fas fa-shopping-cart"></i> 장바구니 담기';
          btn.style.background = '';
        }, 1500);
      }
    });
  }

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
     검색 폼
  ------------------------------------------------------- */
  function initSearch() {
    var form = document.getElementById('frmSearch');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = form.querySelector('input[name="q"]').value.trim();
      if (q) {
        // 현재 경로에서 shopping/list.html 상대 경로 계산
        var base = window.location.pathname;
        var listPath;
        if (base.indexOf('/shopping/') !== -1) {
          listPath = 'list.html';
        } else if (base === '/' || base.endsWith('/index.html')) {
          listPath = 'shopping/list.html';
        } else {
          listPath = '../shopping/list.html';
        }
        window.location.href = listPath + '?q=' + encodeURIComponent(q);
      }
    });
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
    initProducts();
    initCart();
    initHeroSlider();
    initMegaMenu();
    initCategory();
    initSearch();
    initScrollTop();
  });

})();
