import type { FeatureConfig } from './FeaturePage'

export const featureConfigs: Record<string, FeatureConfig> = {
  resource: {
    id: 'resource',
    title: '教學資源生成',
    version: 'v3.3',
    icon: 'sparkles',
    accent: '#3b82f6',
    tagline: '一鍵生成 PPT、資訊圖表、影片與 Podcast 等教學素材',
    highlights: [
      { icon: 'ppt', title: '簡報 PPT', desc: '依主題自動產生結構化教學簡報，含講者備註。' },
      { icon: 'chart', title: '資訊圖表', desc: '把抽象概念轉成易懂的視覺化圖解。' },
      { icon: 'video', title: '影片 / Podcast', desc: '生成講解影片腳本與課前音檔。' },
    ],
    form: {
      heading: '產生教學素材',
      fields: [
        { key: 'type', label: '素材類型', type: 'select', options: ['簡報 PPT', '資訊圖表', '教學影片', 'Podcast 音檔'] },
        { key: 'subject', label: '科目', placeholder: '例：自然科學' },
        { key: 'grade', label: '年段', placeholder: '例：五年級' },
        { key: 'topic', label: '主題 / 單元', placeholder: '例：水域環境' },
      ],
      submitLabel: '開始生成',
      resultTitle: '已排程生成',
      makeResult: (v) => [
        `${v.type}：${v.grade}${v.subject}「${v.topic}」`,
        '已套用 SOIL 教學設計框架（三版本）',
        '繁體中文（zh-TW）輸出',
        '預計 1–2 分鐘完成，完成後可於資源庫下載',
      ],
    },
  },

  exam: {
    id: 'exam',
    title: 'AI 考試系統',
    version: 'v3.0',
    icon: 'exam',
    accent: '#a855f7',
    tagline: '素養導向命題，一鍵產出「六合一試卷包」',
    highlights: [
      { icon: 'layers', title: '六合一試卷包', desc: '學生卷、教師卷、解析卷、配分卡、雙向細目表、審題檢核表。' },
      { icon: 'star', title: '素養命題', desc: '依 108 課綱情境化命題，含 Bloom 分層與迷思概念。' },
      { icon: 'check', title: '崑山審題標準', desc: '選項無規律、Fact-Check、自動審題檢核。' },
    ],
    outputs: [
      { label: '學生題目卷.docx', hint: '補救卷含 💡 學習鷹架' },
      { label: '含題答案卷_教師版.docx' },
      { label: '題目解析與尺規卷.docx', hint: '含後設認知引導與評分標準' },
      { label: '配分答案卡總表.xlsx', hint: '全題號／題型／配分／正解' },
      { label: '雙向細目表.xlsx', hint: '含認知層次與答題時間預估' },
      { label: '命題及審題檢核表.docx', hint: '基於崑山國小審題標準' },
    ],
    form: {
      heading: '建立考試',
      fields: [
        { key: 'subject', label: '科目', placeholder: '例：自然科學' },
        { key: 'grade', label: '年段', placeholder: '例：五年級' },
        { key: 'topic', label: '主題 / 單元', placeholder: '例：水域環境' },
        { key: 'mode', label: '卷別', type: 'select', options: ['定期評量', '補救教學卷', '依範本版面'] },
      ],
      submitLabel: '產出六合一試卷包',
      resultTitle: '六合一試卷包（示範）',
      makeResult: (v) => [
        `${v.grade}${v.subject}_${v.topic}_${v.mode}_學生題目卷.docx`,
        `${v.grade}${v.subject}_${v.topic}_${v.mode}_含題答案卷_教師版.docx`,
        `${v.grade}${v.subject}_${v.topic}_${v.mode}_題目解析與尺規卷.docx`,
        `${v.grade}${v.subject}_${v.topic}_${v.mode}_配分答案卡總表.xlsx`,
        `${v.grade}${v.subject}_${v.topic}_${v.mode}_雙向細目表.xlsx`,
        `${v.grade}${v.subject}_${v.topic}_${v.mode}_命題及審題檢核表.docx`,
      ],
    },
  },

  essay: {
    id: 'essay',
    title: '作文批改系統',
    version: 'v2.2',
    icon: 'pen',
    accent: '#ec4899',
    tagline: 'AI 智能批改作文，提供細緻評語、評分與改寫建議',
    highlights: [
      { icon: 'pen', title: '六大文體', desc: '記敘／說明／議論／應用／詩歌／看圖作文自動辨識。' },
      { icon: 'star', title: '五面向評分', desc: '立意取材、結構組織、遣詞造句、錯字格式、整體。' },
      { icon: 'check', title: '可依範本對齊', desc: '可上傳班級指定範文，100% 對齊評分標準。' },
    ],
    form: {
      heading: '貼上作文內容',
      fields: [
        { key: 'title', label: '作文題目', placeholder: '例：我最難忘的一次旅行' },
        { key: 'genre', label: '文體', type: 'select', options: ['自動判斷', '記敘文', '說明文', '議論文', '應用文', '詩歌'] },
        { key: 'content', label: '作文內容', type: 'textarea', placeholder: '貼上學生作文…' },
      ],
      submitLabel: '開始批改',
      resultTitle: '批改結果（示範）',
      makeResult: (v) => [
        `題目：「${v.title}」 文體：${v.genre === '自動判斷' ? '記敘文（自動判斷）' : v.genre}`,
        '立意取材 ★★★★☆ 結構組織 ★★★★☆',
        '遣詞造句 ★★★☆☆ 錯字與格式 ★★★★☆',
        '總評：情感真摯、層次分明，建議加強譬喻與結尾呼應。',
        '等第：甲上',
      ],
    },
  },

  teacher: {
    id: 'teacher',
    title: '教師專區',
    icon: 'teacher',
    accent: '#34d399',
    tagline: '個人教學設定、課表與教學歷程',
    highlights: [
      { icon: 'gear', title: '教學偏好', desc: '設定慣用科目、年段與輸出風格，套用到所有生成。' },
      { icon: 'book', title: '教學歷程', desc: '彙整你產出的素材、試卷與批改紀錄。' },
      { icon: 'users', title: '共備協作', desc: '與同領域教師共享範本與題庫。' },
    ],
    form: {
      heading: '更新教學偏好',
      fields: [
        { key: 'name', label: '教師姓名', placeholder: '王小明' },
        { key: 'mainSubject', label: '主要任教科目', placeholder: '例：自然科學' },
        { key: 'grade', label: '主要任教年段', placeholder: '例：五年級' },
      ],
      submitLabel: '儲存偏好',
      resultTitle: '已更新',
      makeResult: (v) => [`教師：${v.name}`, `主要科目：${v.mainSubject}`, `主要年段：${v.grade}`, '偏好已套用至生成預設'],
    },
  },

  library: {
    id: 'library',
    title: '資源庫',
    icon: 'book',
    accent: '#22d3ee',
    tagline: '集中管理已生成的簡報、試卷、影片與批改報告',
    highlights: [
      { icon: 'layers', title: '分類收納', desc: '依科目／年段／素材類型自動歸檔。' },
      { icon: 'search', title: '快速搜尋', desc: '以主題或關鍵字找回任何教學素材。' },
      { icon: 'arrow', title: '一鍵再用', desc: '複製既有素材作為新教材的起點。' },
    ],
    form: {
      heading: '搜尋資源庫',
      fields: [
        { key: 'kw', label: '關鍵字', placeholder: '例：水域環境' },
        { key: 'type', label: '素材類型', type: 'select', options: ['全部', '簡報', '試卷', '影片', '批改報告'] },
      ],
      submitLabel: '搜尋',
      resultTitle: '搜尋結果（示範）',
      makeResult: (v) => [
        `「${v.kw}」相關 ${v.type === '全部' ? '素材' : v.type} 共 3 筆`,
        '五年級自然_水域環境_教學簡報.pptx',
        '五年級自然_水域環境_六合一試卷包.zip',
        '五年級自然_水域環境_複習影片.mp4',
      ],
    },
  },

  settings: {
    id: 'settings',
    title: '系統設定',
    icon: 'gear',
    accent: '#94a3b8',
    tagline: '介面、語言與資料管理',
    highlights: [
      { icon: 'gear', title: '介面主題', desc: '科幻深色主題（預設）。' },
      { icon: 'doc', title: '輸出語言', desc: '全站強制繁體中文（zh-TW，台灣用語）。' },
      { icon: 'users', title: '本機資料', desc: '班級與學生名單儲存在瀏覽器，不上傳雲端。' },
    ],
  },
}

