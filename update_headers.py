import os
import re

base_dir = r"\\wsl$\Ubuntu\home\guseejrdl\koesprojects\treeinfo"

new_header_template = """<!-- ===========================
     [1] TOP BAR & HEADER (Premium Glassmorphism)
     =========================== -->
<header id="mainHeader" class="premium-header sticky-top">
  <!-- 유틸리티 바 -->
  <div class="header-top-utill">
    <div class="utill-inner">
      <a href="{prefix}index.html">HOME</a>
      <a href="{prefix}login/login.html">로그인</a>
      <a href="{prefix}member/join.html">회원가입</a>
      <a href="{prefix}mypage/default.html">마이페이지</a>
      <a href="{prefix}about/company.html">회사소개</a>
    </div>
  </div>
  
  <!-- 메인 네비게이션 -->
  <div class="header-inner">
    <!-- 모바일 햄버거 -->
    <button id="mobileMenu" aria-label="메뉴 열기" class="mobile-only">
      <i class="fas fa-bars"></i>
    </button>

    <!-- 로고 -->
    <a class="navbar-brand logo" href="{prefix}index.html">
      <svg class="logo-svg" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="22" fill="#F4F7F5"/>
        <path d="M22 8 C12 8, 8 18, 14 26 C18 31, 22 34, 22 34 C22 34, 26 31, 30 26 C36 18, 32 8, 22 8Z" fill="#1B5E20"/>
        <path d="M22 34 L22 20" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 24 L17 19" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M22 28 L27 23" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <span class="logo-text">
        <span class="logo-main">COSTREE</span>
      </span>
    </a>

    <!-- GNB (데스크탑) -->
    <nav class="gnb-menu d-none d-md-flex">
      <a href="{prefix}shopping/list.html?cat=과수/유실수">과수/유실수</a>
      <a href="{prefix}shopping/list.html?cat=관상수/조경수">관상수/조경수</a>
      <a href="{prefix}shopping/list.html?cat=특용수/약용수">특용수/약용수</a>
      <a href="{prefix}shopping/list.html?cat=야생화/다육/수생">초화/다육</a>
      <a href="{prefix}shopping/list.html?cat=원예/조경/정원용품">정원/조경용품</a>
    </nav>

    <!-- 우측 액션 -->
    <div class="header-actions">
      <!-- 미니멀 검색 -->
      <form id="frmSearch" class="minimal-search">
        <input type="text" name="q" placeholder="검색..." autocomplete="off">
        <button type="submit" aria-label="검색"><i class="fas fa-search"></i></button>
      </form>
      <!-- 장바구니 -->
      <a href="{prefix}shopping/list.html" class="action-icon" aria-label="장바구니"><i class="fas fa-shopping-bag"></i></a>
      <!-- 메가메뉴 열기 -->
      <button id="allMenuBtn" class="action-icon" aria-label="전체메뉴">
        <i class="fas fa-align-right"></i>
      </button>
    </div>
  </div>
</header>

<!-- ===========================
     [2] 메가메뉴 (Overlay)
     =========================== -->
<nav id="megaMenu" class="premium-mega-menu" hidden>
  <div class="mega-inner">
    <div class="mega-col">
      <h3>ABOUT COSTREE</h3>
      <ul>
        <li><a href="{prefix}about/greeting.html">인사말</a></li>
        <li><a href="{prefix}about/company.html">코스트리 소개</a></li>
      </ul>
      <br>
      <h3>CS CENTER</h3>
      <ul>
        <li><a href="{prefix}customer/guide.html">이용안내</a></li>
        <li><a href="{prefix}customer/faq.html">자주 묻는 질문</a></li>
      </ul>
    </div>
    <div class="mega-col">
      <h3>SHOPPING</h3>
      <ul>
        <li><a href="{prefix}shopping/list.html?cat=과수/유실수">과수/유실수</a></li>
        <li><a href="{prefix}shopping/list.html?cat=관상수/조경수">관상수/조경수</a></li>
        <li><a href="{prefix}shopping/list.html?cat=특용수/약용수">특용수/약용수</a></li>
        <li><a href="{prefix}shopping/list.html?cat=야생화/다육/수생">초화/다육/수생</a></li>
        <li><a href="{prefix}shopping/list.html?cat=구근/씨앗/모종">구근/씨앗/모종</a></li>
        <li><a href="{prefix}shopping/list.html?cat=원예/조경/정원용품">원예/조경/정원용품</a></li>
        <li><a href="{prefix}shopping/list.html?cat=기타상품">기타 상품</a></li>
      </ul>
    </div>
    <div class="mega-col">
      <h3>MY PAGE</h3>
      <ul>
        <li><a href="{prefix}mypage/default.html">나의 정보 수정</a></li>
        <li><a href="{prefix}mypage/default.html">비밀번호 변경</a></li>
        <li><a href="{prefix}mypage/orders.html">주문배송조회</a></li>
      </ul>
    </div>
    <div class="mega-col">
      <h3>MEMBER SHIP</h3>
      <ul>
        <li><a href="{prefix}member/join.html">회원 가입</a></li>
        <li><a href="{prefix}member/terms.html">이용약관</a></li>
        <li><a href="{prefix}member/privacy.html">개인정보 보호정책</a></li>
      </ul>
    </div>
  </div>
</nav>"""

html_files = []
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith('.html'):
            html_files.append(os.path.join(root, f))

pattern = re.compile(r'<!--\s*={5,}\s*\[1\] TOP BAR\s*={5,}\s*-->.*?</nav>', re.DOTALL)

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine depth string
    rel_path = os.path.relpath(file_path, base_dir)
    dir_count = rel_path.count(os.sep)
    prefix = '../' * dir_count if dir_count > 0 else ''

    new_html = new_header_template.replace('{prefix}', prefix)
    
    if pattern.search(content):
        updated_content = pattern.sub(new_html, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        print(f"Updated header in: {rel_path}")
    else:
        print(f"Header pattern not found in: {rel_path}")
