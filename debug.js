// debug.js - 페이지 구조를 확인하는 디버깅 스크립트
import { chromium } from "playwright";

async function debugPage() {
  console.log("🔍 페이지 구조 분석 시작...\n");

  const browser = await chromium.launch({
    headless: false, // 브라우저 창 표시
  });

  const page = await browser.newPage();

  // 네트워크 요청 모니터링 (API 찾기)
  console.log("📡 네트워크 요청 모니터링 중...\n");
  page.on("response", async (response) => {
    const url = response.url();
    // API 요청으로 보이는 것들만 출력
    if (url.includes("api") || url.includes("album") || url.includes("json")) {
      console.log(`API 발견: ${response.status()} ${url}`);

      // JSON 응답인 경우 내용 일부 출력
      try {
        const contentType = response.headers()["content-type"];
        if (contentType && contentType.includes("json")) {
          const json = await response.json();
          console.log(`  → 응답 데이터 키:`, Object.keys(json));
        }
      } catch (e) {
        // JSON이 아니면 무시
      }
    }
  });

  // 페이지 이동
  console.log("🌐 페이지 접속 중...\n");
  await page.goto("https://vibe.naver.com/new-release-album/manual?page=1", {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  // 충분히 대기
  console.log("⏳ 10초 대기 중 (페이지 렌더링)...\n");
  await page.waitForTimeout(10000);

  // 스크린샷 저장
  await page.screenshot({ path: "debug_screenshot.png", fullPage: true });
  console.log("📸 스크린샷 저장: debug_screenshot.png\n");

  // DOM 구조 분석
  console.log("🔍 DOM 구조 분석 중...\n");

  const analysis = await page.evaluate(() => {
    const results = {
      allClasses: new Set(),
      albumRelated: [],
      imageElements: [],
      linkElements: [],
    };

    // 모든 요소의 클래스 수집
    document.querySelectorAll("[class]").forEach((el) => {
      el.classList.forEach((cls) => {
        results.allClasses.add(cls);
      });
    });

    // 앨범 관련 클래스 찾기
    results.allClasses.forEach((cls) => {
      if (
        cls.toLowerCase().includes("album") ||
        cls.toLowerCase().includes("card") ||
        cls.toLowerCase().includes("item") ||
        cls.toLowerCase().includes("list")
      ) {
        results.albumRelated.push(cls);
      }
    });

    // 이미지 요소 찾기
    document.querySelectorAll("img").forEach((img, idx) => {
      if (idx < 10) {
        // 처음 10개만
        results.imageElements.push({
          src: img.src?.substring(0, 100),
          alt: img.alt,
          parent: img.parentElement?.className,
        });
      }
    });

    // 링크 요소 찾기 (album 포함)
    document.querySelectorAll('a[href*="album"]').forEach((link, idx) => {
      if (idx < 10) {
        // 처음 10개만
        results.linkElements.push({
          href: link.href,
          text: link.innerText?.substring(0, 50),
          className: link.className,
        });
      }
    });

    return {
      allClasses: Array.from(results.allClasses).sort(),
      albumRelated: results.albumRelated,
      imageElements: results.imageElements,
      linkElements: results.linkElements,
    };
  });

  console.log("=".repeat(60));
  console.log("📊 분석 결과");
  console.log("=".repeat(60));

  console.log("\n🎯 앨범 관련 클래스명:");
  analysis.albumRelated.forEach((cls) => console.log(`  - ${cls}`));

  console.log("\n🖼️ 이미지 요소 (처음 10개):");
  analysis.imageElements.forEach((img, idx) => {
    console.log(`  [${idx + 1}]`);
    console.log(`    src: ${img.src}`);
    console.log(`    alt: ${img.alt}`);
    console.log(`    부모 클래스: ${img.parent}`);
  });

  console.log("\n🔗 앨범 링크 (처음 10개):");
  analysis.linkElements.forEach((link, idx) => {
    console.log(`  [${idx + 1}]`);
    console.log(`    href: ${link.href}`);
    console.log(`    text: ${link.text}`);
    console.log(`    class: ${link.className}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("💡 추천 선택자:");
  console.log("=".repeat(60));

  // 가능한 선택자 제안
  const suggestions = [];
  analysis.albumRelated.forEach((cls) => {
    suggestions.push(`.${cls}`);
  });

  if (analysis.linkElements.length > 0) {
    suggestions.push('a[href*="/album/"]');
  }

  suggestions.forEach((sel) => console.log(`  ${sel}`));

  console.log(
    "\n\n⏸️  브라우저를 30초간 열어둡니다. F12로 개발자 도구를 열어 직접 확인하세요!"
  );
  console.log("     Elements 탭에서 앨범 요소를 찾아보세요.\n");

  await page.waitForTimeout(30000);

  await browser.close();
  console.log("\n✅ 분석 완료!");
}

debugPage().catch(console.error);