// 側邊欄「教學內容生成」沿用資源生成頁
featureConfigs.content = { ...featureConfigs.resource, id: 'content', title: '教學內容生成' }

featureConfigs.courses = {
  id: 'courses',
  title: '我的課程',
  icon: 'doc',
  accent: '#3b82f6',
  tagline: '建立與管理課程、單元與教學進度',
  highlights: [
    { icon: 'doc', title: '課程大綱', desc: '依 108 課綱快速建立單元架構與學習目標。' },
    { icon: 'layers', title: '教材掛載', desc: '把生成的簡報、影片、試卷掛到對應單元。' },
    { icon: 'pulse', title: '進度追蹤', desc: '掌握各班教學進度與學生學習狀態。' },
  ],
  form: {
    heading: '新建課程',
    fields: [
      { key: 'name', label: '課程名稱', placeholder: '例：五年級自然' },
      { key: 'grade', label: '年段', placeholder: '例：五年級' },
      { key: 'unit', label: '單元', placeholder: '例：水域環境' },
    ],
    submitLabel: '建立課程',
    resultTitle: '已建立課程（示範）',
    makeResult: (v) => [`${v.grade}「${v.name}」`, `首個單元：${v.unit}`, '已套用課綱對應指標', '可於我的課程掛載教材'],
  },
}

featureConfigs['ai-assistant'] = {
  id: 'ai-assistant',
  title: 'AI 助教',
  icon: 'robot',
  accent: '#22d3ee',
  tagline: '隨時提問教學設計、命題建議與班級經營策略',
  highlights: [
    { icon: 'sparkles', title: '教學諮詢', desc: '提問教學法、差異化策略，立即得到建議。' },
    { icon: 'exam', title: '命題協作', desc: '描述需求，協助規劃題型與雙向細目。' },
    { icon: 'megaphone', title: '親師溝通', desc: '產出家長聯絡簿與溝通話術草稿。' },
  ],
  form: {
    heading: '向 AI 助教提問',
    fields: [
      { key: 'topic', label: '主題', type: 'select', options: ['教學設計', '命題建議', '班級經營', '親師溝通'] },
      { key: 'q', label: '你的問題', type: 'textarea', placeholder: '例：五年級自然「水域環境」如何設計探究式活動？' },
    ],
    submitLabel: '送出提問',
    resultTitle: 'AI 助教回覆（示範）',
    makeResult: (v) => [`主題：${v.topic}`, '已分析你的問題並產生建議大綱', '1. 引起動機：生活情境提問', '2. 探究活動：分組觀察與紀錄', '3. 形成性評量：素養題 + 後設認知反思'],
  },
}
