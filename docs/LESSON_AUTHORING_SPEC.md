# 수업 콘텐츠 제작 규격 (GPT용)

이 문서를 GPT에게 그대로 주면, GPT가 만든 JSON을 Lesson Studio에
**붙여넣기만 해도** 수업이 완성된다.

---

## 0. 전체 흐름

```
GPT가 이 규격대로 JSON 작성
   ↓
Lesson Studio → 해당 Lesson 열기 → "JSON 가져오기"
   ↓
화면에서 눈으로 확인 → 저장 → 게시
   ↓
학생이 /week/{주차}/day/{일}/lesson/{번호}/page/1 에서 학습
```

**중요**: "JSON 가져오기"는 지금 편집 중인 Lesson을 **통째로 덮어쓴다**.
Lesson의 `id`만 원래 것이 유지되고 나머지(페이지·블록 전부)는 교체된다.

---

## 1. 최상위 구조

```json
{
  "id": "w2-d2-l1-marketing-content",
  "courseId": "default-course",
  "week": 2,
  "day": 2,
  "lesson": 1,
  "title": "AI로 마케팅 콘텐츠 만들기",
  "description": "한 문장 요약",
  "durationMinutes": 60,
  "status": "draft",
  "version": 1,
  "createdAt": 0,
  "updatedAt": 0,
  "pages": [ /* 아래 2번 */ ]
}
```

| 필드 | 필수 | 설명 |
|---|---|---|
| `id` | O | 영문·숫자·하이픈. 가져오기 때는 무시되지만 형식은 맞출 것 |
| `week` `day` `lesson` | O | 정수. 학생 URL이 이 값으로 정해진다 |
| `title` | O | Lesson 제목 |
| `durationMinutes` | | 학생 화면 상단에 "60분"으로 표시 |
| `status` | | `draft` 또는 `published`. **가져온 뒤 Studio에서 "게시" 누르는 게 안전** |
| `createdAt` `updatedAt` | | `0`으로 두면 된다 |

---

## 2. 페이지

```json
{
  "id": "p01",
  "title": "왜 고객 분석이 먼저인가",
  "layout": "wide",
  "blocks": [ /* 아래 3번 */ ]
}
```

`layout` 4가지:

| 값 | 언제 쓰나 |
|---|---|
| `standard` | 기본. 읽는 페이지 |
| `wide` | 그림·표가 큰 페이지 |
| `fullscreen` | HTML 슬라이드 한 장만 놓을 때 |
| `practice` | 학생이 입력·실습하는 페이지 |

**페이지 1장 = PPT 1장**이다. 스크롤로 길게 늘어뜨리지 말고 끊어라.
한 페이지에 블록 3~6개가 적당하다.

---

## 3. 블록 공통 필드

모든 블록이 공유한다.

```json
{
  "id": "b01-hero",
  "type": "rich-text",
  "title": "선택",
  "description": "선택",
  "visibility": "visible",
  "layout": { "width": "normal", "align": "left", "spacing": "medium" },
  "theme": { "background": "none", "bordered": false },
  "data": { }
}
```

| 필드 | 값 | 설명 |
|---|---|---|
| `id` | 문자열 | **Lesson 안에서 유일해야 한다** |
| `visibility` | `visible` / `hidden` / `instructor-only` | **강사 멘트는 반드시 `instructor-only`** — 학생에게 안 보인다 |
| `layout.width` | `narrow` / `normal` / `wide` / `full` | |
| `layout.align` | `left` / `center` / `right` | |
| `layout.spacing` | `none` / `small` / `medium` / `large` | |
| `layout.hideOnMobile` | `true`/`false` | 표처럼 빽빽한 것만 |
| `theme.background` | `none` / `muted` / `card` / `primary-soft` / `dark` | |
| `theme.bordered` | `true`/`false` | |

`layout`·`theme`은 생략하면 기본값이 들어간다. 필요할 때만 써라.

---

## 4. 블록 17종

### 설명용

#### `rich-text` — 글
```json
{ "id": "b1", "type": "rich-text",
  "data": { "markdown": "# 제목\n\n본문 **강조**\n\n- 목록1\n- 목록2\n\n> 인용",
            "emphasis": "normal" } }
```
- `emphasis`: `normal` / `lead`(큰 도입 문단) / `hero`(큰 타이틀)
- 마크다운 지원: 제목, 굵게, 목록, 인용, 표, 코드
- **HTML 태그는 쓰지 마라.** 그대로 글자로 나온다

