# 웹 데모 페이지 가이드

## 🎯 목적

면접관에게 크롤링 결과를 시각적으로 보여주기 위한 랜딩 페이지

---

## 🚀 빠른 시작 (3단계)

### 1단계: 크롤링 실행

```bash
node index.js
```

→ `과제1_앨범크롤링/albums.json` 생성됨

### 2단계: 웹페이지 배포

```bash
node deploy-web.js
```

→ `web/data/albums.json`으로 복사됨

### 3단계: 웹페이지 열기

```bash
# 방법 1: 파일 직접 열기
web/index.html 파일을 브라우저로 드래그

# 방법 2: Live Server (VS Code)
VS Code에서 web/index.html 우클릭 → "Open with Live Server"

# 방법 3: 간단한 서버
npx serve web
# → http://localhost:3000 접속
```

---

## 📁 파일 구조

```
project/
├── index.js                    # 크롤링 스크립트
├── track.js                    # 수록곡 크롤링
├── deploy-web.js               # 웹 배포 스크립트 ⭐
│
├── web/                        # 웹페이지 폴더 ⭐
│   ├── index.html              # 메인 페이지
│   ├── style.css               # 스타일
│   ├── script.js               # JavaScript
│   └── data/
│       └── albums.json         # 크롤링 데이터 (자동 복사)
│
├── 과제1_앨범크롤링/
│   └── albums.json             # 원본 데이터
│
└── README.md
```

---

## 🎨 웹페이지 기능

### 1. 헤더

- 프로젝트 제목
- 간단한 설명

### 2. 통계 대시보드

- 총 앨범 수 (100개)
- 아티스트 수
- 크롤링 페이지 수
- 성공률 (100%)

### 3. 검색 & 필터

- **검색**: 앨범 제목 또는 아티스트명으로 검색
- **페이지 필터**: 1페이지/2페이지 선택
- **뷰 전환**: 그리드 뷰 ↔ 리스트 뷰

### 4. 앨범 그리드

- 앨범 이미지
- 앨범 제목
- 아티스트명
- 페이지 번호
- 클릭 시 상세 정보 (alert)

### 5. 기술 설명

- 일반 크롤링 vs 네트워크 가로채기 비교
- 핵심 코드 예시

### 6. 푸터

- 개발자 정보
- 링크

---

## 💡 면접관에게 시연하는 방법

### 시나리오 1: 로컬 시연

```
1. 터미널 열기
2. "먼저 크롤링을 실행하겠습니다"
3. node index.js 실행 → 실시간 로그 보여주기
4. "이제 웹페이지로 확인하겠습니다"
5. node deploy-web.js 실행
6. 브라우저에서 web/index.html 열기
7. 검색, 필터 등 기능 시연
```

### 시나리오 2: GitHub Pages 시연

```
1. "이미 배포된 페이지가 있습니다"
2. https://username.github.io/project 접속
3. 기능 시연
4. "실시간으로 크롤링도 가능합니다"
5. 터미널에서 node index.js 실행
```

---

## 🌐 GitHub Pages 배포 (선택사항)

### 방법 1: 수동 배포

```bash
# 1. web 폴더를 gh-pages 브랜치로 푸시
git subtree push --prefix web origin gh-pages

# 2. GitHub 저장소 → Settings → Pages
# Source: gh-pages branch 선택

# 3. 배포 완료!
# https://username.github.io/repository-name/
```

### 방법 2: GitHub Actions (자동 배포)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web
```

---

## 🎨 커스터마이징

### 색상 변경

```css
/* web/style.css */
:root {
  --primary: #6366f1; /* 메인 색상 */
  --secondary: #8b5cf6; /* 보조 색상 */
  --success: #10b981; /* 성공 색상 */
}
```

### 로고 추가

```html
<!-- web/index.html -->
<header class="header">
  <img src="logo.png" alt="Logo" class="logo" />
  <h1>🎵 VIBE 최신 앨범</h1>
</header>
```

### 다크 모드 추가

```javascript
// web/script.js
const toggleDarkMode = () => {
  document.body.classList.toggle("dark-mode");
};
```

---

## 🔧 문제 해결

### Q1. 데이터가 표시되지 않음

**원인**: albums.json이 없음  
**해결**:

```bash
node index.js        # 크롤링 실행
node deploy-web.js   # 데이터 복사
```

### Q2. 이미지가 깨짐

**원인**: CORS 정책 또는 이미지 URL 만료  
**해결**:

- 로컬 서버 사용 (`npx serve web`)
- 또는 이미지를 로컬에 저장

### Q3. Live Server가 없음

**해결**:

```bash
# VS Code 확장 설치
# 또는 간단한 서버 사용
npx serve web
```

---

## 📊 성능 최적화

### 이미지 최적화

```javascript
// 이미지 lazy loading
<img src="..." loading="lazy">
```

### 검색 디바운싱

```javascript
let searchTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch(e);
  }, 300);
});
```

---

## 🎯 추가 개선 아이디어

### 단기 (1-2시간)

- [ ] 다크 모드
- [ ] 앨범 상세 모달
- [ ] 로딩 애니메이션
- [ ] 에러 페이지

### 중기 (1일)

- [ ] 차트/그래프 (Chart.js)
- [ ] 수록곡 정보 통합
- [ ] 즐겨찾기 기능 (LocalStorage)
- [ ] 공유 기능

### 장기 (1주)

- [ ] 백엔드 API 연동
- [ ] 실시간 크롤링
- [ ] 사용자 인증
- [ ] 데이터베이스 연동

---

## 💼 면접 팁

### 강조할 포인트

1. **문제 해결**: "SPA 크롤링의 어려움을 해결했습니다"
2. **기술 이해**: "네트워크 요청 가로채기 패턴을 사용했습니다"
3. **실무 적용**: "이 기법은 다른 SPA에도 적용 가능합니다"
4. **확장성**: "웹페이지로 시각화하여 실용성을 높였습니다"

### 예상 질문과 답변

**Q: 왜 웹페이지를 만들었나요?**
A: 크롤링 결과를 시각적으로 보여주고, 실무에서 어떻게 활용될 수 있는지 보여드리고 싶었습니다.

**Q: 백엔드는 왜 없나요?**
A: 이 프로젝트는 크롤링 기술에 집중했고, 정적 웹페이지로도 충분히 시연 가능합니다. 필요하다면 Express 서버를 추가할 수 있습니다.

**Q: 실시간 업데이트는 어떻게 하나요?**
A: 현재는 수동 크롤링 후 배포하지만, cron job이나 GitHub Actions로 자동화할 수 있습니다.

---

**웹 데모 페이지로 면접관에게 강한 인상을 남기세요!** 🚀
