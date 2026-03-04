export type Language = "en" | "te" | "hi";

type StringMap = {
  appName: string;
  tagline: string;
  selectLanguage: string;
  continueBtn: string;
  english: string;
  telugu: string;
  hindi: string;
  enterPhone: string;
  sendOtp: string;
  enterOtp: string;
  resendIn: string;
  resendOtp: string;
  whatsappFallback: string;
  verifying: string;
  verified: string;
  privacy: string;
  privacyDesc: string;
  offlineAfterSetup: string;
  ageNotice: string;
  zeroData: string;
  acceptAndContinue: string;
  overlayPermission: string;
  overlayDesc: string;
  allowOverlay: string;
  notNow: string;
  sessionDuration: string;
  oneCardEvery: string;
  strictMode: string;
  premium: string;
  startSession: string;
  stopSession: string;
  share: string;
  contactUs: string;
  feedback: string;
  aboutUs: string;
  settings: string;
  save: string;
  displayMode: string;
  halfScreen: string;
  fullScreen: string;
  audioCue: string;
  vibration: string;
  funPopUps: string;
  problemsBeforePopup: string;
  language: string;
  unsavedChanges: string;
  unsavedWarning: string;
  discard: string;
  keepEditing: string;
  choosePlan: string;
  joinPremium: string;
  trialNote: string;
  daily: string;
  monthly: string;
  yearly: string;
  bestValue: string;
  benefitStrict: string;
  benefitNoAds: string;
  benefitLeaderboard: string;
  benefitSupport: string;
  restorePurchase: string;
  aboutTitle: string;
  aboutDesc: string;
  offlineApp: string;
  minAge: string;
  contactBtn: string;
  version: string;
  quickMath: string;
  timeUp: string;
  correct: string;
  wrong: string;
  close: string;
  thinking: string;
  premiumRequired: string;
  viewPlans: string;
  overlayWarning: string;
};

const en: StringMap = {
  appName: "Quick Math",
  tagline: "Stay sharp, one card at a time",
  selectLanguage: "Choose your language",
  continueBtn: "Continue",
  english: "English",
  telugu: "తెలుగు",
  hindi: "हिंदी",
  enterPhone: "Enter your mobile number",
  sendOtp: "Send OTP",
  enterOtp: "Enter the 6-digit OTP",
  resendIn: "Resend in",
  resendOtp: "Resend OTP",
  whatsappFallback: "Get OTP via WhatsApp",
  verifying: "Verifying...",
  verified: "Verified!",
  privacy: "Your Privacy Matters",
  privacyDesc: "Quick Math is designed with privacy at its core.",
  offlineAfterSetup: "Works fully offline after setup",
  ageNotice: "You must be 18 or older to use this app",
  zeroData: "Zero personal data collected or shared",
  acceptAndContinue: "Accept & Continue",
  overlayPermission: "Overlay Permission",
  overlayDesc: "Quick Math needs overlay permission to show math cards while you use other apps during your session.",
  allowOverlay: "Allow Overlay",
  notNow: "Not Now",
  sessionDuration: "Session Duration",
  oneCardEvery: "One card every",
  strictMode: "Strict Mode",
  premium: "Premium",
  startSession: "Slide to Start",
  stopSession: "Stop Session",
  share: "Share",
  contactUs: "Contact Us",
  feedback: "Feedback",
  aboutUs: "About Us",
  settings: "Settings",
  save: "Save",
  displayMode: "Display Mode",
  halfScreen: "Half Screen",
  fullScreen: "Full Screen",
  audioCue: "Audio Cue",
  vibration: "Vibration",
  funPopUps: "Fun Pop-Ups",
  problemsBeforePopup: "Problems before pop-up",
  language: "Language",
  unsavedChanges: "Unsaved Changes",
  unsavedWarning: "You have unsaved changes. Do you want to discard them?",
  discard: "Discard",
  keepEditing: "Keep Editing",
  choosePlan: "Choose Your Plan",
  joinPremium: "Join Premium",
  trialNote: "3-day free trial included",
  daily: "Daily",
  monthly: "Monthly",
  yearly: "Yearly",
  bestValue: "Best Value",
  benefitStrict: "Strict Mode",
  benefitNoAds: "No Ads",
  benefitLeaderboard: "Leaderboards (coming soon)",
  benefitSupport: "Priority Support",
  restorePurchase: "Restore Purchase",
  aboutTitle: "About Quick Math",
  aboutDesc: "Quick Math keeps your mind sharp by showing math problems as overlays during your daily phone usage.",
  offlineApp: "Works fully offline",
  minAge: "18+ only",
  contactBtn: "Contact Us",
  version: "Version",
  quickMath: "Quick Math",
  timeUp: "Time's up!",
  correct: "Correct!",
  wrong: "Wrong",
  close: "Close",
  thinking: "Think quick!",
  premiumRequired: "This feature requires Premium",
  viewPlans: "View Plans",
  overlayWarning: "Overlay permission not granted. Math cards won't appear over other apps.",
};