#### `image` — 이미지
```json
{ "id": "b2", "type": "image",
  "data": { "url": "/lesson-content/폴더/파일.svg", "alt": "설명",
            "caption": "그림 밑 설명", "display": "hero",
            "objectFit": "contain", "aspectRatio": "16/9", "mobileRatio": "4/3" } }
```
- `display`: `half` / `large` / `hero` / `fullscreen`
- `objectFit`: `contain`(전체 보이기) / `cover`(꽉 채우기)
- `aspectRatio` `mobileRatio`: `auto` / `16/9` / `4/3` / `1/1` / `3/2` / `21/9`
- **`url`은 GPT가 지어내지 마라.** 아래 7번 참고

#### `text-image` — 글 + 이미지 좌우 배치
```json
{ "id": "b3", "type": "text-image",
  "data": { "markdown": "설명 글", "imageUrl": "/경로.svg",
            "alt": "설명", "imagePosition": "right" } }
```

#### `infographic` — 도식
```json
{ "id": "b4", "type": "infographic", "title": "오늘의 목표",
  "data": { "variant": "checklist",
            "items": [ { "label": "항목", "value": "숫자", "description": "설명" } ] } }
```
`variant` 5가지:

| 값 | 쓰임 | items 사용법 |
|---|---|---|
| `steps` | 1→2→3 단계 | `label`=단계명, `description`=설명 |
| `stats` | 큰 숫자 강조 | `value`=**"61%"**, `label`=무엇인지, `description`=출처 |
| `comparison` | A vs B | `label`=이름, `description`=줄바꿈(`\n`)으로 여러 줄 |
| `checklist` | 체크 목록 | `label`만 |
| `image` | 이미지 1장 | `items: []`, `imageUrl` 사용 |

`variant: "image"`일 때 추가: `imageUrl` `alt` `caption` `fit` `display` `aspectRatio`

#### `video` — 영상
```json
{ "id": "b5", "type": "video",
  "data": { "url": "https://youtube.com/watch?v=...", "provider": "youtube", "caption": "" } }
```
`provider`: `youtube` / `vimeo` / `file`

#### `divider` — 구분선
```json
{ "id": "b6", "type": "divider", "data": { "style": "line" } }
```
`style`: `line` / `space` / `dots`

---

### HTML (AI가 만든 슬라이드 붙여넣기)

#### `html` — HTML 직접 입력
```json
{ "id": "b7", "type": "html",
  "data": { "html": "<!doctype html><html>...</html>",
            "trustedScript": true,
            "designWidth": 1280, "designHeight": 720,
            "mobileRenderMode": "responsive" } }
```

| 필드 | 설명 |
|---|---|
| `trustedScript` | HTML 안에 `<script>`가 있으면 `true`. **없으면 스크립트가 아예 안 돈다** |
| `designWidth/Height` | PPT형 슬라이드면 `1280`×`720`. 일반 HTML이면 **생략** |
| `mobileRenderMode` | `scale`(기본, 통째로 축소) / `responsive`(폰에서 축소 안 하고 HTML 자체 CSS에 맡김) |

**`mobileRenderMode` 고르는 법**
- HTML 안에 `@media (max-width: ...)`가 **있으면** → `responsive`
- **없으면** → `scale` (생략해도 됨)
- 잘못 고르면 폰에서 글씨가 12px로 줄어들거나, 반대로 화면 밖으로 넘친다

**HTML 작성 규칙** (안 지키면 화면에 아무것도 안 나온다)
- 외부 CDN 링크 금지 (`<script src="https://...">`, 웹폰트 CDN 등) — 전부 차단된다
- 이미지는 `data:` URI로 넣어라. 외부 URL은 안 나온다
- `window.parent`, `localStorage` 접근 금지 — 격리돼 있어 실패한다
- 슬라이드형은 `1280×720` 캔버스로 만들고, 폰 대응이 필요하면 `@media (max-width:640px)` 블록을 넣어라

#### `html-file` — 서버에 올린 HTML 파일
```json
{ "id": "b8", "type": "html-file",
  "data": { "src": "/lesson-content/폴더/파일.html", "trustedScript": true,
            "designWidth": 1280, "designHeight": 720, "mobileRenderMode": "responsive" } }
```
`src`는 `/`로 시작하는 경로. **파일을 먼저 올려야 한다**(7번 참고)

---

### 학습 확인

