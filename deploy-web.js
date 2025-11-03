// deploy-web.js - 크롤링 데이터를 웹페이지로 복사하는 스크립트
import fs from "fs";
import path from "path";

console.log("🚀 웹페이지 배포 준비 중...\n");

// 1. 크롤링 데이터 확인
const albumsPath = "./과제1_앨범크롤링/albums.json";

if (!fs.existsSync(albumsPath)) {
  console.log("❌ 크롤링 데이터가 없습니다!");
  console.log("💡 먼저 크롤링을 실행하세요: node index.js\n");
  process.exit(1);
}

// 2. docs/data 디렉터리 생성
const docsDataDir = "./docs/data";
if (!fs.existsSync(docsDataDir)) {
  fs.mkdirSync(docsDataDir, { recursive: true });
  console.log("✅ docs/data 디렉터리 생성");
}

// 3. albums.json 복사
fs.copyFileSync(albumsPath, path.join(docsDataDir, "albums.json"));
console.log("✅ albums.json 복사 완료");

// 4. 통계 출력
const albums = JSON.parse(fs.readFileSync(albumsPath, "utf-8"));
console.log(`\n📊 통계:`);
console.log(`   총 앨범 수: ${albums.length}개`);
console.log(`   고유 아티스트: ${new Set(albums.map((a) => a.artist)).size}명`);

console.log("\n" + "=".repeat(60));
console.log("🎉 웹페이지 배포 준비 완료!");
console.log("=".repeat(60));
console.log("\n📂 웹페이지 위치: ./docs/index.html");
console.log("\n🌐 실행 방법:");
console.log("   1. docs/index.html 파일을 브라우저로 열기");
console.log("   2. 또는 Live Server 사용 (VS Code 확장)");
console.log("   3. 또는 간단한 서버 실행:");
console.log("      npx serve docs\n");
console.log("📦 GitHub Pages 배포:");
console.log("   1. git add docs/");
console.log('   2. git commit -m "Update web demo"');
console.log("   3. git push");
console.log("   4. Settings → Pages → Source: main, Folder: /docs\n");