const te: StringMap = {
  appName: "క్విక్ మ్యాత్",
  tagline: "ఒక కార్డ్ ఒక అడుగు - మేధస్సు చురుగ్గా ఉంచుకో",
  selectLanguage: "మీ భాష ఎంచుకోండి",
  continueBtn: "కొనసాగించు",
  english: "English",
  telugu: "తెలుగు",
  hindi: "हिंदी",
  enterPhone: "మీ మొబైల్ నంబర్ నమోదు చేయండి",
  sendOtp: "OTP పంపండి",
  enterOtp: "6 అంక OTP నమోదు చేయండి",
  resendIn: "మళ్ళీ పంపండి",
  resendOtp: "OTP మళ్ళీ పంపండి",
  whatsappFallback: "WhatsApp ద్వారా OTP పొందండి",
  verifying: "ధృవీకరిస్తున్నాము...",
  verified: "ధృవీకరించబడింది!",
  privacy: "మీ గోప్యత ముఖ్యం",
  privacyDesc: "క్విక్ మ్యాత్ గోప్యతను దృష్టిలో పెట్టుకుని రూపొందించబడింది.",
  offlineAfterSetup: "సెటప్ తర్వాత పూర్తిగా ఆఫ్‌లైన్‌లో పనిచేస్తుంది",
  ageNotice: "ఈ అప్లికేషన్ వాడుకోవాలంటే మీకు 18 ఏళ్ళు పైన ఉండాలి",
  zeroData: "వ్యక్తిగత డేటా ఏదీ సేకరించబడదు లేదా పంచుకోబడదు",
  acceptAndContinue: "ఒప్పుకుని కొనసాగించు",
  overlayPermission: "ఓవర్‌లే అనుమతి",
  overlayDesc: "సెషన్ సమయంలో ఇతర యాప్‌లపై గణిత కార్డ్‌లు చూపించడానికి ఓవర్‌లే అనుమతి అవసరం.",
  allowOverlay: "అనుమతి ఇవ్వండి",
  notNow: "ఇప్పుడు వద్దు",
  sessionDuration: "సెషన్ వ్యవధి",
  oneCardEvery: "ప్రతి కార్డ్ ఒకసారి",
  strictMode: "కఠిన మోడ్",
  premium: "ప్రీమియం",
  startSession: "స్లైడ్ చేసి ప్రారంభించు",
  stopSession: "సెషన్ ఆపు",
  share: "షేర్ చేయి",
  contactUs: "మాకు సంప్రదించండి",
  feedback: "అభిప్రాయం",
  aboutUs: "మా గురించి",
  settings: "సెట్టింగ్‌లు",
  save: "సేవ్ చేయి",
  displayMode: "ప్రదర్శన మోడ్",
  halfScreen: "సగం స్క్రీన్",
  fullScreen: "పూర్తి స్క్రీన్",
  audioCue: "ఆడియో సూచన",
  vibration: "వైబ్రేషన్",
  funPopUps: "సరదా పాప్-అప్‌లు",
  problemsBeforePopup: "పాప్-అప్ ముందు సమస్యలు",
  language: "భాష",
  unsavedChanges: "సేవ్ చేయని మార్పులు",
  unsavedWarning: "మీకు సేవ్ చేయని మార్పులు ఉన్నాయి. వాటిని వదిలేయాలా?",
  discard: "వదిలేయి",
  keepEditing: "సవరణ కొనసాగించు",
  choosePlan: "మీ ప్లాన్ ఎంచుకోండి",
  joinPremium: "ప్రీమియంలో చేరండి",
  trialNote: "3 రోజుల ఉచిత ట్రయల్ ఉంది",
  daily: "రోజువారీ",
  monthly: "నెలవారీ",
  yearly: "సంవత్సరీకం",
  bestValue: "అత్యుత్తమ విలువ",
  benefitStrict: "కఠిన మోడ్",
  benefitNoAds: "ప్రకటనలు లేవు",
  benefitLeaderboard: "లీడర్‌బోర్డ్‌లు (త్వరలో రానున్నాయి)",
  benefitSupport: "ప్రాధాన్య మద్దతు",
  restorePurchase: "కొనుగోలు పునరుద్ధరించు",
  aboutTitle: "క్విక్ మ్యాత్ గురించి",
  aboutDesc: "క్విక్ మ్యాత్ మీ రోజువారీ ఫోన్ వినియోగంలో గణిత సమస్యలు చూపించడం ద్వారా మీ మనసును చురుగ్గా ఉంచుతుంది.",
  offlineApp: "పూర్తిగా ఆఫ్‌లైన్‌లో పనిచేస్తుంది",
  minAge: "18+ మాత్రమే",
  contactBtn: "మాకు సంప్రదించండి",
  version: "వెర్షన్",
  quickMath: "క్విక్ మ్యాత్",
  timeUp: "సమయం అయిపోయింది!",
  correct: "సరైనది!",
  wrong: "తప్పు",
  close: "మూసివేయి",
  thinking: "త్వరగా ఆలోచించు!",
  premiumRequired: "ఈ ఫీచర్‌కు ప్రీమియం అవసరం",
  viewPlans: "ప్లాన్‌లు చూడండి",
  overlayWarning: "ఓవర్‌లే అనుమతి లేదు. ఇతర యాప్‌లపై గణిత కార్డ్‌లు కనిపించవు.",
};

