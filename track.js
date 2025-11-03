// track.js - 첫 번째 앨범의 수록곡 정보를 크롤링하는 파일
// 과제: 최신 앨범 리스트의 첫 번째 앨범의 수록곡을 동적으로 크롤링
//
// 🔥 핵심 전략: "네트워크 요청 가로채기" (LEVEL 3)
// - index.js와 동일한 방식 사용
// - 브라우저가 자동으로 호출하는 API 응답을 가로챔

import { chromium } from "playwright";
import fs from "fs";

// 수록곡 정보를 크롤링하는 비동기 함수
async function crawlTracks() {
  console.log("🚀 첫 번째 앨범의 수록곡 크롤링 시작...\n");

  // 1단계: Chromium 브라우저 실행
  const browser = await chromium.launch({
    headless: true, // 백그라운드 실행
  });

  const page = await browser.newPage();

  // 모든 네트워크 응답을 모니터링 (디버깅용)
  page.on("response", async (response) => {
    const url = response.url();
    // API 요청만 출력
    if (url.includes("apis.naver.com") && url.includes("album")) {
      console.log(`🔍 API 발견: ${url}`);
      console.log(`   상태: ${response.status()}`);
    }
  });

  try {
    // 2단계: 앨범 차트 API 응답을 가로채기 위한 Promise 설정
    // "albumChart"가 포함된 API 응답을 기다립니다
    console.log("📄 최신 앨범 리스트 조회 중...");
    const chartResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("albumChart") && response.status() === 200,
      { timeout: 30000 }
    );

    // 3단계: VIBE 페이지 방문 (브라우저가 자동으로 API 호출)
    await page.goto("https://vibe.naver.com/new-release-album/manual", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // 4단계: 가로챈 API 응답에서 데이터 추출
    const chartResponse = await chartResponsePromise;
    const chartData = await chartResponse.json();

    // 5단계: 응답 구조 검증
    if (!chartData?.response?.result?.chart?.albums) {
      console.log("❌ 앨범 차트 API 응답 형식이 올바르지 않습니다.");
      await browser.close();
      return;
    }

    const albums = chartData.response.result.chart.albums;

    if (albums.length === 0) {
      console.log("❌ 앨범을 찾을 수 없습니다.");
      await browser.close();
      return;
    }

    // 6단계: 첫 번째 앨범 정보 추출
    const firstAlbum = albums[0];
    const albumId = firstAlbum.albumId;
    const albumTitle = firstAlbum.albumTitle;
    const artistNames = firstAlbum.artists
      ? firstAlbum.artists.map((a) => a.artistName).join(", ")
      : "";

    console.log(`✅ 첫 번째 앨범 발견!`);
    console.log(`   앨범 ID: ${albumId}`);
    console.log(`   제목: ${albumTitle}`);
    console.log(`   아티스트: ${artistNames}\n`);

    // 7단계: 앨범 수록곡 API 응답을 가로채기 위한 Promise 설정
    // API 엔드포인트: /musicapiweb/album/{albumId}/tracks
    console.log("🎵 수록곡 정보 조회 중...");
    const albumResponsePromise = page.waitForResponse(
      (response) => {
        const url = response.url();
        // 정확한 API 패턴 매칭: /album/{albumId}/tracks
        return (
          url.includes(`/album/${albumId}/tracks`) && response.status() === 200
        );
      },
      { timeout: 30000 }
    );

    // 8단계: 앨범 상세 페이지로 이동 (브라우저가 자동으로 API 호출)
    await page.goto(`https://vibe.naver.com/album/${albumId}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // 9단계: 가로챈 API 응답에서 데이터 추출
    const albumResponse = await albumResponsePromise;
    const albumData = await albumResponse.json();

    // 10단계: 응답 구조 검증
    // API 응답 구조: response.result.tracks
    if (!albumData?.response?.result?.tracks) {
      console.log("❌ 수록곡 API 응답 형식이 올바르지 않습니다.");
      console.log("응답 구조:", Object.keys(albumData));
      if (albumData.response) {
        console.log("response 구조:", Object.keys(albumData.response));
      }
      await browser.close();
      return;
    }

    const tracks = albumData.response.result.tracks;

    if (tracks.length === 0) {
      console.log("❌ 수록곡을 찾을 수 없습니다.");
      await browser.close();
      return;
    }

    // 11단계: 수록곡 목록을 console.log()로 출력
    console.log("\n" + "=".repeat(60));
    console.log("📀 앨범 정보");
    console.log("=".repeat(60));
    console.log(`제목: ${albumTitle}`);
    console.log(`아티스트: ${artistNames}`);
    console.log(`총 ${tracks.length}곡\n`);

    console.log("🎵 수록곡 목록:");
    console.log("=".repeat(60));

    // 각 트랙을 순회하면서 출력
    tracks.forEach((track, index) => {
      // 트랙 제목
      const trackTitle = track.trackTitle || "";

      // 트랙 아티스트 (앨범 아티스트와 다를 수 있음)
      // 예: 피처링이 있는 경우
      const trackArtists = track.artists
        ? track.artists.map((a) => a.artistName).join(", ")
        : "";

      // 트랙 번호와 제목 출력
      console.log(`   ${index + 1}. ${trackTitle}`);

      // 아티스트가 앨범 아티스트와 다르면 표시
      // 예: "아이유 (feat. 악동뮤지션)"
      if (trackArtists && trackArtists !== artistNames) {
        console.log(`      (${trackArtists})`);
      }
    });

    console.log("=".repeat(60));
    console.log(`\n✅ 총 ${tracks.length}곡 출력 완료!`);

    // 12단계: 과제2 결과물을 파일로도 저장
    const outputDir = "./과제2_수록곡크롤링";
    fs.mkdirSync(outputDir, { recursive: true });

    const result = {
      albumId: albumId,
      albumTitle: albumTitle,
      artist: artistNames,
      trackCount: tracks.length,
      tracks: tracks.map((track, index) => ({
        trackNumber: index + 1,
        trackTitle: track.trackTitle || "",
        trackArtists: track.artists
          ? track.artists.map((a) => a.artistName).join(", ")
          : "",
      })),
    };

    fs.writeFileSync(
      `${outputDir}/first_album_tracks.json`,
      JSON.stringify(result, null, 2),
      "utf-8"
    );

    console.log(
      `\n💾 결과물 저장 완료: ./과제2_수록곡크롤링/first_album_tracks.json`
    );
  } catch (error) {
    console.error("❌ 에러 발생:", error.message);
  }

  // 12단계: 브라우저 종료
  await browser.close();
}

// 함수를 실행합니다
crawlTracks();

// 🎓 작동 원리 설명:
//
// 1. 앨범 리스트 가져오기:
//    - page.waitForResponse()로 "albumChart" API 응답 대기
//    - page.goto()로 메인 페이지 방문
//    - 브라우저가 자동으로 API 호출 → 우리가 가로챔
//    - 첫 번째 앨범의 albumId 추출
//
// 2. 수록곡 가져오기:
//    - page.waitForResponse()로 "/album/{albumId}" API 응답 대기
//    - page.goto()로 앨범 상세 페이지 방문
//    - 브라우저가 자동으로 API 호출 → 우리가 가로챔
//    - tracks 배열에서 수록곡 정보 추출
//
// 3. 동적 크롤링:
//    - albumId를 하드코딩하지 않음
//    - 매번 실행할 때마다 현재 첫 번째 앨범을 자동으로 찾음
//    - 첫 번째 앨범이 바뀌어도 문제없이 작동
//
// 🔑 핵심:
// - 우리는 API를 직접 호출하지 않습니다
// - 브라우저가 하는 일을 지켜보고 결과를 가로챕니다
// - 이것이 "네트워크 요청 가로채기" 패턴입니다!
