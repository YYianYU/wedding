import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);
const STORAGE_KEY = "chen-yu-lang";

export const copy = {
  en: {
    metaTitle: "Zhongxin Chen & Yian Yu",
    navLabel: "Pages",
    languageLabel: "Language",
    links: [
      { to: "/", label: "Home", end: true },
      { to: "/story", label: "Our story" },
      { to: "/ceremony", label: "Ceremony" },
      { to: "/gifts", label: "Gifts" },
      { to: "/messages", label: "Messages" },
      { to: "/photos", label: "Photos" },
    ],
    storyTitle: "Our story",
    storyKicker: "In time and place",
    storyLead: "Jiangxi and Sichuan are where we come from. We met at Southern University of Science and Technology in Shenzhen. The road after that reached Texas A&M, and also the University of Michigan in Ann Arbor.",
    weddingKicker: "The wedding",
    weddingClose: "We are about to step into marriage.",
    ceremonyTitle: "The ceremony",
    ceremonyKicker: "An introduction",
    when: "When",
    where: "Where",
    openMap: "Open the map",
    contact: "Write to us",
    designedBy: "Created and designed by Yian Yu",
    giftsTitle: "Gifts",
    giftsKicker: "Only if you wish",
    playMusic: "Play music",
    pauseMusic: "Pause music",
    messagesTitle: "Messages",
    messagesKicker: "A word for us",
    messagesLead: "Leave a blessing, a memory, a hello, or a short voice note. We will keep every one.",
    messagesPreview: "For now, a note stays in this browser. Once the shared book is connected, anyone who opens this page will see the same messages.",
    messagesShared: "Anyone who opens this page can read the messages left here.",
    name: "Name",
    namePlaceholder: "Your name",
    message: "Message",
    messagePlaceholder: "A blessing, a memory, a hello",
    voiceNote: "Voice note",
    voiceHint: "Optional. Up to 45 seconds. You can leave a voice note, a written note, or both.",
    startRecording: "Record a voice note",
    stopRecording: "Stop",
    reRecord: "Record again",
    clearRecording: "Remove recording",
    recordingNow: "Recording…",
    audioLoading: "Loading the voice note…",
    audioFailed: "This voice note could not be played.",
    audioUnsupported: "This browser cannot record audio.",
    micDenied: "Please allow the microphone, then try again.",
    leaveMessage: "Leave a message",
    sending: "Sending…",
    needBoth: "Please leave your name, and a written note or a voice note.",
    sendFailed: "That didn't send. Please try again in a moment.",
    photosTitle: "Share photos",
    photosKicker: "From the day",
    photosLead: "Add a picture you took. We would love to see the day through your eyes, and we keep the pictures in our album.",
    openAlbum: "Open the album",
    yourName: "Your name",
    optional: "Optional",
    photos: "Photos",
    chooseImage: "Please choose a JPG or PNG.",
    albumOffline: "This page is not connected to the album yet.",
    chooseFirst: "Choose one or more photos first.",
    saved: "Saved to the album. Thank you.",
    saving: "Saving…",
    addAlbum: "Add to the album",
    saveFailed: "That picture could not be added. Please try again.",
    opening: "Opening the album…",
    albumClosed: "The album could not be opened just now.",
    emptyAlbum: "No photos yet. Yours can be the first.",
    guest: "Guest",
    photoBy: "Photo shared by",
    albumPhoto: "A photo from the album",
    contentsTitle: "Contents",
    contentsKicker: "Choose a page",
    contentsLabel: "Contents",
    pages: [
      { to: "/story", num: "01", title: "Our story", note: "The places and the years" },
      { to: "/ceremony", num: "02", title: "The ceremony", note: "When and where we marry" },
      { to: "/gifts", num: "03", title: "Gifts", note: "Your presence is enough" },
      { to: "/messages", num: "04", title: "Messages", note: "Leave a word for us" },
      { to: "/photos", num: "05", title: "Share photos", note: "Add a picture from the day" },
    ],
    mapChina: "China",
    mapUs: "United States",
    stops: {
      sustech: "SUSTech",
      wuyuan: "Wuyuan",
      bazhong: "Bazhong",
      station: "College Station",
      arbor: "Ann Arbor",
    },
    connector: "and",
  },
  zh: {
    metaTitle: "陈仲鑫 与 俞易安",
    navLabel: "页面",
    languageLabel: "语言",
    links: [
      { to: "/", label: "首页", end: true },
      { to: "/story", label: "我们的故事" },
      { to: "/ceremony", label: "婚礼" },
      { to: "/gifts", label: "礼物" },
      { to: "/messages", label: "留言" },
      { to: "/photos", label: "照片" },
    ],
    storyTitle: "我们的故事",
    storyKicker: "时间与地方",
    storyLead: "江西和四川，是我们的来处。相识，在深圳的南方科技大学。此后的路，伸向德州农工大学，也伸向安娜堡的密歇根大学。",
    weddingKicker: "婚礼",
    weddingClose: "我们就要步入婚姻。",
    ceremonyTitle: "婚礼",
    ceremonyKicker: "一场邀请",
    when: "时间",
    where: "地点",
    openMap: "打开地图",
    contact: "联系",
    designedBy: "创作者和设计者：Yian Yu",
    giftsTitle: "礼物",
    giftsKicker: "若你愿意",
    playMusic: "播放音乐",
    pauseMusic: "暂停音乐",
    messagesTitle: "留言",
    messagesKicker: "给我们一句话",
    messagesLead: "留下一句祝福、一段回忆、一声问候，或是一段短录音。我们都会好好留着。",
    messagesPreview: "现在留言只留在这台浏览器里。共享留言本连上之后，任何人打开这一页，都会看到同样的留言。",
    messagesShared: "打开这一页的人，都能看到这里的留言。",
    name: "姓名",
    namePlaceholder: "你的名字",
    message: "留言",
    messagePlaceholder: "一句祝福、一段回忆、一声问候",
    voiceNote: "语音留言",
    voiceHint: "选填。最长约 45 秒。可以只留文字、只留录音，或两者都留。",
    startRecording: "开始录音",
    stopRecording: "停止",
    reRecord: "重新录",
    clearRecording: "去掉录音",
    recordingNow: "正在录音…",
    audioLoading: "正在打开这段语音…",
    audioFailed: "这段语音暂时无法播放。",
    audioUnsupported: "这个浏览器不能录音。",
    micDenied: "请允许使用麦克风，然后再试一次。",
    leaveMessage: "留下这句话",
    sending: "正在送出…",
    needBoth: "请留下姓名，以及文字或录音。",
    sendFailed: "这次没有送出。请稍后再试。",
    photosTitle: "分享照片",
    photosKicker: "来自那一天",
    photosLead: "放一张你拍的照片。我们很想从你的眼睛里看见这一天，照片会收在我们的相册里。",
    openAlbum: "打开相册",
    yourName: "你的名字",
    optional: "选填",
    photos: "照片",
    chooseImage: "请选择 JPG 或 PNG。",
    albumOffline: "这一页还没有连上相册。",
    chooseFirst: "请先选择一张或多张照片。",
    saved: "已放进相册。谢谢你。",
    saving: "正在保存…",
    addAlbum: "放入相册",
    saveFailed: "这张照片没有放进去。请再试一次。",
    opening: "正在打开相册…",
    albumClosed: "相册暂时打不开。",
    emptyAlbum: "还没有照片。你的可以是第一张。",
    guest: "宾客",
    photoBy: "照片来自",
    albumPhoto: "相册里的一张照片",
    contentsTitle: "目录",
    contentsKicker: "选择一页",
    contentsLabel: "目录",
    pages: [
      { to: "/story", num: "01", title: "我们的故事", note: "这些年，这些地方" },
      { to: "/ceremony", num: "02", title: "婚礼", note: "时间和地点" },
      { to: "/gifts", num: "03", title: "礼物", note: "你的到来就够了" },
      { to: "/messages", num: "04", title: "留言", note: "给我们留一句话" },
      { to: "/photos", num: "05", title: "分享照片", note: "放上那一天的照片" },
    ],
    mapChina: "中国",
    mapUs: "美国",
    stops: {
      sustech: "南科大",
      wuyuan: "婺源",
      bazhong: "巴中",
      station: "大学城",
      arbor: "安娜堡",
    },
    connector: "和",
  },
};

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    /* keep the default below */
  }
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  const setLang = (next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* the choice still applies for this visit */
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    document.title = copy[lang].metaTitle;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: copy[lang] }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}
