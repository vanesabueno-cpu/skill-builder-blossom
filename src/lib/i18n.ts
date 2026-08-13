export type UiLang = "es" | "fr" | "en" | "ar";

export const VOICE_LOCALE: Record<UiLang, string> = {
  es: "es-ES",
  fr: "fr-FR",
  en: "en-GB",
  ar: "ar-SA",
};

export type Dict = {
  kicker: string;
  title: string;
  subtitle: string;
  steps: string[];
  stepIntro: string[];
  chooseLang: string;
  welcomeH: string;
  welcomeP: string;
  tip: string;
  back: string;
  next: string;
  seeCv: string;
  resumeMsg: string;
  resumeGo: string;
  resumeNew: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  bio: string;
  namePh: string;
  bioPh: string;
  studies: string;
  studiesP: string;
  degree: string;
  year: string;
  place: string;
  addStudy: string;
  removeStudy: string;
  qualities: string;
  qualitiesP: string;
  chosen: string;
  experience: string;
  experienceP: string;
  expLabel: string;
  expPh: string;
  photo: string;
  photoP: string;
  cv: string;
  cvP: string;
  sections: string;
  sectionsP: string;
  atsTitle: string;
  atsP: string;
  keywords: string;
  downloadPdf: string;
  downloadDocx: string;
  translatedPdf: string;
  shareLink: string;
  print: string;
  startOver: string;
  cloud: string;
  cloudP: string;
  signIn: string;
  signUp: string;
  signOut: string;
  saveCloud: string;
  loadCloud: string;
  voiceOn: string;
  voiceOff: string;
  readStep: string;
  dictate: string;
  listening: string;
  translate: string;
  music: string;
  musicOff: string;
  focus: string;
  motivation: string;
  relax: string;
};

const es: Dict = {
  kicker: "Taller de empleabilidad",
  title: "Mi CV, mi historia",
  subtitle: "Toca las imágenes. Cada paso construye tu currículum.",
  steps: ["Bienvenida", "Tus datos", "Estudios", "Cualidades", "Experiencia", "Tu foto", "Tu CV"],
  stepIntro: [
    "Hola. Vamos a hacer tu currículum juntas, paso a paso. Elige tu idioma tocando un botón.",
    "Escribe tu nombre, tu teléfono, tu correo y tu ciudad. Así te podrán llamar las empresas.",
    "Cuéntanos tus estudios. Si no tienes estudios oficiales, no pasa nada: toca sin estudios formales y sigue.",
    "Toca las imágenes de las cosas que sabes hacer bien. Puedes elegir hasta ocho.",
    "Cuidar, cocinar, limpiar o coser en casa también es experiencia. Toca los sectores y cuéntanos qué sabes hacer.",
    "Ahora tu foto. Puedes hacerte una foto con la cámara o elegir una del teléfono. Nosotros la recortamos y le ponemos un fondo profesional.",
    "Tu currículum está listo. Elige el diseño, revisa la puntuación y descárgalo en PDF o en Word.",
  ],
  chooseLang: "Elige tu idioma",
  welcomeH: "¡Hola! Vamos a hacer tu currículum",
  welcomeP: "No hace falta tener estudios ni haber trabajado fuera de casa. Lo que sabes hacer también cuenta.",
  tip: "Toca el altavoz para escuchar cada paso, el micrófono para hablar en vez de escribir y la música para acompañarte.",
  back: "Atrás",
  next: "Siguiente",
  seeCv: "Ver mi CV",
  resumeMsg: "Tienes un currículum a medias en este dispositivo.",
  resumeGo: "Continuar",
  resumeNew: "Empezar de cero",
  name: "Nombre completo",
  phone: "Teléfono",
  email: "Correo electrónico",
  city: "Ciudad",
  bio: "Preséntate en una frase",
  namePh: "Escribe tu nombre",
  bioPh: "Persona responsable, con ganas de aprender y trabajar en equipo",
  studies: "Estudios",
  studiesP: "Aunque sean de tu país o sin título oficial. Si no tienes, no pasa nada.",
  degree: "Título o especialidad",
  year: "Año (aprox.)",
  place: "Centro o país",
  addStudy: "Añadir otro estudio",
  removeStudy: "Quitar este estudio",
  qualities: "Tus cualidades",
  qualitiesP: "Toca hasta 8 imágenes que hablen de ti.",
  chosen: "elegidas",
  experience: "Tu experiencia",
  experienceP: "Cuidar, cocinar, limpiar o coser en casa también es experiencia.",
  expLabel: "Cuéntanos qué sabes hacer",
  expPh: "Habla o escribe libremente. Ej: he cuidado a mis tres hijos y a mi madre, cocino para 10 personas, organizo la casa...",
  photo: "Tu foto",
  photoP: "La recortamos y le ponemos fondo profesional automáticamente.",
  cv: "Tu currículum",
  cvP: "Elige el diseño. Todos están preparados para los filtros automáticos (ATS).",
  sections: "Ordena y edita las secciones",
  sectionsP: "Sube, baja, oculta o edita. Verás los cambios al momento.",
  atsTitle: "Revisión ATS",
  atsP: "Puntuación y consejos antes de descargar.",
  keywords: "Palabras clave sugeridas",
  downloadPdf: "Descargar PDF",
  downloadDocx: "Descargar Word (DOCX)",
  translatedPdf: "PDF traducido al español",
  shareLink: "Crear enlace para compartir",
  print: "Imprimir",
  startOver: "Empezar otro",
  cloud: "Guardar en la nube",
  cloudP: "Entra con tu correo y retoma tu CV en otro móvil u ordenador.",
  signIn: "Entrar",
  signUp: "Crear cuenta",
  signOut: "Salir",
  saveCloud: "Guardar en la nube",
  loadCloud: "Recuperar de la nube",
  voiceOn: "Voz activada",
  voiceOff: "Voz apagada",
  readStep: "Leer este paso",
  dictate: "Hablar",
  listening: "Escuchando...",
  translate: "Traducir al español",
  music: "Música",
  musicOff: "Silencio",
  focus: "Concentración",
  motivation: "Motivación",
  relax: "Relajación",
};