const hi: StringMap = {
  appName: "क्विक मैथ",
  tagline: "एक कार्ड, एक कदम — दिमाग को तेज रखें",
  selectLanguage: "अपनी भाषा चुनें",
  continueBtn: "जारी रखें",
  english: "English",
  telugu: "తెలుగు",
  hindi: "हिंदी",
  enterPhone: "अपना मोबाइल नंबर दर्ज करें",
  sendOtp: "OTP भेजें",
  enterOtp: "6 अंकों का OTP दर्ज करें",
  resendIn: "फिर से भेजें",
  resendOtp: "OTP फिर से भेजें",
  whatsappFallback: "WhatsApp से OTP पाएं",
  verifying: "सत्यापित हो रहा है...",
  verified: "सत्यापित!",
  privacy: "आपकी गोपनीयता महत्वपूर्ण है",
  privacyDesc: "Quick Math को गोपनीयता को केंद्र में रखकर बनाया गया है।",
  offlineAfterSetup: "सेटअप के बाद पूरी तरह ऑफलाइन काम करता है",
  ageNotice: "इस ऐप का उपयोग करने के लिए आपकी आयु 18+ होनी चाहिए",
  zeroData: "कोई व्यक्तिगत डेटा एकत्र या साझा नहीं किया जाता",
  acceptAndContinue: "स्वीकार करें और जारी रखें",
  overlayPermission: "ओवरले अनुमति",
  overlayDesc: "सत्र के दौरान अन्य ऐप्स पर गणित कार्ड दिखाने के लिए ओवरले अनुमति की आवश्यकता है।",
  allowOverlay: "अनुमति दें",
  notNow: "अभी नहीं",
  sessionDuration: "सत्र अवधि",
  oneCardEvery: "हर कार्ड",
  strictMode: "सख्त मोड",
  premium: "प्रीमियम",
  startSession: "शुरू करने के लिए स्लाइड करें",
  stopSession: "सत्र रोकें",
  share: "शेयर करें",
  contactUs: "संपर्क करें",
  feedback: "प्रतिक्रिया",
  aboutUs: "हमारे बारे में",
  settings: "सेटिंग्स",
  save: "सहेजें",
  displayMode: "प्रदर्शन मोड",
  halfScreen: "आधी स्क्रीन",
  fullScreen: "पूरी स्क्रीन",
  audioCue: "ऑडियो संकेत",
  vibration: "कंपन",
  funPopUps: "मज़ेदार पॉप-अप",
  problemsBeforePopup: "पॉप-अप से पहले सवाल",
  language: "भाषा",
  unsavedChanges: "असहेजे बदलाव",
  unsavedWarning: "आपके पास असहेजे बदलाव हैं। क्या उन्हें हटाएं?",
  discard: "हटाएं",
  keepEditing: "संपादन जारी रखें",
  choosePlan: "अपना प्लान चुनें",
  joinPremium: "प्रीमियम में शामिल हों",
  trialNote: "3 दिन का मुफ्त ट्रायल शामिल",
  daily: "दैनिक",
  monthly: "मासिक",
  yearly: "वार्षिक",
  bestValue: "सर्वोत्तम मूल्य",
  benefitStrict: "सख्त मोड",
  benefitNoAds: "कोई विज्ञापन नहीं",
  benefitLeaderboard: "लीडरबोर्ड (जल्द आ रहा है)",
  benefitSupport: "प्राथमिक सहायता",
  restorePurchase: "खरीद बहाल करें",
  aboutTitle: "Quick Math के बारे में",
  aboutDesc: "Quick Math आपके रोज़ाना फोन उपयोग के दौरान गणित के सवाल दिखाकर आपके दिमाग को तेज रखता है।",
  offlineApp: "पूरी तरह ऑफलाइन काम करता है",
  minAge: "केवल 18+",
  contactBtn: "संपर्क करें",
  version: "संस्करण",
  quickMath: "क्विक मैथ",
  timeUp: "समय समाप्त!",
  correct: "सही!",
  wrong: "गलत",
  close: "बंद करें",
  thinking: "जल्दी सोचो!",
  premiumRequired: "इस सुविधा के लिए प्रीमियम आवश्यक है",
  viewPlans: "प्लान देखें",
  overlayWarning: "ओवरले अनुमति नहीं है। अन्य ऐप्स पर गणित कार्ड नहीं दिखेंगे।",
};

const allStrings: Record<Language, StringMap> = { en, te, hi };

export function getStrings(lang: Language): StringMap {
  return allStrings[lang] || en;
}
