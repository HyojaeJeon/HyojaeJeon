# Build Guide — HyojungPOS CEF + Next.js
# 빌드 가이드

## 사전 준비 / Chuẩn bị trước

### 1. CEF SDK 다운로드 / Tải CEF SDK

CEF 빌드 바이너리를 다운로드합니다:
```
https://cef-builds.spotifycdn.com/index.html
```

**선택 사항:**
- Branch: `stable` (최신 안정판 권장)
- Platform: `Windows 32-bit` (Win32) 또는 `Windows 64-bit` (x64)
- Distribution: `Standard Distribution`

**x86/x64 듀얼 빌드를 위해 양쪽 모두 다운로드:**
- `cef_binary_xxx.xxxx_windows32.tar.bz2`
- `cef_binary_xxx.xxxx_windows64.tar.bz2`

### 2. CEF SDK 배치 / Đặt CEF SDK

다운로드한 파일을 아래 경로에 배치합니다:
```
HyojungPOS-Main/Presentation/CEF/SDK/
├── include/          ← CEF 헤더 (cef_binary_xxx/include/ 전체 복사)
├── Release/          ← CEF DLL (cef_binary_xxx/Release/ 전체 복사)
├── Resources/        ← CEF 리소스 (cef_binary_xxx/Resources/ 전체 복사)
└── libcef_dll_wrapper/
    └── Release/      ← libcef_dll_wrapper.lib (아래 빌드 후 복사)
```

### 3. libcef_dll_wrapper 빌드 / Build libcef_dll_wrapper

CEF SDK에 포함된 CMakeLists.txt로 wrapper library를 빌드합니다:
```cmd
cd cef_binary_xxx/
mkdir build && cd build
cmake -G "Visual Studio 17 2022" -A Win32 ..
cmake --build . --config Release --target libcef_dll_wrapper
```

빌드된 `libcef_dll_wrapper.lib`를 아래 경로에 복사:
```
HyojungPOS-Main/Presentation/CEF/SDK/libcef_dll_wrapper/Release/libcef_dll_wrapper.lib
```

### 4. PosUI 빌드 / Build PosUI

```cmd
cd PosUI
npm install
npm run build
```

빌드 결과가 `PosUI/out/`에 생성됩니다.

### 5. PosUI 결과물 복사 / Sao chép kết quả PosUI

```cmd
xcopy /E /Y PosUI\out\* HyojungPOS-Main\Build\PosUI\out\
```

## Visual Studio 빌드 / Build bằng Visual Studio

### 1. 솔루션 열기 / Mở solution
```
HyojungPOS-Main/HyojungPOS-Main.sln
```

### 2. 구성 선택 / Chọn cấu hình
- **Debug|Win32** — 개발/디버깅용 (32-bit)
- **Debug|x64** — 개발/디버깅용 (64-bit)
- **Release|Win32** — 배포용 (32-bit)
- **Release|x64** — 배포용 (64-bit)

### 3. 빌드 / Build
`Ctrl+Shift+B` 또는 메뉴 → Build → Build Solution

빌드 결과:
```
HyojungPOS-Main/Build/
├── HyojungPOSD.exe     (Debug)
├── HyojungPOS.exe      (Release)
└── CefSubprocess.exe   (CEF 렌더러)
```

## 실행 준비 / Chuẩn bị chạy

Build/ 폴더에 아래 파일들이 있어야 합니다:
```
Build/
├── HyojungPOSD.exe          ← 메인 POS exe
├── CefSubprocess.exe        ← CEF 렌더러 subprocess
├── libcef.dll               ← CEF SDK/Release/에서 복사
├── chrome_elf.dll           ← CEF SDK/Release/에서 복사
├── v8_context_snapshot.bin  ← CEF SDK/Release/에서 복사
├── icudtl.dat               ← CEF SDK/Resources/에서 복사
├── locales/                 ← CEF SDK/Resources/locales/ 복사
├── PosUI/
│   └── out/                 ← Next.js 정적 빌드 결과물
│       ├── index.html
│       ├── _next/
│       └── ...
└── cache/                   ← CEF 캐시 (자동 생성)
```

## 실행 / Chạy

```cmd
cd HyojungPOS-Main\Build
HyojungPOSD.exe
```

**기대 결과:**
- 1024x768 윈도우가 뜸
- Next.js 화면이 CEF 브라우저 안에 표시됨
- "테이블 불러오는 중..." 메시지가 보이면 성공

## 디버깅 / Debug

Debug 빌드 시 CEF remote debugging이 활성화됩니다:
- Chrome 브라우저에서 `http://localhost:9222` 접속
- CEF 내부 Next.js 페이지를 Chrome DevTools로 디버깅 가능

## 트러블슈팅 / Xử lý sự cố

| 증상 | 원인 | 해결 |
|---|---|---|
| CEF 초기화 실패 | CEF DLL 누락 | SDK/Release/ 파일을 Build/에 복사 |
| 흰 화면 | PosUI/out/ 누락 | npm run build 후 복사 |
| 404 오류 | app://pos/ 스킴 미등록 | CefSchemeHandler 확인 |
| crash loop | CefSubprocess.exe 누락 | Build/에 CefSubprocess.exe 복사 |
