// ============================================================================
// 전역 변수
// ============================================================================
let allAlbums = [];
let filteredAlbums = [];
let currentView = "grid";

// ============================================================================
// 페이지 로드
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  await loadAlbums();
  setupEventListeners();
  updateStats();
  renderAlbums();
});

// ============================================================================
// 앨범 데이터 로드
// ============================================================================
async function loadAlbums() {
  try {
    const response = await fetch("./data/albums.json");
    allAlbums = await response.json();
    filteredAlbums = [...allAlbums];
    console.log("✅ 앨범 데이터 로드:", allAlbums.length);
  } catch (error) {
    console.error("❌ 데이터 로드 실패:", error);
    allAlbums = generateDemoData();
    filteredAlbums = [...allAlbums];
  }
}

// ============================================================================
// 데모 데이터 생성
// ============================================================================
function generateDemoData() {
  const artists = [
    "아이유",
    "방탄소년단",
    "블랙핑크",
    "뉴진스",
    "세븐틴",
    "트와이스",
    "강승윤",
    "악동뮤지션",
  ];
  const titles = [
    "Love Dive",
    "Antifragile",
    "OMG",
    "Ditto",
    "Hype Boy",
    "Attention",
    "PAGE 2",
    "MY Lover",
  ];
  const demoAlbums = [];

  for (let page = 1; page <= 2; page++) {
    for (let i = 1; i <= 50; i++) {
      const index = (page - 1) * 50 + i;
      demoAlbums.push({
        index,
        albumId: 35000000 + index,
        title: titles[Math.floor(Math.random() * titles.length)] + " " + index,
        artist: artists[Math.floor(Math.random() * artists.length)],
        img: `https://via.placeholder.com/300x300/667eea/ffffff?text=Album+${index}`,
      });
    }
  }

  return demoAlbums;
}

// ============================================================================
// 한글 초성 추출 (최적화)
// ============================================================================
const chosungCache = new Map();

function getChosung(str) {
  if (chosungCache.has(str)) return chosungCache.get(str);

  const chosung = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];
  let result = "";

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code > -1 && code < 11172) {
      result += chosung[Math.floor(code / 588)];
    } else {
      result += str.charAt(i);
    }
  }

  chosungCache.set(str, result);
  return result;
}

// ============================================================================
// 검색 매칭 (최적화)
// ============================================================================
function matchSearch(text, searchTerm) {
  if (!text || !searchTerm) return false;

  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();

  // 1. 일반 검색 (가장 빠름)
  if (lowerText.includes(lowerSearch)) return true;

  // 2. 공백 제거 검색
  if (text.includes(" ") || searchTerm.includes(" ")) {
    const noSpaceText = text.replace(/\s/g, "").toLowerCase();
    const noSpaceSearch = searchTerm.replace(/\s/g, "").toLowerCase();
    if (noSpaceText.includes(noSpaceSearch)) return true;
  }

  // 3. 초성 검색 (한글만)
  if (/[ㄱ-ㅎ가-힣]/.test(searchTerm)) {
    const chosungText = getChosung(text);
    const chosungSearch = getChosung(searchTerm);
    if (chosungText.includes(chosungSearch)) return true;
  }

  return false;
}

// ============================================================================
// 이벤트 리스너 설정
// ============================================================================
function setupEventListeners() {
  // 검색 (디바운싱)
  const searchInput = document.getElementById("searchInput");
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => handleSearch(e), 200);
  });

  // 페이지 필터
  document
    .getElementById("pageFilter")
    .addEventListener("change", handlePageFilter);

  // 뷰 토글
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".view-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentView = btn.dataset.view;
      renderAlbums();
    });
  });
}

// ============================================================================
// 검색 처리
// ============================================================================
function handleSearch(e) {
  const searchTerm = e.target.value.trim();

  if (!searchTerm) {
    filteredAlbums = [...allAlbums];
  } else {
    filteredAlbums = allAlbums.filter(
      (album) =>
        matchSearch(album.title, searchTerm) ||
        matchSearch(album.artist, searchTerm)
    );
  }

  // 페이지 필터 적용
  const pageFilter = document.getElementById("pageFilter").value;
  if (pageFilter !== "all") {
    filteredAlbums = filteredAlbums.filter(
      (album) => Math.ceil(album.index / 50) === parseInt(pageFilter)
    );
  }

  renderAlbums();
}

// ============================================================================
// 페이지 필터 처리
// ============================================================================
function handlePageFilter(e) {
  const pageValue = e.target.value;
  const searchTerm = document.getElementById("searchInput").value.trim();

  if (!searchTerm) {
    filteredAlbums = [...allAlbums];
  } else {
    filteredAlbums = allAlbums.filter(
      (album) =>
        matchSearch(album.title, searchTerm) ||
        matchSearch(album.artist, searchTerm)
    );
  }

  if (pageValue !== "all") {
    filteredAlbums = filteredAlbums.filter(
      (album) => Math.ceil(album.index / 50) === parseInt(pageValue)
    );
  }

  renderAlbums();
}

// ============================================================================
// 통계 업데이트
// ============================================================================
function updateStats() {
  const totalAlbums = allAlbums.length;
  const uniqueArtists = new Set(allAlbums.map((a) => a.artist)).size;

  animateNumber("totalAlbums", 0, totalAlbums, 1000);
  animateNumber("totalArtists", 0, uniqueArtists, 1000);
}

function animateNumber(elementId, start, end, duration) {
  const element = document.getElementById(elementId);
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 16);
}

// ============================================================================
// 앨범 렌더링 (최적화)
// ============================================================================
function renderAlbums() {
  const albumGrid = document.getElementById("albumGrid");
  const noResults = document.getElementById("noResults");

  // 뷰 모드
  albumGrid.className =
    currentView === "list" ? "album-grid list-view" : "album-grid";

  // 결과 없음
  if (filteredAlbums.length === 0) {
    albumGrid.style.display = "none";
    noResults.style.display = "block";
    return;
  }

  albumGrid.style.display = "grid";
  noResults.style.display = "none";

  // ⚡ 성능 최적화: innerHTML 한 번만 사용
  albumGrid.innerHTML = filteredAlbums
    .map((album) => createAlbumCard(album))
    .join("");

  // ⚡ 이벤트 위임 (더 빠름)
  albumGrid.onclick = (e) => {
    const card = e.target.closest(".album-card");
    if (card) {
      const index = Array.from(albumGrid.children).indexOf(card);
      if (index !== -1) showAlbumDetail(filteredAlbums[index]);
    }
  };
}

// ============================================================================
// 앨범 카드 생성
// ============================================================================
function createAlbumCard(album) {
  const albumPage = Math.ceil(album.index / 50);

  return `
        <div class="album-card" data-album-id="${album.albumId}">
            <img src="${album.img}" alt="${album.title}" class="album-image" loading="lazy"
                 onerror="this.src='https://via.placeholder.com/300x300/667eea/ffffff?text=No+Image'">
            <div class="album-info">
                <div class="album-title" title="${album.title}">${album.title}</div>
                <div class="album-artist">${album.artist}</div>
                <span class="album-page">Page ${albumPage}</span>
            </div>
        </div>
    `;
}

// ============================================================================
// 앨범 상세 정보
// ============================================================================
function showAlbumDetail(album) {
  const albumPage = Math.ceil(album.index / 50);
  alert(
    `
🎵 앨범 정보

제목: ${album.title}
아티스트: ${album.artist}
앨범 ID: ${album.albumId}
페이지: ${albumPage}

※ 실제 프로젝트에서는 모달이나 상세 페이지로 연결할 수 있습니다.
    `.trim()
  );
}