#### `quiz` — 객관식
```json
{ "id": "b9", "type": "quiz", "title": "이해도 확인",
  "data": { "questions": [
    { "id": "q1", "question": "문제 문장",
      "choices": [ {"id":"c1","text":"보기1"}, {"id":"c2","text":"보기2"}, {"id":"c3","text":"보기3"} ],
      "correctChoiceId": "c3",
      "explanation": "왜 정답인지 설명" } ] } }
```
- **보기 2개 이상 필수**
- `correctChoiceId`는 반드시 `choices` 안의 `id`와 일치해야 한다
- `explanation`을 꼭 써라. 틀린 학생이 이유를 알아야 한다

#### `reflection` — 회고
```json
{ "id": "b10", "type": "reflection",
  "data": { "questions": ["오늘 가장 크게 바뀐 생각은?"], "placeholder": "한두 문장이면 충분합니다." } }
```

---

### 실습

#### `input-form` — 학생 입력
```json
{ "id": "b11", "type": "input-form", "title": "오늘의 분석 결과",
  "data": { "fields": [
      { "id": "f1", "label": "사업 아이디어 한 문장", "kind": "long-text",
        "required": false, "placeholder": "안내 문구" },
      { "id": "f2", "label": "자료 출처", "kind": "select",
        "required": false, "options": ["실제 고객 인터뷰", "공개 리뷰", "아직 없음"] } ],
    "inputArtifactTypes": ["business-idea"] } }
```
- `kind`: `short-text` / `long-text` / `number` / `select` / `checkbox`
- `kind: "select"`면 `options` 필수
- **`label`이 저장 결과물의 항목 이름이 된다.** "항목1" 같은 이름 쓰지 마라
- `inputArtifactTypes`: 이전 Lesson 결과를 불러올 수 있게 한다(선택)

#### `prompt` — AI 프롬프트 제공
```json
{ "id": "b12", "type": "prompt", "title": "고객 증거 분석 프롬프트",
  "description": "복사한 뒤 {{ }} 부분을 앞 페이지 답으로 바꿔 넣으세요.",
  "data": { "prompt": "여러 줄 프롬프트 전문", "targetTool": "ChatGPT", "copyable": true } }
```
- 변수 자동 치환 기능은 **없다**. `{{변수}}`를 쓰려면 `description`에 "직접 바꿔 넣으라"고 안내해라

#### `external-link` — 외부 도구로 보내기
```json
{ "id": "b13", "type": "external-link",
  "description": "개인정보는 입력하지 마세요.",
  "data": { "url": "https://chatgpt.com/", "buttonLabel": "ChatGPT에서 실행",
            "openInNewTab": true, "showSecurityNotice": true,
            "requireCompletionCheck": true,
            "practiceName": "분석 실행", "practiceDescription": "무엇을 하는지",
            "estimatedMinutes": 12 } }
```
`requireCompletionCheck: true`면 학생이 "실습 완료" 버튼을 누를 수 있다

#### `internal-app` — 앱 내부 화면으로 이동
```json
{ "id": "b14", "type": "internal-app",
  "data": { "route": "/workspace", "practiceName": "내 결과물 보기",
            "completionNote": "안내 문구", "requireCompletionCheck": false } }
```

---

### 결과 저장

#### `save-artifact` — 결과물 저장
```json
{ "id": "b15", "type": "save-artifact",
  "data": { "artifactType": "customer-analysis-foundation",
            "artifactTitle": "Day1 Lesson1 — 고객 분석 기초",
            "sourceBlockId": "b11",
            "buttonLabel": "내 프로젝트에 저장" } }
```
- **`sourceBlockId`는 같은 Lesson의 `input-form` 블록 id.** 그 폼 내용이 저장된다
- 비우면 학생이 자유롭게 적어 저장한다
- `artifactType`은 아래 목록 중 하나여야 한다

#### `result-preview` — 저장된 결과 보여주기
```json
{ "id": "b16", "type": "result-preview",
  "data": { "artifactType": "customer-analysis-foundation",
            "emptyMessage": "아직 저장된 결과가 없습니다." } }
```

#### `download` — 자료 내려받기
```json
{ "id": "b17", "type": "download",
  "data": { "url": "/files/워크시트.pdf", "fileName": "워크시트.pdf", "sizeLabel": "1.2MB" } }
```

---

## 5. artifactType 목록 (이 중에서만 골라라)

```
business-idea                사업 아이디어
customer-evidence            고객 증거
customer-analysis-foundation 고객 분석 기초
segment                      세그먼트
ecp / icp / anti-icp         ECP / ICP / 안티 ICP
persona                      페르소나
journey                      고객 여정
value-proposition            가치제안
content / marketing          콘텐츠 / 마케팅
email                        이메일·DM
landing                      랜딩페이지
form / faq                   폼 / FAQ
ir / pitch                   IR / 피치
business-model               비즈니스 모델
automation                   자동화
custom                       기타
```