const fr: Dict = {
  ...es,
  kicker: "Atelier emploi",
  title: "Mon CV, mon histoire",
  subtitle: "Touchez les images. Chaque étape construit votre CV.",
  steps: ["Bienvenue", "Vos données", "Études", "Qualités", "Expérience", "Votre photo", "Votre CV"],
  stepIntro: [
    "Bonjour. Nous allons créer votre CV ensemble, étape par étape. Choisissez votre langue.",
    "Écrivez votre nom, votre téléphone, votre e-mail et votre ville. Les entreprises pourront vous appeler.",
    "Parlez-nous de vos études. Si vous n'avez pas de diplôme, ce n'est pas grave.",
    "Touchez les images de ce que vous savez bien faire. Jusqu'à huit choix.",
    "S'occuper des enfants, cuisiner, nettoyer ou coudre à la maison, c'est aussi de l'expérience.",
    "Maintenant votre photo. Prenez une photo ou choisissez-en une. Nous la recadrons avec un fond professionnel.",
    "Votre CV est prêt. Choisissez le modèle, vérifiez le score et téléchargez-le en PDF ou en Word.",
  ],
  chooseLang: "Choisissez votre langue",
  welcomeH: "Bonjour ! Créons votre CV",
  welcomeP: "Pas besoin de diplômes ni d'emploi précédent. Ce que vous savez faire compte aussi.",
  tip: "Touchez le haut-parleur pour écouter, le micro pour parler et la musique pour vous accompagner.",
  back: "Retour",
  next: "Suivant",
  seeCv: "Voir mon CV",
  resumeMsg: "Vous avez un CV en cours sur cet appareil.",
  resumeGo: "Continuer",
  resumeNew: "Recommencer",
  name: "Nom complet",
  phone: "Téléphone",
  email: "E-mail",
  city: "Ville",
  bio: "Présentez-vous en une phrase",
  namePh: "Écrivez votre nom",
  bioPh: "Personne responsable, motivée pour apprendre et travailler en équipe",
  studies: "Études",
  studiesP: "Même sans diplôme officiel. Si vous n'en avez pas, ce n'est pas grave.",
  degree: "Diplôme ou spécialité",
  year: "Année (env.)",
  place: "Établissement ou pays",
  addStudy: "Ajouter une formation",
  removeStudy: "Supprimer",
  qualities: "Vos qualités",
  qualitiesP: "Touchez jusqu'à 8 images qui vous représentent.",
  chosen: "choisies",
  experience: "Votre expérience",
  experienceP: "Le travail à la maison est aussi une expérience.",
  expLabel: "Racontez ce que vous savez faire",
  expPh: "Parlez ou écrivez librement...",
  photo: "Votre photo",
  photoP: "Nous la recadrons avec un fond professionnel.",
  cv: "Votre CV",
  cvP: "Choisissez le modèle. Tous sont compatibles ATS.",
  sections: "Réorganisez les sections",
  sectionsP: "Montez, descendez, masquez ou modifiez. Aperçu en direct.",
  atsTitle: "Vérification ATS",
  atsP: "Score et conseils avant le téléchargement.",
  keywords: "Mots-clés suggérés",
  downloadPdf: "Télécharger le PDF",
  downloadDocx: "Télécharger Word (DOCX)",
  translatedPdf: "PDF traduit en espagnol",
  shareLink: "Créer un lien à partager",
  print: "Imprimer",
  startOver: "Recommencer",
  cloud: "Sauvegarde en ligne",
  cloudP: "Connectez-vous et reprenez votre CV sur un autre appareil.",
  signIn: "Se connecter",
  signUp: "Créer un compte",
  signOut: "Se déconnecter",
  saveCloud: "Sauvegarder en ligne",
  loadCloud: "Récupérer en ligne",
  voiceOn: "Voix activée",
  voiceOff: "Voix coupée",
  readStep: "Lire cette étape",
  dictate: "Parler",
  listening: "J'écoute...",
  translate: "Traduire en espagnol",
  music: "Musique",
  musicOff: "Silence",
  focus: "Concentration",
  motivation: "Motivation",
  relax: "Relaxation",
};

const en: Dict = {
  ...es,
  kicker: "Employability workshop",
  title: "My CV, my story",
  subtitle: "Tap the pictures. Every step builds your CV.",
  steps: ["Welcome", "Your details", "Education", "Strengths", "Experience", "Your photo", "Your CV"],
  stepIntro: [
    "Hello. Let's build your CV together, step by step. Choose your language.",
    "Write your name, phone, email and city, so employers can call you.",
    "Tell us about your studies. No formal studies? That is absolutely fine.",
    "Tap the pictures of the things you do well. You can pick up to eight.",
    "Caring, cooking, cleaning or sewing at home is experience too.",
    "Now your photo. Take one with the camera or choose one. We crop it and add a professional background.",
    "Your CV is ready. Choose a design, check the score and download it as PDF or Word.",
  ],
  chooseLang: "Choose your language",
  welcomeH: "Hi! Let's build your CV",
  welcomeP: "You don't need a degree or previous jobs. What you know how to do counts too.",
  tip: "Tap the speaker to listen, the microphone to talk instead of typing, and music to keep you company.",
  back: "Back",
  next: "Next",
  seeCv: "See my CV",
  resumeMsg: "You have an unfinished CV on this device.",
  resumeGo: "Continue",
  resumeNew: "Start fresh",
  name: "Full name",
  phone: "Phone",
  email: "Email",
  city: "City",
  bio: "Introduce yourself in one line",
  namePh: "Type your name",
  bioPh: "Reliable person, eager to learn and work in a team",
  studies: "Education",
  studiesP: "Even from your country or without an official certificate.",
  degree: "Course or speciality",
  year: "Year (approx.)",
  place: "School or country",
  addStudy: "Add another course",
  removeStudy: "Remove",
  qualities: "Your strengths",
  qualitiesP: "Tap up to 8 pictures that describe you.",
  chosen: "selected",
  experience: "Your experience",
  experienceP: "Work at home is experience too.",
  expLabel: "Tell us what you can do",
  expPh: "Speak or write freely...",
  photo: "Your photo",
  photoP: "We crop it and add a professional background.",
  cv: "Your CV",
  cvP: "Choose the design. All of them are ATS friendly.",
  sections: "Reorder and edit sections",
  sectionsP: "Move up, move down, hide or edit. Live preview.",
  atsTitle: "ATS check",
  atsP: "Score and tips before you download.",
  keywords: "Suggested keywords",
  downloadPdf: "Download PDF",
  downloadDocx: "Download Word (DOCX)",
  translatedPdf: "PDF translated into Spanish",
  shareLink: "Create share link",
  print: "Print",
  startOver: "Start another",
  cloud: "Cloud backup",
  cloudP: "Sign in and continue your CV on another device.",
  signIn: "Sign in",
  signUp: "Sign up",
  signOut: "Sign out",
  saveCloud: "Save to cloud",
  loadCloud: "Restore from cloud",
  voiceOn: "Voice on",
  voiceOff: "Voice off",
  readStep: "Read this step",
  dictate: "Speak",
  listening: "Listening...",
  translate: "Translate into Spanish",
  music: "Music",
  musicOff: "Mute",
  focus: "Focus",
  motivation: "Motivation",
  relax: "Relax",
};