**목록에 없는 값을 쓰면 저장이 안 된다.** 새 유형이 필요하면 개발자에게 요청.

---

## 6. 반드시 지킬 것

1. **`id`는 Lesson 안에서 전부 유일하게.** 겹치면 저장·참조가 깨진다
2. **`save-artifact`의 `sourceBlockId`는 실재하는 `input-form` id**여야 한다
3. **강사 멘트는 `visibility: "instructor-only"`**. 안 그러면 학생이 본다
4. **통계·인용은 지어내지 마라.** 출처 없는 숫자를 쓰지 말고, 쓸 때는 출처를 같이 적어라
5. **`url`·`src` 경로를 상상해서 쓰지 마라.** 아직 파일이 없으면 그 블록을 빼고, 대신 "여기에 어떤 그림이 필요한지"를 `description`에 적어 넘겨라
6. **한 페이지가 너무 길면 나눠라.** PPT 한 장 분량이 기준이다
7. **같은 레이아웃을 10페이지 반복하지 마라.** 글·도식·HTML·실습을 섞어라

---

## 7. 이미지·HTML 파일은 GPT가 못 넣는다

GPT는 JSON만 만든다. 실제 파일은 사람이 넣어야 한다.

**이미지** — 두 방법
- Studio 화면에서 이미지 블록 선택 → "파일 업로드" (권장)
- 또는 `public/lesson-content/폴더/`에 넣고 `/lesson-content/폴더/파일.svg`로 참조

GPT가 SVG 코드를 직접 만들어 준 경우, 그 파일을 위 폴더에 저장한 뒤 경로를 쓰면 된다.

**HTML 슬라이드** — `public/lesson-content/폴더/파일.html`에 저장하고 `html-file` 블록의 `src`로 참조.
또는 HTML 전문을 `html` 블록의 `data.html`에 통째로 넣어도 된다(파일 저장 불필요).

---

## 8. 최소 예시 (그대로 복사해 시작)

```json
{
  "id": "w2-d2-l1",
  "courseId": "default-course",
  "week": 2, "day": 2, "lesson": 1,
  "title": "AI로 마케팅 콘텐츠 만들기",
  "description": "고객 정의를 콘텐츠로 옮긴다.",
  "durationMinutes": 60,
  "status": "draft", "version": 1, "createdAt": 0, "updatedAt": 0,
  "pages": [
    {
      "id": "p01", "title": "오늘 무엇을 하나요", "layout": "wide",
      "blocks": [
        { "id": "b01", "type": "rich-text",
          "layout": { "width": "wide", "align": "left", "spacing": "small" },
          "data": { "emphasis": "hero",
                    "markdown": "# 고객을 알았으면\n# 이제 말을 겁니다" } },
        { "id": "b02", "type": "infographic", "title": "오늘의 목표",
          "theme": { "background": "muted" },
          "data": { "variant": "checklist",
                    "items": [ { "label": "메시지 한 줄 만들기" },
                               { "label": "채널별로 바꿔 쓰기" } ] } },
        { "id": "b03", "type": "rich-text", "title": "강사 멘트",
          "visibility": "instructor-only",
          "data": { "markdown": "\"어제 정의한 고객을 다시 꺼내게 하세요.\"" } }
      ]
    },
    {
      "id": "p02", "title": "직접 써보기", "layout": "practice",
      "blocks": [
        { "id": "b04", "type": "input-form", "title": "메시지 초안",
          "data": { "fields": [
            { "id": "f1", "label": "우리 고객에게 할 첫 문장",
              "kind": "long-text", "required": false } ] } },
        { "id": "b05", "type": "save-artifact",
          "data": { "artifactType": "marketing",
                    "artifactTitle": "Day2 — 메시지 초안",
                    "sourceBlockId": "b04",
                    "buttonLabel": "내 프로젝트에 저장" } }
      ]
    }
  ]
}
```

---

## 9. GPT에게 줄 지시문 (복사용)

```
첨부한 LESSON_AUTHORING_SPEC.md 규격에 맞춰
아래 원고를 Lesson JSON으로 만들어줘.

- 규격에 없는 필드는 쓰지 마
- 원고를 임의로 줄이거나 새 통계를 만들지 마
- 이미지가 필요한 자리는 블록을 빼고, description에 어떤 그림이 필요한지 적어줘
- 강사 멘트는 visibility: "instructor-only"로
- id는 전부 유일하게
- 출력은 JSON만. 설명 문장 붙이지 마

[원고]
...
```