const ar: Dict = {
  ...es,
  kicker: "ورشة التوظيف",
  title: "سيرتي، حكايتي",
  subtitle: "المسي الصور. كل خطوة تبني سيرتك الذاتية.",
  steps: ["أهلاً", "بياناتك", "الدراسة", "مهاراتك", "الخبرة", "صورتك", "سيرتك"],
  stepIntro: [
    "مرحباً. سنصنع سيرتك الذاتية معاً خطوة بخطوة. اختاري لغتك.",
    "اكتبي اسمك ورقم هاتفك وبريدك ومدينتك، حتى تتمكن الشركات من الاتصال بك.",
    "أخبرينا عن دراستك. إن لم تكن لديك شهادات فلا مشكلة.",
    "المسي صور الأشياء التي تجيدينها. يمكنك اختيار حتى ثمانية.",
    "رعاية الأطفال والطبخ والتنظيف والخياطة في البيت خبرة أيضاً.",
    "الآن صورتك. التقطي صورة أو اختاري واحدة، وسنضيف خلفية احترافية.",
    "سيرتك جاهزة. اختاري التصميم وراجعي التقييم ثم حمّليها بصيغة PDF أو Word.",
  ],
  chooseLang: "اختاري لغتك",
  welcomeH: "مرحباً! لنصنع سيرتك الذاتية",
  welcomeP: "لا تحتاجين شهادات ولا عملاً سابقاً. ما تعرفين عمله له قيمة.",
  tip: "المسي السماعة للاستماع، والميكروفون للتحدث بدل الكتابة، والموسيقى لترافقك.",
  back: "رجوع",
  next: "التالي",
  seeCv: "عرض سيرتي",
  resumeMsg: "لديك سيرة ذاتية غير مكتملة على هذا الجهاز.",
  resumeGo: "متابعة",
  resumeNew: "البدء من جديد",
  name: "الاسم الكامل",
  phone: "الهاتف",
  email: "البريد الإلكتروني",
  city: "المدينة",
  bio: "عرّفي بنفسك في سطر",
  namePh: "اكتبي اسمك",
  bioPh: "شخص مسؤول، لديه رغبة في التعلم والعمل ضمن فريق",
  studies: "الدراسة",
  studiesP: "حتى لو كانت من بلدك أو بدون شهادة رسمية.",
  degree: "الشهادة أو التخصص",
  year: "السنة (تقريباً)",
  place: "المركز أو البلد",
  addStudy: "إضافة دراسة أخرى",
  removeStudy: "حذف",
  qualities: "مهاراتك",
  qualitiesP: "المسي حتى ٨ صور تعبّر عنك.",
  chosen: "مختارة",
  experience: "خبرتك",
  experienceP: "العمل في البيت خبرة أيضاً.",
  expLabel: "أخبرينا بما تعرفين عمله",
  expPh: "تحدثي أو اكتبي بحرية...",
  photo: "صورتك",
  photoP: "نقصّها ونضيف خلفية احترافية.",
  cv: "سيرتك الذاتية",
  cvP: "اختاري التصميم. جميعها متوافقة مع أنظمة ATS.",
  sections: "رتّبي الأقسام",
  sectionsP: "حرّكي أو أخفي أو عدّلي، مع معاينة فورية.",
  atsTitle: "فحص ATS",
  atsP: "التقييم والنصائح قبل التحميل.",
  keywords: "كلمات مفتاحية مقترحة",
  downloadPdf: "تحميل PDF",
  downloadDocx: "تحميل Word (DOCX)",
  translatedPdf: "PDF مترجم إلى الإسبانية",
  shareLink: "إنشاء رابط للمشاركة",
  print: "طباعة",
  startOver: "البدء من جديد",
  cloud: "الحفظ في السحابة",
  cloudP: "سجّلي الدخول وتابعي سيرتك من جهاز آخر.",
  signIn: "دخول",
  signUp: "إنشاء حساب",
  signOut: "خروج",
  saveCloud: "حفظ في السحابة",
  loadCloud: "استعادة من السحابة",
  voiceOn: "الصوت مفعل",
  voiceOff: "الصوت مغلق",
  readStep: "اقرأ هذه الخطوة",
  dictate: "تحدثي",
  listening: "أستمع...",
  translate: "ترجمة إلى الإسبانية",
  music: "موسيقى",
  musicOff: "كتم",
  focus: "تركيز",
  motivation: "تحفيز",
  relax: "استرخاء",
};

export const DICTS: Record<UiLang, Dict> = { es, fr, en, ar };
export const t = (lang: UiLang): Dict => DICTS[lang] ?? es;
