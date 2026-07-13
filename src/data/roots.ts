import { sarfmateArabicVerbsCsv } from "@/data/importedArabicVerbsCsv";
import {
  FORM_LABELS,
  type ImportedVerbSource,
  type RootEntry,
  type RootVerbEntry,
  type SarfForm,
  type SarfFormKey,
  type VerbMeasure,
} from "@/lib/types";
import { QUTRUB_VERIFIED_FORMS } from "@/data/qutrubVerification";
import { QABAS_VERIFIED_FORMS } from "@/data/qabasVerification";
import { CALIMA_VERIFIED_FORMS } from "@/data/calimaVerification";
import { PARTICIPLE_VERIFIED_FORMS } from "@/data/participleVerification";
import { ELIXIRFM_VERIFIED_FORMS } from "@/data/elixirfmVerification";

const label = (key: SarfFormKey) => FORM_LABELS[key];
const AI_DRAFT_NOTE = "AI draft; verify before marking reviewed.";

type DraftPattern = {
  root: string;
  meaningEn: string;
  past: string;
  present: string;
  imperative: string;
  place: string;
  active: string;
  passive: string;
  transliterationBase: string;
  transliterations?: Partial<Record<SarfFormKey, string>>;
  formNotes?: Partial<Record<SarfFormKey, string>>;
  /** Verb measure/pattern annotation (e.g. "Form IV verb"), appended to the root-level AI-draft note. */
  rootNote?: string;
  /** Classical verb measure (وزن). Defaults to "I" for the sound/weak Form-I seed batch. */
  measure?: VerbMeasure;
  formMeanings: {
    past: string;
    present: string;
    imperative: string;
    place: string;
    active: string;
    passive: string;
  };
};

type DraftExample = {
  exampleAr: string;
  exampleEn: string;
};

const reviewExamples: Record<string, Partial<Record<SarfFormKey, DraftExample>>> = {
  أخذ: {
    past: { exampleAr: "أَخَذَ الوَلَدُ القَلَمَ.", exampleEn: "The boy took the pen." },
    present: { exampleAr: "يَأْخُذُ الطَّالِبُ الكِتَابَ.", exampleEn: "The student takes the book." },
    imperative: { exampleAr: "خُذْ هٰذَا.", exampleEn: "Take this." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَأْخَذٌ مُهِمٌّ.", exampleEn: "This is an important source or point." },
    active_participle: { exampleAr: "الآخِذُ يَحْمِلُ القَلَمَ.", exampleEn: "The taker carries the pen." },
    passive_participle: { exampleAr: "القَلَمُ مَأْخُوذٌ.", exampleEn: "The pen has been taken." },
  },
  أكل: {
    past: { exampleAr: "أَكَلَ الوَلَدُ الخُبْزَ.", exampleEn: "The boy ate the bread." },
    present: { exampleAr: "يَأْكُلُ الطِّفْلُ تُفَّاحَةً.", exampleEn: "The child eats an apple." },
    imperative: { exampleAr: "كُلْ هٰذَا.", exampleEn: "Eat this." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَأْكَلٌ نَظِيفٌ.", exampleEn: "This is a clean eating place." },
    active_participle: { exampleAr: "الآكِلُ جَالِسٌ.", exampleEn: "The eater is sitting." },
    passive_participle: { exampleAr: "الخُبْزُ مَأْكُولٌ.", exampleEn: "The bread has been eaten." },
  },
  حبس: {
    past: { exampleAr: "حَبَسَ الحَارِسُ اللِّصَّ.", exampleEn: "The guard imprisoned the thief." },
    present: { exampleAr: "يَحْبِسُ الحَارِسُ اللِّصَّ.", exampleEn: "The guard imprisons the thief." },
    imperative: { exampleAr: "اِحْبِسْ هٰذَا البَابَ.", exampleEn: "Hold this door shut." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَحْبِسٌ صَغِيرٌ.", exampleEn: "This is a small place of confinement." },
    active_participle: { exampleAr: "الحَارِسُ حَابِسٌ لِلِّصِّ.", exampleEn: "The guard is holding the thief." },
    passive_participle: { exampleAr: "اللِّصُّ مَحْبُوسٌ.", exampleEn: "The thief is imprisoned." },
  },
  سأل: {
    past: { exampleAr: "سَأَلَ الطَّالِبُ سُؤَالًا.", exampleEn: "The student asked a question." },
    present: { exampleAr: "يَسْأَلُ الطَّالِبُ المُعَلِّمَ.", exampleEn: "The student asks the teacher." },
    imperative: { exampleAr: "اِسْأَلْ زَيْدًا.", exampleEn: "Ask Zayd." },
    place_or_mim_masdar: { exampleAr: "هٰذِهِ مَسْأَلَةٌ سَهْلَةٌ.", exampleEn: "This is an easy question." },
    active_participle: { exampleAr: "السَّائِلُ يَنْتَظِرُ الجَوَابَ.", exampleEn: "The questioner waits for the answer." },
    passive_participle: { exampleAr: "هُوَ مَسْؤُولٌ عَنِ البَيْتِ.", exampleEn: "He is responsible for the house." },
  },
  طبخ: {
    past: { exampleAr: "طَبَخَ الرَّجُلُ الطَّعَامَ.", exampleEn: "The man cooked the food." },
    present: { exampleAr: "يَطْبُخُ الطَّابِخُ الطَّعَامَ.", exampleEn: "The cook cooks the food." },
    imperative: { exampleAr: "اُطْبُخْ هٰذَا.", exampleEn: "Cook this." },
    place_or_mim_masdar: { exampleAr: "المَطْبَخُ نَظِيفٌ.", exampleEn: "The kitchen is clean." },
    active_participle: { exampleAr: "الطَّابِخُ مَاهِرٌ.", exampleEn: "The cook is skilled." },
    passive_participle: { exampleAr: "الطَّعَامُ مَطْبُوخٌ.", exampleEn: "The food is cooked." },
  },
  طلب: {
    past: { exampleAr: "طَلَبَ الطَّالِبُ كِتَابًا.", exampleEn: "The student requested a book." },
    present: { exampleAr: "يَطْلُبُ الرَّجُلُ العَمَلَ.", exampleEn: "The man seeks work." },
    imperative: { exampleAr: "اُطْلُبْ عِلْمًا.", exampleEn: "Seek knowledge." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَطْلَبٌ مُهِمٌّ.", exampleEn: "This is an important request." },
    active_participle: { exampleAr: "الطَّالِبُ فِي الفَصْلِ.", exampleEn: "The student is in the classroom." },
    passive_participle: { exampleAr: "الكِتَابُ مَطْلُوبٌ.", exampleEn: "The book is requested." },
  },
  قرأ: {
    past: { exampleAr: "قَرَأَ الوَلَدُ كِتَابًا.", exampleEn: "The boy read a book." },
    present: { exampleAr: "يَقْرَأُ الطَّالِبُ الدَّرْسَ.", exampleEn: "The student reads the lesson." },
    imperative: { exampleAr: "اِقْرَأْ هٰذَا.", exampleEn: "Read this." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَقْرَأٌ هَادِئٌ.", exampleEn: "This is a quiet reading place." },
    active_participle: { exampleAr: "القَارِئُ يَقْرَأُ بِصَوْتٍ وَاضِحٍ.", exampleEn: "The reader reads in a clear voice." },
    passive_participle: { exampleAr: "النَّصُّ مَقْرُوءٌ.", exampleEn: "The text has been read." },
  },
  وضع: {
    past: { exampleAr: "وَضَعَ الطَّالِبُ الكِتَابَ عَلَى المَكْتَبِ.", exampleEn: "The student put the book on the desk." },
    present: { exampleAr: "يَضَعُ الوَلَدُ القَلَمَ هُنَا.", exampleEn: "The boy puts the pen here." },
    imperative: { exampleAr: "ضَعْ هٰذَا هُنَا.", exampleEn: "Put this here." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَوْضِعٌ مُنَاسِبٌ.", exampleEn: "This is a suitable place." },
    active_participle: { exampleAr: "هُوَ وَاضِعُ الكِتَابِ هُنَا.", exampleEn: "He is the one who placed the book here." },
    passive_participle: { exampleAr: "الكِتَابُ مَوْضُوعٌ عَلَى المَكْتَبِ.", exampleEn: "The book is placed on the desk." },
  },
  وعد: {
    past: { exampleAr: "وَعَدَ الأَبُ الطِّفْلَ.", exampleEn: "The father promised the child." },
    present: { exampleAr: "يَعِدُ الصَّدِيقُ صَدِيقَهُ.", exampleEn: "The friend promises his friend." },
    imperative: { exampleAr: "عِدْ صَدِيقَكَ.", exampleEn: "Promise your friend." },
    place_or_mim_masdar: { exampleAr: "المَوْعِدُ غَدًا.", exampleEn: "The appointment is tomorrow." },
    active_participle: { exampleAr: "هُوَ وَاعِدٌ صَدِيقَهُ.", exampleEn: "He is promising his friend." },
    passive_participle: { exampleAr: "الطِّفْلُ مَوْعُودٌ بِجَائِزَةٍ.", exampleEn: "The child is promised a prize." },
  },
  وجد: {
    past: { exampleAr: "وَجَدَ الرَّجُلُ المِفْتَاحَ.", exampleEn: "The man found the key." },
    present: { exampleAr: "يَجِدُ الطَّالِبُ الحَلَّ.", exampleEn: "The student finds the solution." },
    imperative: { exampleAr: "جِدْ طَرِيقًا.", exampleEn: "Find a way." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَوْجِدُ الشَّيْءِ.", exampleEn: "This is the place where the thing is found." },
    active_participle: { exampleAr: "الوَاجِدُ يَفْرَحُ.", exampleEn: "The finder is happy." },
    passive_participle: { exampleAr: "المِفْتَاحُ مَوْجُودٌ.", exampleEn: "The key is found / present." },
  },
  وصل: {
    past: { exampleAr: "وَصَلَ الطَّالِبُ إِلَى البَيْتِ.", exampleEn: "The student arrived at the house." },
    present: { exampleAr: "يَصِلُ القِطَارُ صَبَاحًا.", exampleEn: "The train arrives in the morning." },
    imperative: { exampleAr: "صِلْ إِلَى البَابِ.", exampleEn: "Reach the door." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَوْصِلُ الطَّرِيقَيْنِ.", exampleEn: "This is the junction of the two roads." },
    active_participle: { exampleAr: "هُوَ وَاصِلٌ إِلَى البَيْتِ.", exampleEn: "He is arriving at the house." },
    passive_participle: { exampleAr: "الحَبْلُ مَوْصُولٌ بِالبَابِ.", exampleEn: "The rope is connected to the door." },
  },
  وقف: {
    past: { exampleAr: "وَقَفَ الرَّجُلُ هُنَا.", exampleEn: "The man stood here." },
    present: { exampleAr: "يَقِفُ الطَّالِبُ أَمَامَ البَابِ.", exampleEn: "The student stands in front of the door." },
    imperative: { exampleAr: "قِفْ هُنَا.", exampleEn: "Stand here." },
    place_or_mim_masdar: { exampleAr: "مَوْقِفُ السَّيَّارَةِ قَرِيبٌ.", exampleEn: "The car's parking place is nearby." },
    active_participle: { exampleAr: "الرَّجُلُ وَاقِفٌ.", exampleEn: "The man is standing." },
    passive_participle: { exampleAr: "العَمَلُ مَوْقُوفٌ.", exampleEn: "The work is stopped / suspended." },
  },
  كسر: {
    past: { exampleAr: "كَسَرَ الوَلَدُ الكُوبَ.", exampleEn: "The boy broke the cup." },
    present: { exampleAr: "يَكْسِرُ العَامِلُ الحَجَرَ.", exampleEn: "The worker breaks the stone." },
    imperative: { exampleAr: "اِكْسِرْ هٰذَا الخَشَبَ.", exampleEn: "Break this wood." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَكْسِرُ الحَجَرِ.", exampleEn: "This is the breaking point of the stone." },
    active_participle: { exampleAr: "العَامِلُ كَاسِرُ الحَجَرِ.", exampleEn: "The worker is the breaker of the stone." },
    passive_participle: { exampleAr: "الكُوبُ مَكْسُورٌ.", exampleEn: "The cup is broken." },
  },
  حسب: {
    past: { exampleAr: "حَسَبَ المُعَلِّمُ النَّتِيجَةَ.", exampleEn: "The teacher calculated the result." },
    present: { exampleAr: "يَحْسِبُ الطَّالِبُ العَدَدَ.", exampleEn: "The student calculates the number." },
    imperative: { exampleAr: "اِحْسَبْ الثَّمَنَ.", exampleEn: "Calculate the price." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَحْسَبُ النَّتِيجَةِ.", exampleEn: "This is the calculation point for the result." },
    active_participle: { exampleAr: "المُحَاسِبُ حَاسِبٌ لِلْمَالِ.", exampleEn: "The accountant is calculating the money." },
    passive_participle: { exampleAr: "المَبْلَغُ مَحْسُوبٌ.", exampleEn: "The amount is calculated." },
  },
  سهر: {
    past: { exampleAr: "سَهِرَ الطَّالِبُ لَيْلًا.", exampleEn: "The student stayed awake at night." },
    present: { exampleAr: "يَسْهَرُ الحَارِسُ فِي اللَّيْلِ.", exampleEn: "The guard stays awake at night." },
    imperative: { exampleAr: "اِسْهَرْ مَعَ المَرِيضِ.", exampleEn: "Stay awake with the sick person." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَسْهَرُ الحَارِسِ.", exampleEn: "This is the guard's place of wakefulness." },
    active_participle: { exampleAr: "الحَارِسُ سَاهِرٌ.", exampleEn: "The guard is awake." },
    passive_participle: { exampleAr: "اللَّيْلُ مَسْهُورٌ فِيهِ.", exampleEn: "The night is one in which people stayed awake." },
  },
  صعب: {
    past: { exampleAr: "صَعُبَ الدَّرْسُ عَلَى الطَّالِبِ.", exampleEn: "The lesson was difficult for the student." },
    present: { exampleAr: "يَصْعُبُ السُّؤَالُ عَلَى الوَلَدِ.", exampleEn: "The question is difficult for the boy." },
    imperative: { exampleAr: "اُصْعُبْ فِي التَّدْرِيبِ لَا فِي الشَّرْحِ.", exampleEn: "Be difficult in the exercise, not in the explanation." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَصْعَبُ المَسْأَلَةِ.", exampleEn: "This is the difficult point of the issue." },
    active_participle: { exampleAr: "السُّؤَالُ صَاعِبٌ عَلَى المُبْتَدِئِ.", exampleEn: "The question is difficult for the beginner." },
    passive_participle: { exampleAr: "الأَمْرُ مَصْعُوبٌ عَلَى الطِّفْلِ.", exampleEn: "The matter has been made difficult for the child." },
  },
  طلق: {
    past: { exampleAr: "طَلَقَ اللِّسَانُ بَعْدَ التَّدْرِيبِ.", exampleEn: "The tongue became fluent after practice." },
    present: { exampleAr: "يَطْلُقُ الكَلَامُ مِنْهُ بِسُهُولَةٍ.", exampleEn: "Speech flows from him easily." },
    imperative: { exampleAr: "اُطْلُقْ فِي كَلَامِكَ.", exampleEn: "Be fluent in your speech." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَطْلَقُ الكَلَامِ.", exampleEn: "This is the starting point of the speech." },
    active_participle: { exampleAr: "المُتَكَلِّمُ طَالِقُ اللِّسَانِ.", exampleEn: "The speaker is fluent of tongue." },
    passive_participle: { exampleAr: "الجَوَادُ مَطْلُوقٌ فِي المَيْدَانِ.", exampleEn: "The horse is released in the field." },
  },
  عمر: {
    past: { exampleAr: "عَمَرَ النَّاسُ البَيْتَ.", exampleEn: "The people inhabited the house." },
    present: { exampleAr: "يَعْمُرُ الأَهْلُ المَكَانَ.", exampleEn: "The family inhabits the place." },
    imperative: { exampleAr: "اُعْمُرْ هٰذَا البَيْتَ بِالخَيْرِ.", exampleEn: "Fill this house with good." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَعْمَرُ الأُسْرَةِ.", exampleEn: "This is the family's dwelling place." },
    active_participle: { exampleAr: "الرَّجُلُ عَامِرٌ لِلبَيْتِ.", exampleEn: "The man is inhabiting the house." },
    passive_participle: { exampleAr: "البَيْتُ مَعْمُورٌ بِأَهْلِهِ.", exampleEn: "The house is inhabited by its people." },
  },
  برك: {
    past: { exampleAr: "بَرَكَ الجَمَلُ عِنْدَ الخَيْمَةِ.", exampleEn: "The camel knelt by the tent." },
    present: { exampleAr: "يَبْرُكُ الجَمَلُ بَعْدَ السَّيْرِ.", exampleEn: "The camel kneels after walking." },
    imperative: { exampleAr: "اُبْرُكْ هُنَا.", exampleEn: "Kneel here." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَبْرَكُ الجَمَلِ.", exampleEn: "This is the camel's kneeling place." },
    active_participle: { exampleAr: "الجَمَلُ بَارِكٌ أَمَامَ البَيْتِ.", exampleEn: "The camel is kneeling in front of the house." },
    passive_participle: { exampleAr: "الجَمَلُ مَبْرُوكٌ عِنْدَ البَابِ.", exampleEn: "The camel has been made to kneel by the door." },
  },
  جهد: {
    past: { exampleAr: "جَهَدَ الطَّالِبُ فِي الدَّرْسِ.", exampleEn: "The student strove in the lesson." },
    present: { exampleAr: "يَجْهَدُ العَامِلُ فِي عَمَلِهِ.", exampleEn: "The worker exerts himself in his work." },
    imperative: { exampleAr: "اِجْهَدْ فِي التَّدْرِيبِ.", exampleEn: "Strive in the exercise." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَجْهَدُ الطَّالِبِ.", exampleEn: "This is the student's place or point of effort." },
    active_participle: { exampleAr: "الطَّالِبُ جَاهِدٌ فِي طَلَبِ العِلْمِ.", exampleEn: "The student is striving in seeking knowledge." },
    passive_participle: { exampleAr: "هٰذَا عَمَلٌ مَجْهُودٌ.", exampleEn: "This is work into which effort has been put." },
  },
  ورث: {
    past: { exampleAr: "وَرِثَ الوَلَدُ البَيْتَ.", exampleEn: "The boy inherited the house." },
    present: { exampleAr: "يَرِثُ الابْنُ مَالَ أَبِيهِ.", exampleEn: "The son inherits his father's wealth." },
    imperative: { exampleAr: "رِثْ عِلْمَ أَهْلِكَ.", exampleEn: "Inherit the knowledge of your family." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَوْرِثُ المَالِ.", exampleEn: "This is the source of the inherited wealth." },
    active_participle: { exampleAr: "الابْنُ وَارِثٌ لِلْبَيْتِ.", exampleEn: "The son is heir to the house." },
    passive_participle: { exampleAr: "البَيْتُ مَوْرُوثٌ.", exampleEn: "The house is inherited." },
  },
  وقد: {
    past: { exampleAr: "وَقَدَتِ النَّارُ فِي اللَّيْلِ.", exampleEn: "The fire burned at night." },
    present: { exampleAr: "تَقِدُ النَّارُ فِي المَوْقِدِ.", exampleEn: "The fire burns in the fireplace." },
    imperative: { exampleAr: "قِدْ يَا نَارُ بِهُدُوءٍ.", exampleEn: "Burn calmly, fire." },
    place_or_mim_masdar: { exampleAr: "المَوْقِدُ قَرِيبٌ مِنَ البَابِ.", exampleEn: "The fireplace is near the door." },
    active_participle: { exampleAr: "النَّارُ وَاقِدَةٌ.", exampleEn: "The fire is burning." },
    passive_participle: { exampleAr: "الحَطَبُ مَوْقُودٌ.", exampleEn: "The wood is kindled." },
  },
  وقع: {
    past: { exampleAr: "وَقَعَ الكِتَابُ عَلَى الأَرْضِ.", exampleEn: "The book fell on the ground." },
    present: { exampleAr: "يَقَعُ البَيْتُ قُرْبَ المَسْجِدِ.", exampleEn: "The house is located near the mosque." },
    imperative: { exampleAr: "قَعْ عَلَى الخَطِّ.", exampleEn: "Fall on the line." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَوْقِعُ البَيْتِ.", exampleEn: "This is the location of the house." },
    active_participle: { exampleAr: "الأَمْرُ وَاقِعٌ اليَوْمَ.", exampleEn: "The matter is happening today." },
    passive_participle: { exampleAr: "الخَطَأُ مَوْقُوعٌ فِيهِ.", exampleEn: "The mistake has been fallen into." },
  },
  ملأ: {
    past: { exampleAr: "مَلَأَ الوَلَدُ الكَأْسَ.", exampleEn: "The boy filled the cup." },
    present: { exampleAr: "يَمْلَأُ الرَّجُلُ الصُّنْدُوقَ.", exampleEn: "The man fills the box." },
    imperative: { exampleAr: "اِمْلَأِ الكَأْسَ.", exampleEn: "Fill the cup." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَمْلَأُ الخَزَّانِ.", exampleEn: "This is the filling point of the tank." },
    active_participle: { exampleAr: "العَامِلُ مَالِئٌ الخَزَّانَ.", exampleEn: "The worker is filling the tank." },
    passive_participle: { exampleAr: "الكَأْسُ مَمْلُوءٌ.", exampleEn: "The cup is full." },
  },
  مرر: {
    past: { exampleAr: "مَرَّ الرَّجُلُ بِالبَابِ.", exampleEn: "The man passed by the door." },
    present: { exampleAr: "يَمُرُّ القِطَارُ هُنَا.", exampleEn: "The train passes here." },
    imperative: { exampleAr: "مُرَّ مِنْ هُنَا.", exampleEn: "Pass by here." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَمَرٌّ ضَيِّقٌ.", exampleEn: "This is a narrow passageway." },
    active_participle: { exampleAr: "الرَّجُلُ مَارٌّ بِالسُّوقِ.", exampleEn: "The man is passing by the market." },
    passive_participle: { exampleAr: "الطَّرِيقُ مَمْرُورٌ بِهِ يَوْمِيًّا.", exampleEn: "The road is passed by daily." },
  },
  نسخ: {
    past: { exampleAr: "نَسَخَ الطَّالِبُ الدَّرْسَ.", exampleEn: "The student copied the lesson." },
    present: { exampleAr: "يَنْسَخُ الكَاتِبُ النَّصَّ.", exampleEn: "The writer copies the text." },
    imperative: { exampleAr: "اِنْسَخْ هٰذِهِ الصَّفْحَةَ.", exampleEn: "Copy this page." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَنْسَخُ الوَثَائِقِ.", exampleEn: "This is the document copying place." },
    active_participle: { exampleAr: "هُوَ نَاسِخُ الكِتَابِ.", exampleEn: "He is the copier of the book." },
    passive_participle: { exampleAr: "النَّصُّ مَنْسُوخٌ فِي دَفْتَرٍ آخَرَ.", exampleEn: "The text is copied into another notebook." },
  },
  وضأ: {
    past: { exampleAr: "تَوَضَّأَ الرَّجُلُ قَبْلَ الصَّلَاةِ.", exampleEn: "The man performed ablution before the prayer." },
    present: { exampleAr: "يَتَوَضَّأُ الطَّالِبُ فِي المَسْجِدِ.", exampleEn: "The student performs ablution in the mosque." },
    imperative: { exampleAr: "تَوَضَّأْ قَبْلَ الصَّلَاةِ.", exampleEn: "Perform ablution before the prayer." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَوَضُّؤٌ كَامِلٌ.", exampleEn: "This is a complete ablution." },
    active_participle: { exampleAr: "الرَّجُلُ مُتَوَضِّئٌ الآنَ.", exampleEn: "The man is in a state of ablution now." },
    passive_participle: { exampleAr: "الوُضُوءُ مُتَوَضَّأٌ بِهِ.", exampleEn: "The ablution has been performed with it." },
  },
  يقظ: {
    past: { exampleAr: "اِسْتَيْقَظَ الوَلَدُ مُبَكِّرًا.", exampleEn: "The boy woke up early." },
    present: { exampleAr: "يَسْتَيْقِظُ الطَّالِبُ فِي السَّابِعَةِ.", exampleEn: "The student wakes up at seven." },
    imperative: { exampleAr: "اِسْتَيْقِظْ الآنَ.", exampleEn: "Wake up now." },
    place_or_mim_masdar: { exampleAr: "هٰذَا اِسْتِيقَاظٌ مُبَكِّرٌ.", exampleEn: "This is an early awakening." },
    active_participle: { exampleAr: "الوَلَدُ مُسْتَيْقِظٌ الآنَ.", exampleEn: "The boy is awake now." },
    passive_participle: { exampleAr: "النَّوْمُ مُسْتَيْقَظٌ مِنْهُ.", exampleEn: "The sleep is one that has been woken from." },
  },
  كنس: {
    past: { exampleAr: "كَنَسَ العَامِلُ الغُرْفَةَ.", exampleEn: "The worker swept the room." },
    present: { exampleAr: "يَكْنُسُ الوَلَدُ الحَدِيقَةَ.", exampleEn: "The boy sweeps the garden." },
    imperative: { exampleAr: "اُكْنُسْ هٰذَا المَكَانَ.", exampleEn: "Sweep this place." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَكْنَسٌ نَظِيفٌ.", exampleEn: "This is a clean sweeping place." },
    active_participle: { exampleAr: "العَامِلُ كَانِسٌ لِلْغُرْفَةِ.", exampleEn: "The worker is sweeping the room." },
    passive_participle: { exampleAr: "الشَّارِعُ مَكْنُوسٌ.", exampleEn: "The street is swept." },
  },
  كوي: {
    past: { exampleAr: "كَوَى الرَّجُلُ القَمِيصَ.", exampleEn: "The man ironed the shirt." },
    present: { exampleAr: "يَكْوِي الوَلَدُ الثَّوْبَ.", exampleEn: "The boy irons the garment." },
    imperative: { exampleAr: "اِكْوِ هٰذَا القَمِيصَ.", exampleEn: "Iron this shirt." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَكْوًى صَغِيرٌ.", exampleEn: "This is a small ironing place." },
    active_participle: { exampleAr: "هُوَ كَاوٍ لِلثَّوْبِ.", exampleEn: "He is ironing the garment." },
    passive_participle: { exampleAr: "القَمِيصُ مَكْوِيٌّ.", exampleEn: "The shirt is ironed." },
  },
  طوع: {
    past: { exampleAr: "اِسْتَطَاعَ الطَّالِبُ حَلَّ السُّؤَالِ.", exampleEn: "The student was able to solve the question." },
    present: { exampleAr: "يَسْتَطِيعُ الوَلَدُ السِّبَاحَةَ.", exampleEn: "The boy is able to swim." },
    imperative: { exampleAr: "اِسْتَطِعْ فِعْلَ هٰذَا.", exampleEn: "Be able to do this." },
    place_or_mim_masdar: { exampleAr: "هٰذِهِ اِسْتِطَاعَةٌ كَبِيرَةٌ.", exampleEn: "This is a great ability." },
    active_participle: { exampleAr: "الطَّالِبُ مُسْتَطِيعٌ لِلْعَمَلِ.", exampleEn: "The student is able to work." },
    passive_participle: { exampleAr: "الأَمْرُ مُسْتَطَاعٌ.", exampleEn: "The matter is achievable." },
  },
  بدأ: {
    past: { exampleAr: "بَدَأَ الدَّرْسُ مُبَكِّرًا.", exampleEn: "The lesson started early." },
    present: { exampleAr: "يَبْدَأُ الطَّالِبُ العَمَلَ.", exampleEn: "The student starts the work." },
    imperative: { exampleAr: "اِبْدَأْ الآنَ.", exampleEn: "Start now." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَبْدَأٌ مُهِمٌّ.", exampleEn: "This is an important principle." },
    active_participle: { exampleAr: "هُوَ بَادِئٌ بِالعَمَلِ.", exampleEn: "He is starting the work." },
    passive_participle: { exampleAr: "العَمَلُ مَبْدُوءٌ.", exampleEn: "The work has been begun." },
  },
  نهي: {
    past: { exampleAr: "اِنْتَهَى الدَّرْسُ.", exampleEn: "The lesson finished." },
    present: { exampleAr: "يَنْتَهِي الطَّالِبُ مِنَ الوَاجِبِ.", exampleEn: "The student finishes the homework." },
    imperative: { exampleAr: "اِنْتَهِ مِنْ عَمَلِكَ.", exampleEn: "Finish your work." },
    place_or_mim_masdar: { exampleAr: "هٰذَا اِنْتِهَاءٌ سَرِيعٌ.", exampleEn: "This is a quick ending." },
    active_participle: { exampleAr: "الوَقْتُ مُنْتَهٍ.", exampleEn: "The time is finished / expired." },
    passive_participle: { exampleAr: "وَصَلَ إِلَى مُنْتَهَى الطَّرِيقِ.", exampleEn: "He reached the end of the road." },
  },
  صحح: {
    past: { exampleAr: "صَحَّحَ المُعَلِّمُ الوَاجِبَ.", exampleEn: "The teacher corrected the homework." },
    present: { exampleAr: "يُصَحِّحُ الطَّالِبُ خَطَأَهُ.", exampleEn: "The student corrects his mistake." },
    imperative: { exampleAr: "صَحِّحْ هٰذَا الخَطَأَ.", exampleEn: "Correct this mistake." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَصْحِيحٌ دَقِيقٌ.", exampleEn: "This is a precise correction." },
    active_participle: { exampleAr: "المُعَلِّمُ مُصَحِّحٌ لِلْوَاجِبِ.", exampleEn: "The teacher is correcting the homework." },
    passive_participle: { exampleAr: "الوَاجِبُ مُصَحَّحٌ.", exampleEn: "The homework is corrected." },
  },
  حبب: {
    past: { exampleAr: "أَحَبَّ الوَلَدُ أُمَّهُ.", exampleEn: "The boy loved his mother." },
    present: { exampleAr: "يُحِبُّ الطَّالِبُ العِلْمَ.", exampleEn: "The student loves knowledge." },
    imperative: { exampleAr: "أَحِبَّ صَدِيقَكَ.", exampleEn: "Love your friend." },
    place_or_mim_masdar: { exampleAr: "هٰذَا حُبٌّ صَادِقٌ.", exampleEn: "This is sincere love." },
    active_participle: { exampleAr: "هُوَ مُحِبٌّ لِلْعِلْمِ.", exampleEn: "He is a lover of knowledge." },
    passive_participle: { exampleAr: "الوَلَدُ مُحَبٌّ مِنْ أُسْرَتِهِ.", exampleEn: "The boy is loved by his family." },
  },
  رسم: {
    past: { exampleAr: "رَسَمَ الطِّفْلُ صُورَةً.", exampleEn: "The child drew a picture." },
    present: { exampleAr: "يَرْسُمُ الفَنَّانُ لَوْحَةً.", exampleEn: "The artist draws a painting." },
    imperative: { exampleAr: "اُرْسُمْ بَيْتًا.", exampleEn: "Draw a house." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَرْسَمُ الفَنَّانِ.", exampleEn: "This is the artist's drawing studio." },
    active_participle: { exampleAr: "هُوَ رَاسِمُ الخَرِيطَةِ.", exampleEn: "He is the one drawing the map." },
    passive_participle: { exampleAr: "البَيْتُ مَرْسُومٌ عَلَى الوَرَقَةِ.", exampleEn: "The house is drawn on the paper." },
  },
  خير: {
    past: { exampleAr: "اِخْتَارَ الطَّالِبُ الكِتَابَ.", exampleEn: "The student chose the book." },
    present: { exampleAr: "يَخْتَارُ الوَلَدُ اللَّوْنَ.", exampleEn: "The boy chooses the color." },
    imperative: { exampleAr: "اِخْتَرْ هٰذَا الكِتَابَ.", exampleEn: "Choose this book." },
    place_or_mim_masdar: { exampleAr: "هٰذَا اِخْتِيَارٌ جَيِّدٌ.", exampleEn: "This is a good choice." },
    active_participle: { exampleAr: "الطَّالِبُ مُخْتَارٌ لِلْكِتَابِ.", exampleEn: "The student is the one choosing the book." },
    passive_participle: { exampleAr: "الكِتَابُ مُخْتَارٌ بِعِنَايَةٍ.", exampleEn: "The book is chosen carefully." },
  },
  روح: {
    past: { exampleAr: "اِسْتَرَاحَ الرَّجُلُ بَعْدَ العَمَلِ.", exampleEn: "The man rested after work." },
    present: { exampleAr: "يَسْتَرِيحُ الطَّالِبُ بَعْدَ الدَّرْسِ.", exampleEn: "The student rests after the lesson." },
    imperative: { exampleAr: "اِسْتَرِحْ قَلِيلًا.", exampleEn: "Rest a little." },
    place_or_mim_masdar: { exampleAr: "هٰذِهِ اِسْتِرَاحَةٌ جَمِيلَةٌ.", exampleEn: "This is a nice rest area." },
    active_participle: { exampleAr: "الرَّجُلُ مُسْتَرِيحٌ الآنَ.", exampleEn: "The man is relaxed now." },
    passive_participle: { exampleAr: "الوَقْتُ مُسْتَرَاحٌ فِيهِ.", exampleEn: "The time is one in which rest was taken." },
  },
  بقي: {
    past: { exampleAr: "بَقِيَ الوَلَدُ فِي البَيْتِ.", exampleEn: "The boy stayed in the house." },
    present: { exampleAr: "يَبْقَى الطَّالِبُ فِي المَدْرَسَةِ.", exampleEn: "The student stays at school." },
    imperative: { exampleAr: "اِبْقَ هُنَا.", exampleEn: "Stay here." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَبْقَى الطَّعَامِ.", exampleEn: "This is where the food remains." },
    active_participle: { exampleAr: "الطَّعَامُ بَاقٍ فِي الثَّلَّاجَةِ.", exampleEn: "The food remains in the fridge." },
    passive_participle: { exampleAr: "الأَثَرُ مَبْقِيٌّ عَلَيْهِ.", exampleEn: "The trace has been kept remaining." },
  },
  قضي: {
    past: { exampleAr: "قَضَى الطَّالِبُ يَوْمَهُ فِي المَكْتَبَةِ.", exampleEn: "The student spent his day in the library." },
    present: { exampleAr: "يَقْضِي الرَّجُلُ إِجَازَتَهُ فِي المَدِينَةِ.", exampleEn: "The man spends his vacation in the city." },
    imperative: { exampleAr: "اِقْضِ وَقْتَكَ بِالمُفِيدِ.", exampleEn: "Spend your time usefully." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَقْضَى الوَقْتِ.", exampleEn: "This is the place where time is spent." },
    active_participle: { exampleAr: "هُوَ قَاضٍ لِوَقْتِهِ فِي القِرَاءَةِ.", exampleEn: "He is one spending his time reading." },
    passive_participle: { exampleAr: "الوَقْتُ مَقْضِيٌّ فِي الدِّرَاسَةِ.", exampleEn: "The time is spent in studying." },
  },
  حضر: {
    past: { exampleAr: "حَضَرَ الطَّالِبُ الدَّرْسَ.", exampleEn: "The student attended the lesson." },
    present: { exampleAr: "يَحْضُرُ الرَّجُلُ الاجْتِمَاعَ.", exampleEn: "The man attends the meeting." },
    imperative: { exampleAr: "اُحْضُرْ الدَّرْسَ غَدًا.", exampleEn: "Attend the lesson tomorrow." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَحْضَرُ الاجْتِمَاعِ.", exampleEn: "This is the meeting's record / place of attendance." },
    active_participle: { exampleAr: "الطَّالِبُ حَاضِرٌ فِي الفَصْلِ.", exampleEn: "The student is present in the class." },
    passive_participle: { exampleAr: "الاجْتِمَاعُ مَحْضُورٌ مِنَ الجَمِيعِ.", exampleEn: "The meeting is attended by everyone." },
  },
  نقل: {
    past: { exampleAr: "اِنْتَقَلَ الرَّجُلُ إِلَى بَيْتٍ جَدِيدٍ.", exampleEn: "The man moved to a new house." },
    present: { exampleAr: "يَنْتَقِلُ الطَّالِبُ إِلَى مَدْرَسَةٍ أُخْرَى.", exampleEn: "The student transfers to another school." },
    imperative: { exampleAr: "اِنْتَقِلْ إِلَى هٰذَا المَكَانِ.", exampleEn: "Move to this place." },
    place_or_mim_masdar: { exampleAr: "هٰذَا اِنْتِقَالٌ سَرِيعٌ.", exampleEn: "This is a quick move." },
    active_participle: { exampleAr: "الرَّجُلُ مُنْتَقِلٌ إِلَى مَدِينَةٍ أُخْرَى.", exampleEn: "The man is moving to another city." },
    passive_participle: { exampleAr: "المَكْتَبُ مُنْتَقَلٌ إِلَيْهِ.", exampleEn: "The office is one that has been moved to." },
  },
  غرق: {
    past: { exampleAr: "اِسْتَغْرَقَ الاجْتِمَاعُ سَاعَةً.", exampleEn: "The meeting took an hour." },
    present: { exampleAr: "يَسْتَغْرِقُ الوَاجِبُ وَقْتًا طَوِيلًا.", exampleEn: "The homework takes a long time." },
    imperative: { exampleAr: "اِسْتَغْرِقْ وَقْتَكَ فِي التَّفْكِيرِ.", exampleEn: "Take your time thinking." },
    place_or_mim_masdar: { exampleAr: "هٰذَا اِسْتِغْرَاقٌ طَوِيلٌ فِي التَّفْكِيرِ.", exampleEn: "This is a long absorption in thought." },
    active_participle: { exampleAr: "الاجْتِمَاعُ مُسْتَغْرِقٌ سَاعَةً.", exampleEn: "The meeting is taking an hour." },
    passive_participle: { exampleAr: "الوَقْتُ مُسْتَغْرَقٌ فِي العَمَلِ.", exampleEn: "The time is absorbed in work." },
  },
  زحم: {
    past: { exampleAr: "اِزْدَحَمَ الشَّارِعُ صَبَاحًا.", exampleEn: "The street became crowded in the morning." },
    present: { exampleAr: "يَزْدَحِمُ السُّوقُ فِي العُطْلَةِ.", exampleEn: "The market gets crowded during the holiday." },
    imperative: { exampleAr: "اِزْدَحِمْ مَعَ النَّاسِ هُنَا.", exampleEn: "Crowd together with people here." },
    place_or_mim_masdar: { exampleAr: "هٰذَا اِزْدِحَامٌ كَبِيرٌ.", exampleEn: "This is heavy congestion." },
    active_participle: { exampleAr: "الشَّارِعُ مُزْدَحِمٌ اليَوْمَ.", exampleEn: "The street is crowded today." },
    passive_participle: { exampleAr: "المَكَانُ مُزْدَحَمٌ بِالنَّاسِ.", exampleEn: "The place is crowded with people." },
  },
  حجز: {
    past: { exampleAr: "حَجَزَ الرَّجُلُ غُرْفَةً.", exampleEn: "The man booked a room." },
    present: { exampleAr: "يَحْجِزُ الطَّالِبُ مَقْعَدًا.", exampleEn: "The student reserves a seat." },
    imperative: { exampleAr: "اِحْجِزْ مَقْعَدَكَ الآنَ.", exampleEn: "Reserve your seat now." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَحْجَزُ التَّذَاكِرِ.", exampleEn: "This is the ticket reservation place." },
    active_participle: { exampleAr: "هُوَ حَاجِزٌ لِلْغُرْفَةِ.", exampleEn: "He is the one booking the room." },
    passive_participle: { exampleAr: "المَقْعَدُ مَحْجُوزٌ.", exampleEn: "The seat is reserved." },
  },
  أكد: {
    past: { exampleAr: "أَكَّدَ المُدِيرُ المَوْعِدَ.", exampleEn: "The manager confirmed the appointment." },
    present: { exampleAr: "يُؤَكِّدُ الطَّالِبُ الخَبَرَ.", exampleEn: "The student confirms the news." },
    imperative: { exampleAr: "أَكِّدْ حُضُورَكَ.", exampleEn: "Confirm your attendance." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَأْكِيدٌ مُهِمٌّ.", exampleEn: "This is an important confirmation." },
    active_participle: { exampleAr: "هُوَ مُؤَكِّدٌ لِلْخَبَرِ.", exampleEn: "He is confirming the news." },
    passive_participle: { exampleAr: "المَوْعِدُ مُؤَكَّدٌ.", exampleEn: "The appointment is confirmed." },
  },
  حلق: {
    past: { exampleAr: "حَلَقَ الرَّجُلُ لِحْيَتَهُ.", exampleEn: "The man shaved his beard." },
    present: { exampleAr: "يَحْلِقُ الحَلَّاقُ رَأْسَ الوَلَدِ.", exampleEn: "The barber shaves the boy's head." },
    imperative: { exampleAr: "اِحْلِقْ شَعْرَكَ.", exampleEn: "Shave your hair." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَحْلَقُ الشَّعْرِ.", exampleEn: "This is the hair-shaving place." },
    active_participle: { exampleAr: "الحَلَّاقُ حَالِقٌ لِلشَّعْرِ.", exampleEn: "The barber is shaving the hair." },
    passive_participle: { exampleAr: "رَأْسُهُ مَحْلُوقٌ.", exampleEn: "His head is shaved." },
  },
  رمي: {
    past: { exampleAr: "رَمَى الوَلَدُ الكُرَةَ.", exampleEn: "The boy threw the ball." },
    present: { exampleAr: "يَرْمِي اللَّاعِبُ الكُرَةَ فِي المَرْمَى.", exampleEn: "The player throws the ball into the goal." },
    imperative: { exampleAr: "اِرْمِ الكُرَةَ إِلَيَّ.", exampleEn: "Throw the ball to me." },
    place_or_mim_masdar: { exampleAr: "الكُرَةُ فِي المَرْمَى.", exampleEn: "The ball is in the goal." },
    active_participle: { exampleAr: "هُوَ رَامٍ مَاهِرٌ.", exampleEn: "He is a skilled thrower." },
    passive_participle: { exampleAr: "الكُرَةُ مَرْمِيَّةٌ نَحْوَ المَرْمَى.", exampleEn: "The ball is thrown toward the goal." },
  },
  سعي: {
    past: { exampleAr: "سَعَى الحَاجُّ بَيْنَ الصَّفَا وَالمَرْوَةِ.", exampleEn: "The pilgrim made sa'ee between Safa and Marwah." },
    present: { exampleAr: "يَسْعَى الحُجَّاجُ فِي المَسْعَى.", exampleEn: "The pilgrims make sa'ee in al-Mas'a." },
    imperative: { exampleAr: "اِسْعَ بَيْنَ الصَّفَا وَالمَرْوَةِ.", exampleEn: "Make sa'ee between Safa and Marwah." },
    place_or_mim_masdar: { exampleAr: "هٰذَا هُوَ المَسْعَى.", exampleEn: "This is al-Mas'a (the sa'ee course)." },
    active_participle: { exampleAr: "هُوَ سَاعٍ فِي طَلَبِ العِلْمِ.", exampleEn: "He is striving in seeking knowledge." },
    passive_participle: { exampleAr: "الأَمْرُ مَسْعِيٌّ إِلَيْهِ.", exampleEn: "The matter is one that is being pursued." },
  },
  خلع: {
    past: { exampleAr: "خَلَعَ الرَّجُلُ حِذَاءَهُ.", exampleEn: "The man took off his shoes." },
    present: { exampleAr: "يَخْلَعُ الوَلَدُ مِعْطَفَهُ.", exampleEn: "The boy takes off his coat." },
    imperative: { exampleAr: "اِخْلَعْ حِذَاءَكَ.", exampleEn: "Take off your shoes." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَخْلَعُ الأَحْذِيَةِ.", exampleEn: "This is the place for taking off shoes." },
    active_participle: { exampleAr: "هُوَ خَالِعٌ حِذَاءَهُ.", exampleEn: "He is taking off his shoes." },
    passive_participle: { exampleAr: "الحِذَاءُ مَخْلُوعٌ عِنْدَ البَابِ.", exampleEn: "The shoes are taken off by the door." },
  },
  رفع: {
    past: { exampleAr: "اِرْتَفَعَ السِّعْرُ فَجْأَةً.", exampleEn: "The price rose suddenly." },
    present: { exampleAr: "يَرْتَفِعُ المَبْنَى فَوْقَ الأَشْجَارِ.", exampleEn: "The building rises above the trees." },
    imperative: { exampleAr: "اِرْتَفِعْ عَنْ هٰذَا المُسْتَوَى.", exampleEn: "Rise above this level." },
    place_or_mim_masdar: { exampleAr: "هٰذَا اِرْتِفَاعٌ كَبِيرٌ.", exampleEn: "This is a great height." },
    active_participle: { exampleAr: "الجَبَلُ مُرْتَفِعٌ جِدًّا.", exampleEn: "The mountain is very high." },
    passive_participle: { exampleAr: "وَقَفَ عَلَى مُرْتَفَعٍ قُرْبَ البَحْرِ.", exampleEn: "He stood on a highland near the sea." },
  },
  شفي: {
    past: { exampleAr: "شَفَى الطَّبِيبُ المَرِيضَ.", exampleEn: "The doctor cured the patient." },
    present: { exampleAr: "يَشْفِي الدَّوَاءُ المَرِيضَ.", exampleEn: "The medicine heals the patient." },
    imperative: { exampleAr: "اِشْفِ هٰذَا المَرِيضَ.", exampleEn: "Heal this patient." },
    place_or_mim_masdar: { exampleAr: "ذَهَبَ إِلَى المَشْفَى.", exampleEn: "He went to the hospital." },
    active_participle: { exampleAr: "هٰذَا دَوَاءٌ شَافٍ.", exampleEn: "This is a curative medicine." },
    passive_participle: { exampleAr: "المَرِيضُ مَشْفِيٌّ الآنَ.", exampleEn: "The patient is healed now." },
  },
  فحص: {
    past: { exampleAr: "فَحَصَ الطَّبِيبُ المَرِيضَ.", exampleEn: "The doctor examined the patient." },
    present: { exampleAr: "يَفْحَصُ المُهَنْدِسُ السَّيَّارَةَ.", exampleEn: "The engineer inspects the car." },
    imperative: { exampleAr: "اِفْحَصْ هٰذَا الجِهَازَ.", exampleEn: "Examine this device." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَفْحَصُ السَّيَّارَاتِ.", exampleEn: "This is the car inspection place." },
    active_participle: { exampleAr: "الطَّبِيبُ فَاحِصٌ لِلْمَرِيضِ.", exampleEn: "The doctor is examining the patient." },
    passive_participle: { exampleAr: "المَرِيضُ مَفْحُوصٌ.", exampleEn: "The patient has been examined." },
  },
  عود: {
    past: { exampleAr: "أَعَادَ الطَّالِبُ الكِتَابَ إِلَى المَكْتَبَةِ.", exampleEn: "The student returned the book to the library." },
    present: { exampleAr: "يُعِيدُ المُعَلِّمُ السُّؤَالَ.", exampleEn: "The teacher repeats the question." },
    imperative: { exampleAr: "أَعِدْ هٰذَا الكِتَابَ.", exampleEn: "Return this book." },
    place_or_mim_masdar: { exampleAr: "هٰذِهِ إِعَادَةٌ لِلدَّرْسِ.", exampleEn: "This is a repetition of the lesson." },
    active_participle: { exampleAr: "هُوَ مُعِيدٌ فِي الجَامِعَةِ.", exampleEn: "He is a teaching assistant at the university." },
    passive_participle: { exampleAr: "الوَرَقُ مُعَادٌ تَدْوِيرُهُ.", exampleEn: "The paper is recycled." },
  },
  شور: {
    past: { exampleAr: "أَشَارَ الرَّجُلُ إِلَى البَابِ.", exampleEn: "The man pointed to the door." },
    present: { exampleAr: "يُشِيرُ المُعَلِّمُ إِلَى السَّبُّورَةِ.", exampleEn: "The teacher points to the board." },
    imperative: { exampleAr: "أَشِرْ إِلَى المَكَانِ.", exampleEn: "Point to the place." },
    place_or_mim_masdar: { exampleAr: "هٰذِهِ إِشَارَةُ المُرُورِ.", exampleEn: "This is the traffic signal." },
    active_participle: { exampleAr: "هُوَ مُشِيرٌ إِلَى الخَرِيطَةِ.", exampleEn: "He is pointing to the map." },
    passive_participle: { exampleAr: "الأَمْرُ المُشَارُ إِلَيْهِ وَاضِحٌ.", exampleEn: "The aforementioned matter is clear." },
  },
  قول: {
    past: { exampleAr: "قَالَ الرَّجُلُ الحَقِيقَةَ.", exampleEn: "The man told the truth." },
    present: { exampleAr: "يَقُولُ الطَّالِبُ رَأْيَهُ.", exampleEn: "The student says his opinion." },
    imperative: { exampleAr: "قُلْ الحَقِيقَةَ.", exampleEn: "Say the truth." },
    place_or_mim_masdar: { exampleAr: "قَرَأْتُ مَقَالًا مُفِيدًا.", exampleEn: "I read a useful article." },
    active_participle: { exampleAr: "هُوَ قَائِلُ هٰذَا الكَلَامِ.", exampleEn: "He is the one who said these words." },
    passive_participle: { exampleAr: "هٰذَا كَلَامٌ مَقُولٌ مِنْ قَبْلُ.", exampleEn: "This is something already said before." },
  },
  رتب: {
    past: { exampleAr: "رَتَّبَ الوَلَدُ كُتُبَهُ.", exampleEn: "The boy arranged his books." },
    present: { exampleAr: "يُرَتِّبُ العَامِلُ الطَّاوِلَةَ.", exampleEn: "The worker arranges the table." },
    imperative: { exampleAr: "رَتِّبْ غُرْفَتَكَ.", exampleEn: "Arrange your room." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَرْتِيبٌ جَمِيلٌ.", exampleEn: "This is a nice arrangement." },
    active_participle: { exampleAr: "هُوَ مُرَتِّبٌ لِلْكُتُبِ.", exampleEn: "He is arranging the books." },
    passive_participle: { exampleAr: "يَأْخُذُ العَامِلُ مُرَتَّبَهُ.", exampleEn: "The worker takes his salary." },
  },
  بدل: {
    past: { exampleAr: "تَبَادَلَ الصَّدِيقَانِ الهَدَايَا.", exampleEn: "The two friends exchanged gifts." },
    present: { exampleAr: "يَتَبَادَلُ الطُّلَّابُ الكُتُبَ.", exampleEn: "The students exchange books." },
    imperative: { exampleAr: "تَبَادَلْ الأَفْكَارَ مَعَهُ.", exampleEn: "Exchange ideas with him." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَبَادُلٌ مُفِيدٌ.", exampleEn: "This is a useful exchange." },
    active_participle: { exampleAr: "هُنَاكَ اِحْتِرَامٌ مُتَبَادِلٌ بَيْنَهُمَا.", exampleEn: "There is mutual respect between them." },
    passive_participle: { exampleAr: "الهَدَايَا مُتَبَادَلَةٌ بَيْنَ الصَّدِيقَيْنِ.", exampleEn: "The gifts are exchanged between the two friends." },
  },
  جوب: {
    past: { exampleAr: "أَجَابَ الطَّالِبُ عَنِ السُّؤَالِ.", exampleEn: "The student answered the question." },
    present: { exampleAr: "يُجِيبُ المُعَلِّمُ عَنْ أَسْئِلَةِ الطُّلَّابِ.", exampleEn: "The teacher answers the students' questions." },
    imperative: { exampleAr: "أَجِبْ عَنِ السُّؤَالِ.", exampleEn: "Answer the question." },
    place_or_mim_masdar: { exampleAr: "هٰذِهِ إِجَابَةٌ صَحِيحَةٌ.", exampleEn: "This is a correct answer." },
    active_participle: { exampleAr: "هُوَ مُجِيبٌ عَنِ الأَسْئِلَةِ.", exampleEn: "He is answering the questions." },
    passive_participle: { exampleAr: "دُعَاؤُهُ مُجَابٌ.", exampleEn: "His prayer is answered." },
  },
  صلو: {
    past: { exampleAr: "صَلَّى الرَّجُلُ فِي المَسْجِدِ.", exampleEn: "The man prayed in the mosque." },
    present: { exampleAr: "يُصَلِّي الطَّالِبُ فِي البَيْتِ.", exampleEn: "The student prays at home." },
    imperative: { exampleAr: "صَلِّ فِي وَقْتِهَا.", exampleEn: "Pray on time." },
    place_or_mim_masdar: { exampleAr: "هٰذِهِ صَلَاةُ الظُّهْرِ.", exampleEn: "This is the noon prayer." },
    active_participle: { exampleAr: "هُوَ مُصَلٍّ فِي المَسْجِدِ.", exampleEn: "He is one praying in the mosque." },
    passive_participle: { exampleAr: "ذَهَبَ إِلَى المُصَلَّى.", exampleEn: "He went to the prayer area." },
  },
  رود: {
    past: { exampleAr: "أَرَادَ الوَلَدُ أَنْ يَلْعَبَ.", exampleEn: "The boy wanted to play." },
    present: { exampleAr: "يُرِيدُ الطَّالِبُ النَّجَاحَ.", exampleEn: "The student wants success." },
    imperative: { exampleAr: "أَرِدْ الخَيْرَ لِنَفْسِكَ.", exampleEn: "Wish good for yourself." },
    place_or_mim_masdar: { exampleAr: "عِنْدَهُ إِرَادَةٌ قَوِيَّةٌ.", exampleEn: "He has strong willpower." },
    active_participle: { exampleAr: "هُوَ مُرِيدٌ لِلْعِلْمِ.", exampleEn: "He is a seeker of knowledge." },
    passive_participle: { exampleAr: "هٰذَا هُوَ المُرَادُ بِالكَلَامِ.", exampleEn: "This is what is meant by the statement." },
  },
  نوم: {
    past: { exampleAr: "نَامَ الطِّفْلُ مُبَكِّرًا.", exampleEn: "The child slept early." },
    present: { exampleAr: "يَنَامُ الوَلَدُ فِي غُرْفَتِهِ.", exampleEn: "The boy sleeps in his room." },
    imperative: { exampleAr: "نَمْ الآنَ.", exampleEn: "Sleep now." },
    place_or_mim_masdar: { exampleAr: "رَأَيْتُ ذٰلِكَ فِي المَنَامِ.", exampleEn: "I saw that in a dream." },
    active_participle: { exampleAr: "الطِّفْلُ نَائِمٌ الآنَ.", exampleEn: "The child is asleep now." },
    passive_participle: { exampleAr: "الطِّفْلُ مَنُومٌ مُبَكِّرًا.", exampleEn: "The child is put to sleep early." },
  },
  فضل: {
    past: { exampleAr: "فَضَّلَ الطَّالِبُ القِرَاءَةَ.", exampleEn: "The student preferred reading." },
    present: { exampleAr: "يُفَضِّلُ الوَلَدُ اللَّعِبَ.", exampleEn: "The boy prefers playing." },
    imperative: { exampleAr: "فَضِّلْ الصِّدْقَ دَائِمًا.", exampleEn: "Always prefer honesty." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَفْضِيلٌ شَخْصِيٌّ.", exampleEn: "This is a personal preference." },
    active_participle: { exampleAr: "هُوَ مُفَضِّلٌ لِلْقِرَاءَةِ.", exampleEn: "He is one who prefers reading." },
    passive_participle: { exampleAr: "هٰذَا لَوْنِي المُفَضَّلُ.", exampleEn: "This is my favorite color." },
  },
  حول: {
    past: { exampleAr: "حَوَّلَ الرَّجُلُ المَالَ إِلَى حِسَابِهِ.", exampleEn: "The man transferred the money to his account." },
    present: { exampleAr: "يُحَوِّلُ البَنْكُ المَبْلَغَ.", exampleEn: "The bank transfers the amount." },
    imperative: { exampleAr: "حَوِّلْ المَالَ الآنَ.", exampleEn: "Transfer the money now." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَحْوِيلٌ بَنْكِيٌّ.", exampleEn: "This is a bank transfer." },
    active_participle: { exampleAr: "هٰذَا مُحَوِّلٌ كَهْرَبَائِيٌّ.", exampleEn: "This is an electrical transformer." },
    passive_participle: { exampleAr: "المَبْلَغُ مُحَوَّلٌ إِلَى الحِسَابِ.", exampleEn: "The amount is transferred to the account." },
  },
  سفر: {
    past: { exampleAr: "سَافَرَ الرَّجُلُ إِلَى مِصْرَ.", exampleEn: "The man traveled to Egypt." },
    present: { exampleAr: "يُسَافِرُ الطَّالِبُ فِي الصَّيْفِ.", exampleEn: "The student travels in the summer." },
    imperative: { exampleAr: "سَافِرْ بِأَمَانٍ.", exampleEn: "Travel safely." },
    place_or_mim_masdar: { exampleAr: "هٰذَا سَفَرٌ طَوِيلٌ.", exampleEn: "This is a long journey." },
    active_participle: { exampleAr: "هُوَ مُسَافِرٌ إِلَى القَاهِرَةِ.", exampleEn: "He is traveling to Cairo." },
    passive_participle: { exampleAr: "الطَّرِيقُ مُسَافَرٌ فِيهِ كَثِيرًا.", exampleEn: "The road is one that is much traveled." },
  },
  كون: {
    past: { exampleAr: "كَانَ الجَوُّ جَمِيلًا.", exampleEn: "The weather was beautiful." },
    present: { exampleAr: "يَكُونُ الدَّرْسُ صَعْبًا أَحْيَانًا.", exampleEn: "The lesson is sometimes difficult." },
    imperative: { exampleAr: "كُنْ صَادِقًا.", exampleEn: "Be honest." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَكَانٌ جَمِيلٌ.", exampleEn: "This is a beautiful place." },
    active_participle: { exampleAr: "هٰذَا الكَائِنُ صَغِيرٌ.", exampleEn: "This being is small." },
    passive_participle: { exampleAr: "الأَمْرُ مَكُونٌ عَلَيْهِ كَذٰلِكَ.", exampleEn: "The matter has been thus (artificial example)." },
  },
  كمل: {
    past: { exampleAr: "أَكْمَلَ الطَّالِبُ وَاجِبَهُ.", exampleEn: "The student completed his homework." },
    present: { exampleAr: "يُكْمِلُ العَامِلُ عَمَلَهُ.", exampleEn: "The worker completes his work." },
    imperative: { exampleAr: "أَكْمِلْ عَمَلَكَ.", exampleEn: "Complete your work." },
    place_or_mim_masdar: { exampleAr: "هٰذَا إِكْمَالٌ لِلْمَشْرُوعِ.", exampleEn: "This is a completion of the project." },
    active_participle: { exampleAr: "هُوَ مُكْمِلٌ لِلْعَمَلِ.", exampleEn: "He is completing the work." },
    passive_participle: { exampleAr: "العَمَلُ مُكْمَلٌ.", exampleEn: "The work is completed." },
  },
  صبح: {
    past: { exampleAr: "أَصْبَحَ الجَوُّ بَارِدًا.", exampleEn: "The weather became cold." },
    present: { exampleAr: "يُصْبِحُ الوَلَدُ طَبِيبًا.", exampleEn: "The boy becomes a doctor." },
    imperative: { exampleAr: "أَصْبِحْ قَوِيًّا.", exampleEn: "Become strong." },
    place_or_mim_masdar: { exampleAr: "هٰذَا إِصْبَاحٌ مُبَكِّرٌ.", exampleEn: "This is an early morning." },
    active_participle: { exampleAr: "هُوَ مُصْبِحٌ قَوِيًّا.", exampleEn: "He is becoming strong." },
    passive_participle: { exampleAr: "الأَمْرُ مُصْبَحٌ عَلَيْهِ.", exampleEn: "The matter has come to be thus (artificial example)." },
  },
  سوق: {
    past: { exampleAr: "تَسَوَّقَتِ الأُسْرَةُ فِي السُّوقِ.", exampleEn: "The family shopped at the market." },
    present: { exampleAr: "يَتَسَوَّقُ الوَلَدُ مَعَ أُمِّهِ.", exampleEn: "The boy shops with his mother." },
    imperative: { exampleAr: "تَسَوَّقْ مَعِي غَدًا.", exampleEn: "Shop with me tomorrow." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَسَوُّقٌ أُسْبُوعِيٌّ.", exampleEn: "This is a weekly shopping trip." },
    active_participle: { exampleAr: "هُوَ مُتَسَوِّقٌ فِي المَرْكَزِ.", exampleEn: "He is shopping in the mall." },
    passive_participle: { exampleAr: "السُّوقُ مُتَسَوَّقٌ فِيهِ كَثِيرًا.", exampleEn: "The market is much shopped in." },
  },
  مطر: {
    past: { exampleAr: "أَمْطَرَتِ السَّمَاءُ لَيْلًا.", exampleEn: "The sky rained at night." },
    present: { exampleAr: "تُمْطِرُ السَّمَاءُ اليَوْمَ.", exampleEn: "The sky is raining today." },
    imperative: { exampleAr: "أَمْطِرِي يَا سَمَاءُ!", exampleEn: "Rain, o sky!" },
    place_or_mim_masdar: { exampleAr: "هٰذَا إِمْطَارٌ غَزِيرٌ.", exampleEn: "This is heavy rain." },
    active_participle: { exampleAr: "اليَوْمُ مُمْطِرٌ.", exampleEn: "Today is rainy." },
    passive_participle: { exampleAr: "الأَرْضُ مُمْطَرَةٌ.", exampleEn: "The ground is rained upon." },
  },
  كلم: {
    past: { exampleAr: "تَكَلَّمَ الطَّالِبُ أَمَامَ الصَّفِّ.", exampleEn: "The student spoke in front of the class." },
    present: { exampleAr: "يَتَكَلَّمُ الرَّجُلُ بِالعَرَبِيَّةِ.", exampleEn: "The man speaks in Arabic." },
    imperative: { exampleAr: "تَكَلَّمْ بِوُضُوحٍ.", exampleEn: "Speak clearly." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَكَلُّمٌ وَاضِحٌ.", exampleEn: "This is clear speaking." },
    active_participle: { exampleAr: "هُوَ مُتَكَلِّمٌ بِالعَرَبِيَّةِ.", exampleEn: "He is speaking in Arabic." },
    passive_participle: { exampleAr: "الأَمْرُ مُتَكَلَّمٌ فِيهِ.", exampleEn: "The matter is one being spoken about." },
  },
  زوج: {
    past: { exampleAr: "تَزَوَّجَ الرَّجُلُ فِي الصَّيْفِ.", exampleEn: "The man got married in the summer." },
    present: { exampleAr: "يَتَزَوَّجُ صَدِيقِي غَدًا.", exampleEn: "My friend is getting married tomorrow." },
    imperative: { exampleAr: "تَزَوَّجْ عِنْدَمَا تَسْتَعِدُّ.", exampleEn: "Get married when you're ready." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَزَوُّجٌ مُبَكِّرٌ.", exampleEn: "This is an early marriage." },
    active_participle: { exampleAr: "هُوَ رَجُلٌ مُتَزَوِّجٌ.", exampleEn: "He is a married man." },
    passive_participle: { exampleAr: "الفَتَاةُ مُتَزَوَّجٌ بِهَا مِنْ رَجُلٍ طَيِّبٍ.", exampleEn: "The girl has been married by a good man." },
  },
  زور: {
    past: { exampleAr: "زَارَ الرَّجُلُ صَدِيقَهُ.", exampleEn: "The man visited his friend." },
    present: { exampleAr: "يَزُورُ الطَّالِبُ المَكْتَبَةَ.", exampleEn: "The student visits the library." },
    imperative: { exampleAr: "زُرْ جَدَّكَ.", exampleEn: "Visit your grandfather." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَزَارٌ مَشْهُورٌ.", exampleEn: "This is a famous shrine." },
    active_participle: { exampleAr: "هُوَ زَائِرٌ لِلْمَدِينَةِ.", exampleEn: "He is a visitor to the city." },
    passive_participle: { exampleAr: "المَكَانُ مَزُورٌ كَثِيرًا.", exampleEn: "The place is much visited." },
  },
  لوث: {
    past: { exampleAr: "تَلَوَّثَ الهَوَاءُ فِي المَدِينَةِ.", exampleEn: "The air became polluted in the city." },
    present: { exampleAr: "يَتَلَوَّثُ النَّهْرُ بِالنِّفَايَاتِ.", exampleEn: "The river gets polluted by waste." },
    imperative: { exampleAr: "تَلَوَّثْ بِالطِّينِ فِي اللَّعِبِ.", exampleEn: "Get muddy while playing." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَلَوُّثٌ خَطِيرٌ.", exampleEn: "This is dangerous pollution." },
    active_participle: { exampleAr: "الهَوَاءُ مُتَلَوِّثٌ.", exampleEn: "The air is polluted." },
    passive_participle: { exampleAr: "المَكَانُ مُتَلَوَّثٌ بِالقُمَامَةِ.", exampleEn: "The place is polluted with garbage." },
  },
  قوم: {
    past: { exampleAr: "أَقَامَ الرَّجُلُ فِي المَدِينَةِ.", exampleEn: "The man resided in the city." },
    present: { exampleAr: "يُقِيمُ الطَّالِبُ فِي السَّكَنِ الجَامِعِيِّ.", exampleEn: "The student resides in the dormitory." },
    imperative: { exampleAr: "أَقِمْ عِنْدَنَا.", exampleEn: "Stay with us." },
    place_or_mim_masdar: { exampleAr: "عِنْدَهُ إِقَامَةٌ فِي البَلَدِ.", exampleEn: "He has residency in the country." },
    active_participle: { exampleAr: "هُوَ مُقِيمٌ فِي هٰذِهِ المَدِينَةِ.", exampleEn: "He is residing in this city." },
    passive_participle: { exampleAr: "الحَفْلُ مُقَامٌ فِي القَاعَةِ.", exampleEn: "The event is being held in the hall." },
  },
  غدر: {
    past: { exampleAr: "غَادَرَ الرَّجُلُ البَيْتَ صَبَاحًا.", exampleEn: "The man left the house in the morning." },
    present: { exampleAr: "يُغَادِرُ الطَّالِبُ المَدْرَسَةَ ظُهْرًا.", exampleEn: "The student leaves school at noon." },
    imperative: { exampleAr: "غَادِرْ الآنَ.", exampleEn: "Depart now." },
    place_or_mim_masdar: { exampleAr: "هٰذِهِ مُغَادَرَةٌ سَرِيعَةٌ.", exampleEn: "This is a quick departure." },
    active_participle: { exampleAr: "الرُّكَّابُ المُغَادِرُونَ فِي الصَّالَةِ.", exampleEn: "The departing passengers are in the hall." },
    passive_participle: { exampleAr: "المَكَانُ مُغَادَرٌ مِنَ الجَمِيعِ.", exampleEn: "The place is one that everyone has departed from." },
  },
  صوم: {
    past: { exampleAr: "صَامَ المُسْلِمُ فِي رَمَضَانَ.", exampleEn: "The Muslim fasted in Ramadan." },
    present: { exampleAr: "يَصُومُ النَّاسُ فِي رَمَضَانَ.", exampleEn: "People fast in Ramadan." },
    imperative: { exampleAr: "صُمْ يَوْمَ الاثْنَيْنِ.", exampleEn: "Fast on Monday." },
    place_or_mim_masdar: { exampleAr: "هٰذَا مَصَامٌ طَوِيلٌ.", exampleEn: "This is a long period of fasting." },
    active_participle: { exampleAr: "هُوَ صَائِمٌ اليَوْمَ.", exampleEn: "He is fasting today." },
    passive_participle: { exampleAr: "اليَوْمُ مَصُومٌ فِيهِ.", exampleEn: "The day is one that is fasted in." },
  },
  طوف: {
    past: { exampleAr: "طَافَ الحَاجُّ حَوْلَ الكَعْبَةِ.", exampleEn: "The pilgrim circled the Kaaba (made tawaf)." },
    present: { exampleAr: "يَطُوفُ الحُجَّاجُ حَوْلَ الكَعْبَةِ.", exampleEn: "The pilgrims make tawaf around the Kaaba." },
    imperative: { exampleAr: "طُفْ حَوْلَ الكَعْبَةِ.", exampleEn: "Make tawaf around the Kaaba." },
    place_or_mim_masdar: { exampleAr: "ذَهَبُوا إِلَى المَطَافِ.", exampleEn: "They went to the tawaf area." },
    active_participle: { exampleAr: "هُوَ طَائِفٌ حَوْلَ الكَعْبَةِ.", exampleEn: "He is circling the Kaaba." },
    passive_participle: { exampleAr: "البَيْتُ مَطُوفٌ حَوْلَهُ.", exampleEn: "The House is one that is circled around." },
  },
  لبي: {
    past: { exampleAr: "لَبَّى الحَاجُّ عِنْدَ الإِحْرَامِ.", exampleEn: "The pilgrim said the Talbiyah at the state of ihram." },
    present: { exampleAr: "يُلَبِّي الحُجَّاجُ بِصَوْتٍ عَالٍ.", exampleEn: "The pilgrims say the Talbiyah loudly." },
    imperative: { exampleAr: "لَبِّ بِصَوْتٍ عَالٍ.", exampleEn: "Say the Talbiyah loudly." },
    place_or_mim_masdar: { exampleAr: "هٰذِهِ تَلْبِيَةُ الحَجِّ.", exampleEn: "This is the Hajj Talbiyah." },
    active_participle: { exampleAr: "الحَاجُّ مُلَبٍّ عِنْدَ الإِحْرَامِ.", exampleEn: "The pilgrim is one saying the Talbiyah at ihram." },
    passive_participle: { exampleAr: "النِّدَاءُ مُلَبًّى مِنَ الحُجَّاجِ.", exampleEn: "The call is answered by the pilgrims." },
  },
  صوب: {
    past: { exampleAr: "أَصَابَ المَرَضُ الرَّجُلَ.", exampleEn: "The illness afflicted the man." },
    present: { exampleAr: "يُصِيبُ البَرْدُ الأَطْفَالَ فِي الشِّتَاءِ.", exampleEn: "The cold afflicts children in winter." },
    imperative: { exampleAr: "أَصِبْ هَدَفَكَ.", exampleEn: "Hit your target." },
    place_or_mim_masdar: { exampleAr: "عِنْدَهُ إِصَابَةٌ فِي رِجْلِهِ.", exampleEn: "He has an injury in his leg." },
    active_participle: { exampleAr: "رَأْيُهُ مُصِيبٌ.", exampleEn: "His opinion is correct." },
    passive_participle: { exampleAr: "هُوَ مُصَابٌ بِمَرَضٍ.", exampleEn: "He is afflicted with an illness." },
  },
  غيب: {
    past: { exampleAr: "تَغَيَّبَ الطَّالِبُ عَنِ الدَّرْسِ.", exampleEn: "The student was absent from the lesson." },
    present: { exampleAr: "يَتَغَيَّبُ الوَلَدُ عَنِ المَدْرَسَةِ أَحْيَانًا.", exampleEn: "The boy is sometimes absent from school." },
    imperative: { exampleAr: "تَغَيَّبْ إِذَا كُنْتَ مَرِيضًا.", exampleEn: "Be absent if you are sick." },
    place_or_mim_masdar: { exampleAr: "هٰذَا تَغَيُّبٌ مُتَكَرِّرٌ.", exampleEn: "This is repeated absence." },
    active_participle: { exampleAr: "الطَّالِبُ مُتَغَيِّبٌ اليَوْمَ.", exampleEn: "The student is absent today." },
    passive_participle: { exampleAr: "اليَوْمُ مُتَغَيَّبٌ عَنْهُ.", exampleEn: "The day is one that has been absented from." },
  },
  عطو: {
    past: { exampleAr: "أَعْطَى الرَّجُلُ الفَقِيرَ مَالًا.", exampleEn: "The man gave the poor man money." },
    present: { exampleAr: "يُعْطِي المُعَلِّمُ الطَّالِبَ كِتَابًا.", exampleEn: "The teacher gives the student a book." },
    imperative: { exampleAr: "أَعْطِنِي القَلَمَ.", exampleEn: "Give me the pen." },
    place_or_mim_masdar: { exampleAr: "هٰذَا عَطَاءٌ كَبِيرٌ.", exampleEn: "This is a great gift." },
    active_participle: { exampleAr: "هُوَ مُعْطٍ لِلْفُقَرَاءِ.", exampleEn: "He is a giver to the poor." },
    passive_participle: { exampleAr: "هٰذَا مُعْطًى مُهِمٌّ فِي البَحْثِ.", exampleEn: "This is an important datum in the research." },
  },
  سعد: {
    past: { exampleAr: "سَاعَدَ الرَّجُلُ جَارَهُ.", exampleEn: "The man helped his neighbor." },
    present: { exampleAr: "يُسَاعِدُ الطَّالِبُ زَمِيلَهُ.", exampleEn: "The student helps his classmate." },
    imperative: { exampleAr: "سَاعِدْنِي فِي هٰذَا.", exampleEn: "Help me with this." },
    place_or_mim_masdar: { exampleAr: "أَحْتَاجُ إِلَى مُسَاعَدَةٍ.", exampleEn: "I need help." },
    active_participle: { exampleAr: "هُوَ مُسَاعِدُ المُدِيرِ.", exampleEn: "He is the manager's assistant." },
    passive_participle: { exampleAr: "الطَّالِبُ مُسَاعَدٌ مِنْ مُعَلِّمِهِ.", exampleEn: "The student is helped by his teacher." },
  },
  رأي: {
    past: { exampleAr: "رَأَى الوَلَدُ طَائِرًا.", exampleEn: "The boy saw a bird." },
    present: { exampleAr: "يَرَى الطَّالِبُ المُعَلِّمَ.", exampleEn: "The student sees the teacher." },
    imperative: { exampleAr: "رَ الجَمَالَ حَوْلَكَ.", exampleEn: "See the beauty around you." },
    place_or_mim_masdar: { exampleAr: "عِنْدَهُ رُؤْيَةٌ وَاضِحَةٌ.", exampleEn: "He has a clear vision." },
    active_participle: { exampleAr: "هُوَ رَاءٍ لِلْحَقِيقَةِ.", exampleEn: "He is one who sees the truth." },
    passive_participle: { exampleAr: "البَرْنَامَجُ مَرْئِيٌّ.", exampleEn: "The program is visual/televised." },
  },
  // Quranic root index expansion (verified with Fable, an Arabic-morphology advisor model).
  موت: {
    past: { exampleAr: "مَاتَ الرَّجُلُ العَجُوزُ أَمْسِ.", exampleEn: "The old man died yesterday." },
    present: { exampleAr: "يَمُوتُ كُلُّ إِنْسَانٍ يَوْمًا.", exampleEn: "Every human dies one day." },
    imperative: { exampleAr: "عِشْ كَرِيمًا أَوْ مُتْ كَرِيمًا.", exampleEn: "Live with honor or die with honor." },
    place_or_mim_masdar: { exampleAr: "لِلهِ مَحْيَانَا وَمَمَاتُنَا.", exampleEn: "To Allah belong our life and our death." },
    active_participle: { exampleAr: "كُلُّ حَيٍّ مَائِتٌ.", exampleEn: "Every living thing is mortal." },
    passive_participle: { exampleAr: "البَلَدُ المَيِّتُ يُحْيِيهِ المَطَرُ.", exampleEn: "Rain revives the dead land." },
  },
  ربب: {
    past: { exampleAr: "رَبَّ الأَبُ وَلَدَهُ بِرِفْقٍ.", exampleEn: "The father raised his son gently." },
    present: { exampleAr: "يَرُبُّ الأَبُ أَوْلَادَهُ.", exampleEn: "The father raises his children." },
    imperative: { exampleAr: "رُبَّ وَلَدَكَ عَلَى الصِّدْقِ.", exampleEn: "Raise your child upon truthfulness." },
    place_or_mim_masdar: { exampleAr: "الرُّبُوبِيَّةُ لِلهِ وَحْدَهُ.", exampleEn: "Lordship belongs to Allah alone." },
    active_participle: { exampleAr: "هُوَ رَابٌّ لِأُسْرَتِهِ.", exampleEn: "He is a caretaker of his family." },
    passive_participle: { exampleAr: "كُلُّ مَخْلُوقٍ مَرْبُوبٌ لِلهِ.", exampleEn: "Every creature is under Allah's lordship." },
  },
  رجو: {
    past: { exampleAr: "رَجَا المَرِيضُ الشِّفَاءَ.", exampleEn: "The sick man hoped for recovery." },
    present: { exampleAr: "يَرْجُو المُؤْمِنُ رَحْمَةَ اللهِ.", exampleEn: "The believer hopes for Allah's mercy." },
    imperative: { exampleAr: "اُرْجُ رَحْمَةَ رَبِّكَ.", exampleEn: "Hope for your Lord's mercy." },
    place_or_mim_masdar: { exampleAr: "الرَّجَاءُ يُقَوِّي القَلْبَ.", exampleEn: "Hope strengthens the heart." },
    active_participle: { exampleAr: "أَنَا رَاجٍ عَفْوَ اللهِ.", exampleEn: "I am hopeful of Allah's pardon." },
    passive_participle: { exampleAr: "الخَيْرُ مَرْجُوٌّ مِنَ اللهِ.", exampleEn: "Good is hoped for from Allah." },
  },
  توب: {
    past: { exampleAr: "تَابَ الرَّجُلُ إِلَى اللهِ.", exampleEn: "The man repented to Allah." },
    present: { exampleAr: "يَتُوبُ اللهُ عَلَى مَنْ تَابَ.", exampleEn: "Allah accepts the repentance of whoever repents." },
    imperative: { exampleAr: "تُبْ إِلَى اللهِ كُلَّ يَوْمٍ.", exampleEn: "Repent to Allah every day." },
    place_or_mim_masdar: { exampleAr: "التَّوْبَةُ تَمْحُو الذُّنُوبَ.", exampleEn: "Repentance erases sins." },
    active_participle: { exampleAr: "التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لَا ذَنْبَ لَهُ.", exampleEn: "The one who repents of a sin is like one without sin." },
    passive_participle: { exampleAr: "العَبْدُ المَتُوبُ عَلَيْهِ سَعِيدٌ.", exampleEn: "The servant whose repentance is accepted is happy." },
  },
  جيء: {
    past: { exampleAr: "جَاءَ المُعَلِّمُ إِلَى الصَّفِّ.", exampleEn: "The teacher came to the class." },
    present: { exampleAr: "يَجِيءُ البَرِيدُ كُلَّ صَبَاحٍ.", exampleEn: "The mail comes every morning." },
    imperative: { exampleAr: "جِئْ مُبَكِّرًا غَدًا.", exampleEn: "Come early tomorrow." },
    place_or_mim_masdar: { exampleAr: "مَجِيءُ الضَّيْفِ أَسْعَدَنَا.", exampleEn: "The guest's arrival made us happy." },
    active_participle: { exampleAr: "الخَيْرُ جَاءٍ إِنْ شَاءَ اللهُ.", exampleEn: "Good is coming, God willing." },
    passive_participle: { exampleAr: "هٰذَا مَجِيءٌ غَيْرُ مُتَوَقَّعٍ.", exampleEn: "This is an unexpected arrival." },
  },
  يمم: {
    past: { exampleAr: "تَيَمَّمَ المُسَافِرُ لِعَدَمِ المَاءِ.", exampleEn: "The traveler performed tayammum for lack of water." },
    present: { exampleAr: "يَتَيَمَّمُ المَرِيضُ إِذَا لَمْ يَجِدِ المَاءَ.", exampleEn: "The sick person performs tayammum if he finds no water." },
    imperative: { exampleAr: "تَيَمَّمْ إِذَا لَمْ تَجِدِ المَاءَ.", exampleEn: "Perform tayammum if you find no water." },
    place_or_mim_masdar: { exampleAr: "التَّيَمُّمُ رُخْصَةٌ فِي الإِسْلَامِ.", exampleEn: "Tayammum is a concession in Islam." },
    active_participle: { exampleAr: "المُتَيَمِّمُ يَمْسَحُ وَجْهَهُ وَيَدَيْهِ.", exampleEn: "The one doing tayammum wipes his face and hands." },
    passive_participle: { exampleAr: "الصَّعِيدُ الطَّيِّبُ مُتَيَمَّمٌ بِهِ.", exampleEn: "Clean earth is what tayammum is done with." },
  },
  نور: {
    past: { exampleAr: "أَنَارَ المِصْبَاحُ الغُرْفَةَ.", exampleEn: "The lamp lit up the room." },
    present: { exampleAr: "يُنِيرُ القَمَرُ اللَّيْلَ.", exampleEn: "The moon lights up the night." },
    imperative: { exampleAr: "أَنِرْ قَلْبَكَ بِالقُرْآنِ.", exampleEn: "Illuminate your heart with the Quran." },
    place_or_mim_masdar: { exampleAr: "الإِنَارَةُ فِي الشَّارِعِ قَوِيَّةٌ.", exampleEn: "The lighting in the street is strong." },
    active_participle: { exampleAr: "القُرْآنُ كِتَابٌ مُنِيرٌ.", exampleEn: "The Quran is an illuminating book." },
    passive_participle: { exampleAr: "الطَّرِيقُ مُنَارٌ بِالمَصَابِيحِ.", exampleEn: "The road is lit with lamps." },
  },
  أمن_believe: {
    past: { exampleAr: "آمَنَ الرَّجُلُ بِاللهِ.", exampleEn: "The man believed in Allah." },
    present: { exampleAr: "يُؤْمِنُ المُسْلِمُ بِالغَيْبِ.", exampleEn: "The Muslim believes in the unseen." },
    imperative: { exampleAr: "آمِنْ بِاللهِ وَرُسُلِهِ.", exampleEn: "Believe in Allah and His messengers." },
    place_or_mim_masdar: { exampleAr: "الإِيمَانُ نُورٌ فِي القَلْبِ.", exampleEn: "Faith is a light in the heart." },
    active_participle: { exampleAr: "المُؤْمِنُ صَادِقٌ فِي قَوْلِهِ.", exampleEn: "The believer is truthful in his speech." },
    passive_participle: { exampleAr: "الغَيْبُ مُؤْمَنٌ بِهِ عِنْدَ المُسْلِمِينَ.", exampleEn: "The unseen is believed in by Muslims." },
  },
  حيي_life: {
    past: { exampleAr: "حَيِيَ الجَدُّ تِسْعِينَ سَنَةً.", exampleEn: "The grandfather lived ninety years." },
    present: { exampleAr: "يَحْيَا القَلْبُ بِذِكْرِ اللهِ.", exampleEn: "The heart lives by the remembrance of Allah." },
    imperative: { exampleAr: "اِحْيَ بِقَلْبٍ شَاكِرٍ.", exampleEn: "Live with a grateful heart." },
    place_or_mim_masdar: { exampleAr: "الحَيَاةُ الدُّنْيَا قَصِيرَةٌ.", exampleEn: "The worldly life is short." },
    active_participle: { exampleAr: "اللهُ حَيٌّ لَا يَمُوتُ.", exampleEn: "Allah is Ever-Living and does not die." },
    passive_participle: { exampleAr: "الفِعْلُ النَّادِرُ مَحْيِيٌّ بِهِ الِاسْتِعْمَالُ الفَصِيحُ.", exampleEn: "The rare form is kept alive by classical usage." },
  },
  شيء: {
    past: { exampleAr: "مَا شَاءَ اللهُ كَانَ.", exampleEn: "Whatever Allah willed came to be." },
    present: { exampleAr: "اللهُ يَشَاءُ مَا يُرِيدُ.", exampleEn: "Allah wills what He wants." },
    imperative: { exampleAr: "إِنْ شِئْتَ فَشَأْ خَيْرًا.", exampleEn: "If you wish, then will something good." },
    place_or_mim_masdar: { exampleAr: "كُلُّ شَيْءٍ بِمَشِيئَةِ اللهِ.", exampleEn: "Everything is by the will of Allah." },
    active_participle: { exampleAr: "هُوَ شَائِئٌ لِلْخَيْرِ دَائِمًا.", exampleEn: "He is one who always wills good." },
    passive_participle: { exampleAr: "الأَمْرُ المَشِيءُ لَا رَادَّ لَهُ.", exampleEn: "The decreed matter has no repeller." },
  },
  وقي: {
    past: { exampleAr: "اِتَّقَى الرَّجُلُ رَبَّهُ.", exampleEn: "The man was mindful of his Lord." },
    present: { exampleAr: "يَتَّقِي المُؤْمِنُ رَبَّهُ فِي كُلِّ أَمْرٍ.", exampleEn: "The believer is mindful of his Lord in every matter." },
    imperative: { exampleAr: "اِتَّقِ اللهَ حَيْثُمَا كُنْتَ.", exampleEn: "Be mindful of Allah wherever you are." },
    place_or_mim_masdar: { exampleAr: "التَّقْوَى خَيْرُ زَادٍ.", exampleEn: "God-consciousness is the best provision." },
    active_participle: { exampleAr: "هُدًى لِلْمُتَّقِينَ.", exampleEn: "Guidance for the God-conscious." },
    passive_participle: { exampleAr: "النَّارُ مُتَّقَاةٌ بِالتَّقْوَى.", exampleEn: "The Fire is guarded against through piety." },
  },
  عذب: {
    past: { exampleAr: "عَذَّبَ اللهُ الظَّالِمِينَ.", exampleEn: "Allah punished the wrongdoers." },
    present: { exampleAr: "يُعَذِّبُ اللهُ مَنْ يَشَاءُ.", exampleEn: "Allah punishes whom He wills." },
    imperative: { exampleAr: "لَا تُعَذِّبِ البَرِيءَ.", exampleEn: "Do not punish the innocent." },
    place_or_mim_masdar: { exampleAr: "التَّعْذِيبُ حَرَامٌ.", exampleEn: "Torment is forbidden." },
    active_participle: { exampleAr: "اللهُ مُعَذِّبُ الكَافِرِينَ.", exampleEn: "Allah is the punisher of the disbelievers." },
    passive_participle: { exampleAr: "القَوْمُ الظَّالِمُونَ مُعَذَّبُونَ.", exampleEn: "The wrongdoing people are punished." },
  },
  سمو: {
    past: { exampleAr: "سَمَا اسْمُهُ بَيْنَ النَّاسِ.", exampleEn: "His name rose high among the people." },
    present: { exampleAr: "يَسْمُو العِلْمُ بِصَاحِبِهِ.", exampleEn: "Knowledge elevates its possessor." },
    imperative: { exampleAr: "اُسْمُ بِنَفْسِكَ عَنِ الدَّنَايَا.", exampleEn: "Rise above base things." },
    place_or_mim_masdar: { exampleAr: "فِي خُلُقِهِ سُمُوٌّ.", exampleEn: "There is loftiness in his character." },
    active_participle: { exampleAr: "هَدَفٌ سَامٍ.", exampleEn: "A lofty goal." },
    passive_participle: { exampleAr: "المَكَانُ العَالِي مَسْمُوٌّ إِلَيْهِ بِالنَّظَرِ.", exampleEn: "The high place is looked up to (rare, pattern-based)." },
  },
  مثل: {
    past: { exampleAr: "مَثَّلَ اللهُ الدُّنْيَا بِمَاءٍ نَازِلٍ مِنَ السَّمَاءِ.", exampleEn: "Allah likened worldly life to water falling from the sky." },
    present: { exampleAr: "يُمَثِّلُ المُعَلِّمُ الفِكْرَةَ بِمِثَالٍ.", exampleEn: "The teacher illustrates the idea with an example." },
    imperative: { exampleAr: "مَثِّلْ فِكْرَتَكَ بِمِثَالٍ وَاضِحٍ.", exampleEn: "Illustrate your idea with a clear example." },
    place_or_mim_masdar: { exampleAr: "التَّمْثِيلُ يُوَضِّحُ المَعْنَى.", exampleEn: "Illustration clarifies the meaning." },
    active_participle: { exampleAr: "هُوَ مُمَثِّلٌ لِلْمَشْهَدِ.", exampleEn: "He is depicting the scene." },
    passive_participle: { exampleAr: "المَعْنَى مُمَثَّلٌ فِي هَذَا المِثَالِ.", exampleEn: "The meaning is represented in this example." },
  },
  نبأ: {
    past: { exampleAr: "نَبَّأَ اللهُ رَسُولَهُ بِالغَيْبِ.", exampleEn: "Allah informed His messenger of the unseen." },
    present: { exampleAr: "يُنَبِّئُ العَلِيمُ الخَبِيرُ عِبَادَهُ.", exampleEn: "The All-Knowing, All-Aware informs His servants." },
    imperative: { exampleAr: "نَبِّئْ عِبَادِي أَنِّي أَنَا الغَفُورُ الرَّحِيمُ.", exampleEn: "Inform My servants that I am the Forgiving, the Merciful." },
    place_or_mim_masdar: { exampleAr: "جَاءَهُمْ نَبَأٌ عَظِيمٌ.", exampleEn: "Great news came to them." },
    active_participle: { exampleAr: "هُوَ مُنَبِّئٌ قَوْمَهُ بِالحَقِّ.", exampleEn: "He is informing his people of the truth." },
    passive_participle: { exampleAr: "الرَّسُولُ مُنَبَّأٌ بِوَحْيِ رَبِّهِ.", exampleEn: "The messenger is informed by his Lord's revelation." },
  },
  دنو: {
    past: { exampleAr: "دَنَا الوَلَدُ مِنْ أَبِيهِ.", exampleEn: "The boy drew near to his father." },
    present: { exampleAr: "يَدْنُو المَوْعِدُ يَوْمًا بَعْدَ يَوْمٍ.", exampleEn: "The appointed time draws nearer day by day." },
    imperative: { exampleAr: "اُدْنُ مِنِّي وَلَا تَخَفْ.", exampleEn: "Come near to me and do not fear." },
    place_or_mim_masdar: { exampleAr: "فِي دُنُوِّهِ مِنَ اللهِ طُمَأْنِينَةٌ.", exampleEn: "In his closeness to Allah there is tranquility." },
    active_participle: { exampleAr: "الثَّمَرُ دَانٍ مِنَ الأَرْضِ.", exampleEn: "The fruit hangs close to the ground." },
    passive_participle: { exampleAr: "المَكَانُ مَدْنُوٌّ مِنْهُ كَثِيرًا.", exampleEn: "The place is much approached (rare, pattern-based)." },
  },
  نذر: {
    past: { exampleAr: "أَنْذَرَ الرَّسُولُ قَوْمَهُ.", exampleEn: "The messenger warned his people." },
    present: { exampleAr: "يُنْذِرُ النَّبِيُّ النَّاسَ مِنْ عَذَابِ اللهِ.", exampleEn: "The prophet warns the people of Allah's punishment." },
    imperative: { exampleAr: "وَأَنْذِرْ عَشِيرَتَكَ الأَقْرَبِينَ.", exampleEn: "And warn your closest kindred." },
    place_or_mim_masdar: { exampleAr: "الإِنْذَارُ رَحْمَةٌ لِلنَّاسِ.", exampleEn: "Warning is a mercy to people." },
    active_participle: { exampleAr: "كُلُّ نَبِيٍّ مُنْذِرٌ لِقَوْمِهِ.", exampleEn: "Every prophet is a warner to his people." },
    passive_participle: { exampleAr: "القَوْمُ المُنْذَرُونَ لَمْ يُؤْمِنُوا.", exampleEn: "The people who were warned did not believe." },
  },
  عظم: {
    past: { exampleAr: "عَظُمَ شَأْنُ الحَقِّ عِنْدَ المُؤْمِنِ.", exampleEn: "The truth's standing became great to the believer." },
    present: { exampleAr: "يَعْظُمُ الأَجْرُ بِعِظَمِ الصَّبْرِ.", exampleEn: "The reward grows great in proportion to patience." },
    imperative: { exampleAr: "اُعْظُمْ فِي أَخْلَاقِكَ لَا فِي كَلَامِكَ.", exampleEn: "Be great in your character, not in your words." },
    place_or_mim_masdar: { exampleAr: "لِلهِ العَظَمَةُ وَالكِبْرِيَاءُ.", exampleEn: "To Allah belong majesty and grandeur." },
    active_participle: { exampleAr: "هَذَا أَمْرٌ عَظِيمٌ.", exampleEn: "This is a great matter." },
    passive_participle: { exampleAr: "الأَمْرُ مَعْظُومٌ عِنْدَ أَهْلِهِ.", exampleEn: "The matter is regarded as great by its people (rare, pattern-based)." },
  },
  بشر: {
    past: { exampleAr: "بَشَّرَ المَلَكُ مَرْيَمَ بِعِيسَى.", exampleEn: "The angel gave Mary glad tidings of Jesus." },
    present: { exampleAr: "يُبَشِّرُ اللهُ المُؤْمِنِينَ بِالجَنَّةِ.", exampleEn: "Allah gives the believers glad tidings of Paradise." },
    imperative: { exampleAr: "وَبَشِّرِ الَّذِينَ آمَنُوا.", exampleEn: "And give glad tidings to those who believe." },
    place_or_mim_masdar: { exampleAr: "البُشْرَى فَرِحَتْ بِهَا العَائِلَةُ.", exampleEn: "The family rejoiced at the glad tidings." },
    active_participle: { exampleAr: "أَرْسَلَ اللهُ رَسُولَهُ مُبَشِّرًا وَنَذِيرًا.", exampleEn: "Allah sent His messenger as a bringer of glad tidings and a warner." },
    passive_participle: { exampleAr: "المُؤْمِنُونَ مُبَشَّرُونَ بِالخَيْرِ.", exampleEn: "The believers are given glad tidings of good." },
  },
  عزز: {
    past: { exampleAr: "عَزَّ الإِسْلَامُ بِالمُؤْمِنِينَ.", exampleEn: "Islam became mighty through the believers." },
    present: { exampleAr: "يَعِزُّ الحَقُّ وَلَوْ كَرِهَ الظَّالِمُونَ.", exampleEn: "Truth prevails even if the wrongdoers dislike it." },
    imperative: { exampleAr: "اِعْزِزْ بِدِينِكَ وَلَا تَخَفْ.", exampleEn: "Be strengthened by your faith and do not fear." },
    place_or_mim_masdar: { exampleAr: "وَلِلَّهِ العِزَّةُ وَلِرَسُولِهِ وَلِلْمُؤْمِنِينَ.", exampleEn: "To Allah belongs might, and to His messenger, and to the believers." },
    active_participle: { exampleAr: "اللهُ العَزِيزُ الحَكِيمُ.", exampleEn: "Allah is the Almighty, the Wise." },
    passive_participle: { exampleAr: "القَوْمُ مَعْزُوزُونَ بِإِيمَانِهِمْ.", exampleEn: "The people are made strong by their faith." },
  },
  أذن: {
    past: { exampleAr: "أَذِنَ الأَبُ لِابْنِهِ بِالسَّفَرِ.", exampleEn: "The father gave his son permission to travel." },
    present: { exampleAr: "لَا يَأْذَنُ اللهُ بِالظُّلْمِ.", exampleEn: "Allah does not permit injustice." },
    imperative: { exampleAr: "اِئْذَنْ لِي بِالدُّخُولِ.", exampleEn: "Give me permission to enter." },
    place_or_mim_masdar: { exampleAr: "لَا شَفَاعَةَ إِلَّا بِإِذْنِهِ.", exampleEn: "There is no intercession except with His permission." },
    active_participle: { exampleAr: "هُوَ آذِنٌ لَهُ بِالكَلَامِ.", exampleEn: "He is giving him permission to speak." },
    passive_participle: { exampleAr: "الدُّخُولُ مَأْذُونٌ بِهِ.", exampleEn: "Entry is permitted." },
  },
  دين: {
    past: { exampleAr: "دَانَ الرَّجُلُ بِدِينِ الحَقِّ.", exampleEn: "The man adhered to the true religion." },
    present: { exampleAr: "يَدِينُ المُسْلِمُ بِتَوْحِيدِ اللهِ.", exampleEn: "The Muslim adheres to the oneness of Allah." },
    imperative: { exampleAr: "دِنْ بِدِينِ الحَقِّ وَلَا تَتَرَدَّدْ.", exampleEn: "Adhere to the true religion and do not hesitate." },
    place_or_mim_masdar: { exampleAr: "لَكُمْ دِينُكُمْ وَلِيَ دِينِ.", exampleEn: "To you your religion, and to me mine." },
    active_participle: { exampleAr: "هُوَ دَائِنٌ بِالحَقِّ.", exampleEn: "He is a firm adherent of the truth." },
    passive_participle: { exampleAr: "الرَّجُلُ مَدِينٌ لِصَدِيقِهِ بِمَالٍ.", exampleEn: "The man is in debt to his friend for money." },
  },
  وحي: {
    past: { exampleAr: "أَوْحَى اللهُ إِلَى مُوسَى.", exampleEn: "Allah revealed to Moses." },
    present: { exampleAr: "يُوحِي اللهُ إِلَى أَنْبِيَائِهِ.", exampleEn: "Allah reveals to His prophets." },
    imperative: { exampleAr: "أَوْحِ إِلَى قَلْبِهِ طُمَأْنِينَةً.", exampleEn: "Instill tranquility into his heart." },
    place_or_mim_masdar: { exampleAr: "القُرْآنُ وَحْيٌ مِنَ اللهِ.", exampleEn: "The Quran is a revelation from Allah." },
    active_participle: { exampleAr: "اللهُ مُوحٍ إِلَى أَنْبِيَائِهِ.", exampleEn: "Allah is the one who reveals to His prophets." },
    passive_participle: { exampleAr: "هَذَا القَوْلُ مُوحًى بِهِ إِلَى النَّبِيِّ.", exampleEn: "This word was revealed to the prophet." },
  },
  وكل: {
    past: { exampleAr: "تَوَكَّلَ الرَّجُلُ عَلَى اللهِ.", exampleEn: "The man placed his trust in Allah." },
    present: { exampleAr: "يَتَوَكَّلُ المُؤْمِنُ عَلَى رَبِّهِ.", exampleEn: "The believer relies upon his Lord." },
    imperative: { exampleAr: "فَتَوَكَّلْ عَلَى اللهِ.", exampleEn: "So place your trust in Allah." },
    place_or_mim_masdar: { exampleAr: "التَّوَكُّلُ لَا يُنَافِي الأَخْذَ بِالأَسْبَابِ.", exampleEn: "Trust in Allah does not contradict taking practical means." },
    active_participle: { exampleAr: "إِنَّ اللهَ يُحِبُّ المُتَوَكِّلِينَ.", exampleEn: "Indeed, Allah loves those who rely upon Him." },
    passive_participle: { exampleAr: "الأَمْرُ مُتَوَكَّلٌ فِيهِ عَلَى اللهِ.", exampleEn: "The matter is one in which trust is placed in Allah (rare, pattern-based)." },
  },
  تلو: {
    past: { exampleAr: "تَلَا القَارِئُ آيَاتِ القُرْآنِ.", exampleEn: "The reciter recited the verses of the Quran." },
    present: { exampleAr: "يَتْلُو المُسْلِمُ القُرْآنَ كُلَّ يَوْمٍ.", exampleEn: "The Muslim recites the Quran every day." },
    imperative: { exampleAr: "وَاتْلُ مَا أُوحِيَ إِلَيْكَ مِنْ كِتَابِ رَبِّكَ.", exampleEn: "And recite what has been revealed to you of your Lord's Book." },
    place_or_mim_masdar: { exampleAr: "تِلَاوَةُ القُرْآنِ عِبَادَةٌ.", exampleEn: "Recitation of the Quran is an act of worship." },
    active_participle: { exampleAr: "هُوَ تَالٍ آيَاتِ اللهِ بِخُشُوعٍ.", exampleEn: "He is a reciter of Allah's verses with humility." },
    passive_participle: { exampleAr: "القُرْآنُ مَتْلُوٌّ فِي كُلِّ مَسْجِدٍ.", exampleEn: "The Quran is recited in every mosque." },
  },
  زكو: {
    past: { exampleAr: "زَكَّى الرَّجُلُ نَفْسَهُ بِالإِحْسَانِ.", exampleEn: "The man purified himself through good deeds." },
    present: { exampleAr: "يُزَكِّي المُؤْمِنُ مَالَهُ بِالصَّدَقَةِ.", exampleEn: "The believer purifies his wealth through charity." },
    imperative: { exampleAr: "زَكِّ نَفْسَكَ بِذِكْرِ اللهِ.", exampleEn: "Purify yourself through the remembrance of Allah." },
    place_or_mim_masdar: { exampleAr: "تَزْكِيَةُ النَّفْسِ طَرِيقُ الفَلَاحِ.", exampleEn: "Purification of the soul is the path to success." },
    active_participle: { exampleAr: "هُوَ مُزَكٍّ نَفْسَهُ بِالعِبَادَةِ.", exampleEn: "He is purifying himself through worship." },
    passive_participle: { exampleAr: "القَلْبُ المُزَكَّى يَطْمَئِنُّ.", exampleEn: "The purified heart finds peace." },
  },
  فلح: {
    past: { exampleAr: "أَفْلَحَ المُؤْمِنُونَ بِإِيمَانِهِمْ.", exampleEn: "The believers succeeded through their faith." },
    present: { exampleAr: "لَا يُفْلِحُ الظَّالِمُونَ.", exampleEn: "The wrongdoers do not succeed." },
    imperative: { exampleAr: "أَفْلِحْ فِي دُنْيَاكَ وَآخِرَتِكَ.", exampleEn: "May you succeed in this life and the next." },
    place_or_mim_masdar: { exampleAr: "فِي طَاعَةِ اللهِ إِفْلَاحٌ.", exampleEn: "In obedience to Allah is success." },
    active_participle: { exampleAr: "أُولَئِكَ هُمُ المُفْلِحُونَ.", exampleEn: "Those are the successful ones." },
    passive_participle: { exampleAr: "النَّجَاحُ مُفْلَحٌ فِيهِ صَاحِبُهُ.", exampleEn: "Success is what its achiever prospers through (rare, pattern-based)." },
  },
  قدر_decree: {
    past: { exampleAr: "قَدَّرَ اللهُ أَرْزَاقَ العِبَادِ.", exampleEn: "Allah decreed the provisions of His servants." },
    present: { exampleAr: "يُقَدِّرُ اللهُ الأَمْرَ كَمَا يَشَاءُ.", exampleEn: "Allah ordains the matter as He wills." },
    imperative: { exampleAr: "قَدِّرِ الوَقْتَ الَّذِي تَحْتَاجُهُ.", exampleEn: "Estimate the time you need." },
    place_or_mim_masdar: { exampleAr: "كُلُّ شَيْءٍ بِتَقْدِيرٍ.", exampleEn: "Everything happens by a decree." },
    active_participle: { exampleAr: "اللهُ مُقَدِّرُ كُلِّ شَيْءٍ.", exampleEn: "Allah is the determiner of everything." },
    passive_participle: { exampleAr: "لِكُلِّ نَفْسٍ أَجَلٌ مُقَدَّرٌ.", exampleEn: "Every soul has a predestined term." },
  },
  ولي_turnaway: {
    past: { exampleAr: "تَوَلَّى القَوْمُ عَنِ الحَقِّ.", exampleEn: "The people turned away from the truth." },
    present: { exampleAr: "مَنْ يَتَوَلَّهُمْ فَهُوَ مِنْهُمْ.", exampleEn: "Whoever takes them as allies is one of them." },
    imperative: { exampleAr: "لَا تَتَوَلَّ عَنِ الحَقِّ.", exampleEn: "Do not turn away from the truth." },
    place_or_mim_masdar: { exampleAr: "فِي تَوَلِّيهِ ضَرَرٌ عَلَيْهِ.", exampleEn: "There is harm to him in his turning away." },
    active_participle: { exampleAr: "هُوَ مُتَوَلٍّ أَمْرَ القَوْمِ.", exampleEn: "He is the one in charge of the people's affairs." },
    passive_participle: { exampleAr: "الأَمْرُ مُتَوَلًّى مِنْ قِبَلِهِ.", exampleEn: "The matter is one taken charge of by him (rare, pattern-based)." },
  },
  حقق_stative: {
    past: { exampleAr: "حَقَّتْ كَلِمَةُ رَبِّكَ.", exampleEn: "The word of your Lord was proven true." },
    present: { exampleAr: "يَحِقُّ الحَقُّ وَيَبْطُلُ البَاطِلُ.", exampleEn: "The truth is established and falsehood is nullified." },
    imperative: { exampleAr: "حِقَّ يَا حَقُّ وَلَا تَزَلْ.", exampleEn: "Be established, O truth, and do not cease." },
    place_or_mim_masdar: { exampleAr: "الحَقُّ أَحَقُّ أَنْ يُتَّبَعَ.", exampleEn: "The truth is more worthy of being followed." },
    active_participle: { exampleAr: "القَوْلُ الحَاقُّ لَا يَتَبَدَّلُ.", exampleEn: "The binding word does not change." },
    passive_participle: { exampleAr: "هُوَ مَحْقُوقٌ بِالاِحْتِرَامِ.", exampleEn: "He is deserving of respect." },
  },
  أخر_delay: {
    past: { exampleAr: "أَخَّرَ اللهُ أَجَلَهُ.", exampleEn: "Allah delayed his appointed time." },
    present: { exampleAr: "لَنْ يُؤَخِّرَ اللهُ نَفْسًا إِذَا جَاءَ أَجَلُهَا.", exampleEn: "Allah will never delay a soul when its time comes." },
    imperative: { exampleAr: "أَخِّرِ السَّفَرَ إِلَى الغَدِ.", exampleEn: "Postpone the trip to tomorrow." },
    place_or_mim_masdar: { exampleAr: "لَا تَأْخِيرَ فِي أَدَاءِ الوَاجِبِ.", exampleEn: "There should be no delay in fulfilling one's duty." },
    active_participle: { exampleAr: "اللهُ مُؤَخِّرُ الآجَالِ كَمَا يَشَاءُ.", exampleEn: "Allah delays terms as He wills." },
    passive_participle: { exampleAr: "المَوْعِدُ مُؤَخَّرٌ إِلَى الأُسْبُوعِ القَادِمِ.", exampleEn: "The appointment is postponed to next week." },
  },
  شرك_associate: {
    past: { exampleAr: "أَشْرَكَ الرَّجُلُ بِرَبِّهِ.", exampleEn: "The man associated partners with his Lord." },
    present: { exampleAr: "لَا يُشْرِكُ المُؤْمِنُ بِاللهِ شَيْئًا.", exampleEn: "The believer does not associate anything with Allah." },
    imperative: { exampleAr: "لَا تُشْرِكْ بِاللهِ.", exampleEn: "Do not associate partners with Allah." },
    place_or_mim_masdar: { exampleAr: "الإِشْرَاكُ بِاللهِ ظُلْمٌ عَظِيمٌ.", exampleEn: "Associating partners with Allah is a great wrong." },
    active_participle: { exampleAr: "جَاءَ المُشْرِكُ يَسْأَلُ عَنِ الإِسْلَامِ.", exampleEn: "The polytheist came asking about Islam." },
    passive_participle: { exampleAr: "لَا شَيْءَ مُشْرَكٌ بِهِ مَعَ اللهِ.", exampleEn: "Nothing is to be associated as a partner with Allah." },
  },
  سوأ_evil: {
    past: { exampleAr: "سَاءَتْ أَعْمَالُهُمْ.", exampleEn: "Their deeds were evil." },
    present: { exampleAr: "يَسُوءُ الكَذِبُ صَاحِبَهُ.", exampleEn: "Lying brings harm to its doer." },
    imperative: { exampleAr: "لَا تَسُؤْ إِلَى أَحَدٍ.", exampleEn: "Do not be evil to anyone." },
    place_or_mim_masdar: { exampleAr: "السُّوءُ يَعُودُ عَلَى صَاحِبِهِ.", exampleEn: "Evil returns upon the one who does it." },
    active_participle: { exampleAr: "السُّلُوكُ السَّيِّئُ مَرْفُوضٌ.", exampleEn: "Bad behavior is rejected." },
    passive_participle: { exampleAr: "هُوَ مَسُوءٌ مِنْ تَصَرُّفِ صَدِيقِهِ.", exampleEn: "He is distressed by his friend's behavior." },
  },
  لقي_meet: {
    past: { exampleAr: "لَقِيَ الرَّجُلُ صَدِيقَهُ فِي السُّوقِ.", exampleEn: "The man met his friend in the market." },
    present: { exampleAr: "يَلْقَى المُؤْمِنُ رَبَّهُ يَوْمَ القِيَامَةِ.", exampleEn: "The believer will meet his Lord on the Day of Resurrection." },
    imperative: { exampleAr: "اِلْقَ صَدِيقَكَ بِوَجْهٍ طَلْقٍ.", exampleEn: "Meet your friend with a cheerful face." },
    place_or_mim_masdar: { exampleAr: "لِقَاءُ اللهِ حَقٌّ.", exampleEn: "The meeting with Allah is true." },
    active_participle: { exampleAr: "هُوَ لَاقٍ رَبَّهُ يَوْمًا.", exampleEn: "He will meet his Lord one day." },
    passive_participle: { exampleAr: "الخَيْرُ مَلْقِيٌّ مِنْ كُلِّ صَادِقٍ.", exampleEn: "Good is what one meets with from every truthful person." },
  },
  خلف_succeed: {
    past: { exampleAr: "خَلَفَ الابْنُ أَبَاهُ فِي التِّجَارَةِ.", exampleEn: "The son succeeded his father in the trade." },
    present: { exampleAr: "يَخْلُفُ جِيلٌ جِيلًا.", exampleEn: "One generation succeeds another." },
    imperative: { exampleAr: "اُخْلُفْنِي فِي قَوْمِي وَأَصْلِحْ.", exampleEn: "Take my place among my people and do right." },
    place_or_mim_masdar: { exampleAr: "جَعَلَ اللهُ آدَمَ خَلِيفَةً فِي الأَرْضِ.", exampleEn: "Allah made Adam a steward on the earth." },
    active_participle: { exampleAr: "هُوَ خَالِفٌ أَبَاهُ فِي العَمَلِ.", exampleEn: "He is succeeding his father in the work." },
    passive_participle: { exampleAr: "كُلُّ جِيلٍ مَخْلُوفٌ بِجِيلٍ آخَرَ.", exampleEn: "Every generation is succeeded by another." },
  },
  أجر_wage: {
    past: { exampleAr: "أَجَرَ التَّاجِرُ العَامِلَ عَلَى عَمَلِهِ.", exampleEn: "The merchant paid the worker a wage for his work." },
    present: { exampleAr: "يَأْجُرُ العَامِلُ نَفْسَهُ عِنْدَ التَّاجِرِ.", exampleEn: "The worker hires himself out to the merchant." },
    imperative: { exampleAr: "اُؤْجُرِ العَامِلَ حَقَّهُ.", exampleEn: "Pay the worker his due wage." },
    place_or_mim_masdar: { exampleAr: "أَجْرُكُمْ عِنْدَ رَبِّكُمْ.", exampleEn: "Your reward is with your Lord." },
    active_participle: { exampleAr: "هُوَ آجِرٌ عُمَّالَهُ حَقَّهُمْ.", exampleEn: "He pays his workers their due." },
    passive_participle: { exampleAr: "العَامِلُ الصَّادِقُ مَأْجُورٌ.", exampleEn: "The honest worker is rewarded." },
  },
  نجو_save: {
    past: { exampleAr: "نَجَّى اللهُ نُوحًا مِنَ الطُّوفَانِ.", exampleEn: "Allah saved Noah from the flood." },
    present: { exampleAr: "يُنَجِّي اللهُ المُؤْمِنِينَ مِنَ الشِّدَّةِ.", exampleEn: "Allah saves the believers from hardship." },
    imperative: { exampleAr: "نَجِّ صَدِيقَكَ مِنَ الخَطَرِ.", exampleEn: "Save your friend from danger." },
    place_or_mim_masdar: { exampleAr: "تَنْجِيَةُ الغَرِيقِ وَاجِبَةٌ.", exampleEn: "Rescuing the drowning person is a duty." },
    active_participle: { exampleAr: "اللهُ مُنَجِّي عِبَادِهِ الصَّالِحِينَ.", exampleEn: "Allah is the savior of His righteous servants." },
    passive_participle: { exampleAr: "نُوحٌ مُنَجًّى مِنَ الغَرَقِ.", exampleEn: "Noah is saved from drowning." },
  },
  وجه_towards: {
    past: { exampleAr: "تَوَجَّهَ الرَّجُلُ إِلَى المَسْجِدِ.", exampleEn: "The man headed towards the mosque." },
    present: { exampleAr: "يَتَوَجَّهُ الحَاجُّ إِلَى مَكَّةَ.", exampleEn: "The pilgrim heads towards Makkah." },
    imperative: { exampleAr: "تَوَجَّهْ إِلَى القِبْلَةِ لِلصَّلَاةِ.", exampleEn: "Turn towards the qibla for prayer." },
    place_or_mim_masdar: { exampleAr: "فِي تَوَجُّهِهِ إِلَى اللهِ سَكِينَةٌ.", exampleEn: "In his turning to Allah there is tranquility." },
    active_participle: { exampleAr: "هُوَ مُتَوَجِّهٌ إِلَى بَيْتِهِ.", exampleEn: "He is heading home." },
    passive_participle: { exampleAr: "المَكَانُ مُتَوَجَّهٌ إِلَيْهِ مِنْ كُلِّ جِهَةٍ.", exampleEn: "The place is headed to from every direction (rare, pattern-based)." },
  },
  كلم_address: {
    past: { exampleAr: "كَلَّمَ اللهُ مُوسَى تَكْلِيمًا.", exampleEn: "Allah spoke to Moses directly." },
    present: { exampleAr: "يُكَلِّمُ المُعَلِّمُ طُلَّابَهُ بِلُطْفٍ.", exampleEn: "The teacher speaks to his students gently." },
    imperative: { exampleAr: "كَلِّمْ أَبَاكَ فِي هَذَا الأَمْرِ.", exampleEn: "Speak to your father about this matter." },
    place_or_mim_masdar: { exampleAr: "تَكْلِيمُ اللهِ مُوسَى مُعْجِزَةٌ.", exampleEn: "Allah's speaking to Moses is a miracle." },
    active_participle: { exampleAr: "هُوَ مُكَلِّمٌ صَدِيقَهُ عَنْ رِحْلَتِهِ.", exampleEn: "He is telling his friend about his trip." },
    passive_participle: { exampleAr: "مُوسَى مُكَلَّمُ اللهِ.", exampleEn: "Moses is the one spoken to directly by Allah." },
  },
  حسب_suppose: {
    past: { exampleAr: "حَسِبَ الوَلَدُ الاِمْتِحَانَ سَهْلًا.", exampleEn: "The boy thought the exam was easy." },
    present: { exampleAr: "أَيَحْسَبُ الإِنْسَانُ أَلَّنْ نَجْمَعَ عِظَامَهُ.", exampleEn: "Does man think that We will not assemble his bones?" },
    imperative: { exampleAr: "لَا تَحْسَبَنَّ اللهَ غَافِلًا عَمَّا يَعْمَلُ الظَّالِمُونَ.", exampleEn: "Never think that Allah is unaware of what the wrongdoers do." },
    place_or_mim_masdar: { exampleAr: "كَانَ ذَلِكَ فِي حُسْبَانِهِ.", exampleEn: "That was within his reckoning/expectation." },
    active_participle: { exampleAr: "هُوَ حَاسِبٌ أَنَّ صَدِيقَهُ صَادِقٌ.", exampleEn: "He is one who supposes his friend to be truthful." },
    passive_participle: { exampleAr: "هُوَ مَحْسُوبٌ مِنَ الصَّالِحِينَ.", exampleEn: "He is considered among the righteous." },
  },
};

const reviewFormNotes: Record<string, Partial<Record<SarfFormKey, string>>> = {
  أخذ: {
    place_or_mim_masdar: "مَأْخَذ can mean a source, approach, or point of criticism; verify the beginner-facing meaning.",
  },
  أكل: {
    place_or_mim_masdar: "مَأْكَل can refer to eating, food, or an eating place; verify the intended beginner-facing meaning.",
  },
  سأل: {
    place_or_mim_masdar: "مَسْأَلَة is a common noun for a question or issue, not a simple physical place noun.",
    passive_participle: "مَسْؤُول commonly means responsible; verify this card's passive-participle explanation.",
  },
  قرأ: {
    place_or_mim_masdar: "مَقْرَأ is less common for beginners than قِرَاءَة; verify the place/mim-masdar choice.",
  },
  وجد: {
    place_or_mim_masdar: "مَوْجِد is pattern-based and less common in beginner usage; needs human review.",
    passive_participle: "مَوْجُود commonly means existing or present, not only passively found.",
  },
  وصل: {
    place_or_mim_masdar: "مَوْصِل can mean a connector or junction; verify the place-noun framing.",
  },
  وقف: {
    passive_participle: "مَوْقُوف often means stopped, suspended, or detained; verify context before review.",
  },
  كسر: {
    place_or_mim_masdar: "مَكْسِر is a pattern-based place noun and may be less common than the passive مَكْسُور for beginners; verify before review.",
  },
  حسب: {
    place_or_mim_masdar: "مَحْسَب is pattern-based here and less beginner-natural than حِسَاب; verify the intended card.",
  },
  سهر: {
    place_or_mim_masdar: "مَسْهَر is pattern-based and uncommon for beginners; سَهَر is the more familiar masdar.",
    passive_participle: "مَسْهُور is uncommon as a standalone passive participle; the example uses مَسْهُورٌ فِيهِ to make the sense explicit.",
  },
  صعب: {
    imperative: "صَعُبَ is mainly stative/adjectival in Form I, so this imperative is grammatical-pattern based but not beginner-natural.",
    place_or_mim_masdar: "مَصْعَب is pattern-based and less common for beginners; صُعُوبَة is the common abstract noun.",
    active_participle: "صَاعِب is pattern-based; صَعْب is the normal beginner adjective for difficult.",
    passive_participle: "مَصْعُوب is uncommon; مَصْعُوبٌ عَلَى can mean made difficult for someone.",
  },
  طلق: {
    imperative: "Form I imperative is pattern-based here; beginners more often meet related forms such as أَطْلَقَ for releasing.",
    place_or_mim_masdar: "مَطْلَق is common as a noun meaning starting point or unrestricted sense, not a simple physical place noun.",
    active_participle: "طَالِق is common in phrases like طَلِيقُ اللِّسَان; verify the plain active-participle framing.",
    passive_participle: "مَطْلُوق is more naturally tied to the transitive sense released or set loose.",
  },
  عمر: {
    imperative: "اُعْمُرْ is valid for inhabit/fill, but less beginner-common than nouns like عُمْر and عُمْرَان.",
    place_or_mim_masdar: "مَعْمَر can mean dwelling place or a long-lived person depending context; verify the learner-facing sense.",
    active_participle: "عَامِر commonly means inhabited, flourishing, or full; verify this active-participle explanation.",
  },
  برك: {
    place_or_mim_masdar: "مَبْرَك is a concrete place noun tied to kneeling, not the abstract blessing sense.",
    passive_participle: "مَبْرُوك is common in modern speech for congratulations/blessed, but this card uses the pattern-based passive sense; verify before review.",
  },
  جهد: {
    place_or_mim_masdar: "مَجْهَد is pattern-based and less beginner-natural than جَهْد or اِجْتِهَاد.",
    active_participle: "جَاهِد is pattern-based; learners more often meet مُجْتَهِد for a hardworking person.",
    passive_participle: "مَجْهُود is common as a noun for effort, so the passive-participle framing needs review.",
  },
  ورث: {
    present: "Initial-waw weak verb; the و drops in the present.",
    imperative: "Initial-waw weak verb; the imperative drops the initial و.",
    place_or_mim_masdar: "مَوْرِث can mean a source/cause of inheritance or an ancestor; verify the learner-facing sense.",
  },
  وقد: {
    present: "Initial-waw weak verb; the و drops in the present. The feminine تَقِدُ is used because النَّار is grammatically feminine.",
    imperative: "Initial-waw weak verb; the imperative drops the initial و. This command is pattern-based and not very beginner-natural.",
    place_or_mim_masdar: "مَوْقِد is a common place/tool noun such as fireplace or stove, but it overlaps with the Form IV verb أَوْقَدَ.",
    active_participle: "وَاقِد is less beginner-common than related words like وَقُود and مُوقَد.",
    passive_participle: "مَوْقُود is pattern-based for kindled/burned fuel; verify the example before review.",
  },
  وقع: {
    present: "Initial-waw weak verb; the و drops in the present.",
    imperative: "Initial-waw weak verb; the imperative drops the initial و. The command is grammatical but less beginner-natural.",
    passive_participle: "مَوْقُوع is uncommon as a standalone passive participle; مَوْقُوعٌ فِيهِ is a more explicit pattern-based phrase.",
  },
  ملأ: {
    imperative: "Final-hamza verb; keep hamzat waṣl at the start and final hamza in اِمْلَأْ.",
    place_or_mim_masdar: "مَمْلَأ is pattern-based and uncommon for beginners; مِلْء is the more familiar noun for fullness/filling.",
    active_participle: "Final-hamza active participle; verify spelling and case behavior in connected phrases.",
  },
  مرر: {
    passive_participle: "مَرَّ is usually intransitive (pass by, often with بِـ); a standalone passive participle is pattern-based and rarely used.",
  },
  نسخ: {
    active_participle: "نَاسِخ and its passive مَنْسُوخ also carry the classical/tafsir sense of an abrogating/abrogated ruling; verify the beginner-facing meaning.",
    passive_participle: "مَنْسُوخ also commonly means abrogated in classical usage; verify the beginner-facing meaning.",
  },
  وضأ: {
    imperative: "Form V verb; the root وضأ starts with و, so it is exempt from the seed-data hamzat-waṣl imperative check even though تَوَضَّأْ itself starts with ت.",
    place_or_mim_masdar: "Form V verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَوَضُّؤ instead of a fabricated place noun.",
    passive_participle: "تَوَضَّأَ is reflexive/intransitive, so a standalone passive participle is pattern-based and essentially unused in practice.",
  },
  يقظ: {
    place_or_mim_masdar: "Form X verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar اِسْتِيقَاظ instead of a fabricated place noun.",
    passive_participle: "اِسْتَيْقَظَ is intransitive, so a standalone passive participle is pattern-based and rarely used.",
  },
  كنس: {
    place_or_mim_masdar: "مَكْنَس is pattern-based; the everyday word for the tool is مِكْنَسَة (broom), not this place noun.",
  },
  كوي: {
    place_or_mim_masdar: "مَكْوًى is pattern-based and uncommon; the everyday word for the tool is مِكْوَاة (iron).",
  },
  طوع: {
    imperative: "اِسْتَطَاعَ is a modal/stative verb (to be able), so a command form is grammatically valid but rarely used naturally.",
    place_or_mim_masdar: "Form X verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar اِسْتِطَاعَة instead of a fabricated place noun.",
    passive_participle: "اِسْتَطَاعَ is intransitive/modal, so a standalone passive participle is pattern-based and rarely used.",
  },
  بدأ: {
    passive_participle: "مَبْدُوء is grammatically valid but uncommon as a standalone passive participle; verify before review.",
  },
  نهي: {
    place_or_mim_masdar: "Form VIII verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar اِنْتِهَاء instead of a fabricated place noun.",
    active_participle: "مُنْتَهٍ is common in the set phrase مُنْتَهِي الصَّلَاحِيَة (expired); verify the plain beginner-facing gloss.",
    passive_participle: "مُنْتَهًى functions more as a noun (utmost/endpoint, e.g. بِمُنْتَهَى الدِّقَّة) than a literal passive participle; verify the framing before review.",
  },
  صحح: {
    place_or_mim_masdar: "Form II verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَصْحِيح instead of a fabricated place noun.",
  },
  حبب: {
    imperative: "The imperative of a verb of state/emotion like أَحَبَّ is grammatically valid but rarely used as a real command.",
    place_or_mim_masdar: "Form IV verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar حُبّ instead of a fabricated place noun.",
    passive_participle: "مَحْبُوب (Form I pattern) is the far more common word for beloved in everyday use; مُحَبّ is the grammatically regular but comparatively rare Form IV passive participle shown here.",
  },
  رسم: {
    place_or_mim_masdar: "مَرْسَم (studio) is pattern-based and less common than the masdar رَسْم; verify before review.",
    passive_participle: "مَرْسُوم very commonly means a (royal/official) decree; verify the plain drawn sense is clear in context.",
  },
  خير: {
    place_or_mim_masdar: "Form VIII verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar اِخْتِيَار instead of a fabricated place noun.",
    passive_participle: "For this hollow Form VIII root, the active and passive participles share the identical written shape مُخْتَار; only context distinguishes chooser from chosen. This is not a typo.",
  },
  روح: {
    place_or_mim_masdar: "Form X verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar اِسْتِرَاحَة, which also commonly means a roadside rest stop.",
    passive_participle: "اِسْتَرَاحَ is intransitive, so a standalone passive participle is pattern-based and rarely used.",
  },
  بقي: {
    place_or_mim_masdar: "مَبْقًى is pattern-based and rare; verify before review.",
    passive_participle: "بَقِيَ is intransitive (to remain), so a standalone passive participle is pattern-based, awkward, and rarely used.",
  },
  قضي: {
    active_participle: "قَاضٍ overwhelmingly means judge in everyday and religious usage; verify this narrower spending-time gloss is clear in context.",
    passive_participle: "مَقْضِيّ commonly carries the classical sense of decreed/decided (e.g. أَمْرًا مَقْضِيًّا); verify the plain spent sense is clear in context.",
  },
  حضر: {
    place_or_mim_masdar: "مَحْضَر also commonly means an official record or minutes (e.g. of a meeting); verify the beginner-facing gloss.",
    passive_participle: "حَضَرَ is typically intransitive (to attend/be present), so a standalone passive participle is pattern-based and uncommon.",
  },
  نقل: {
    place_or_mim_masdar: "Form VIII verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar اِنْتِقَال instead of a fabricated place noun.",
    passive_participle: "مُنْتَقَل is grammatically valid but uncommon as a standalone passive participle; verify before review.",
  },
  غرق: {
    imperative: "اِسْتَغْرَقَ (to take/absorb time) is rarely commanded in practice; the imperative shown is grammatically valid but pattern-based.",
    place_or_mim_masdar: "Form X verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar اِسْتِغْرَاق instead of a fabricated place noun.",
    passive_participle: "مُسْتَغْرَق is grammatically valid but uncommon as a standalone passive participle; verify before review.",
  },
  زحم: {
    imperative: "اِزْدَحَمَ (to be crowded) is rarely commanded in practice; the imperative shown is grammatically valid but pattern-based.",
    place_or_mim_masdar: "Form VIII verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar اِزْدِحَام instead of a fabricated place noun. The ت of the اِفْتَعَلَ pattern regularly assimilates to د after ز.",
  },
  حجز: {
    place_or_mim_masdar: "مَحْجَز is pattern-based and uncertain; verify before review.",
    active_participle: "حَاجِز very commonly means barrier/obstacle; verify the booking sense is clear in context.",
  },
  أكد: {
    place_or_mim_masdar: "Form II verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَأْكِيد instead of a fabricated place noun.",
  },
  حلق: {
    place_or_mim_masdar: "مَحْلَق is pattern-based and uncommon; the everyday phrase for a barbershop is مَحَلّ حِلَاقَة.",
  },
  رمي: {
    passive_participle: "مَرْمِيّ is grammatically regular but less commonly used standalone than the active/place forms; verify before review.",
  },
  سعي: {
    active_participle: "سَاعٍ also commonly means courier/postal carrier (e.g. سَاعِي البَرِيد); verify the striving sense is clear in context.",
    passive_participle: "مَسْعِيّ is pattern-based and rare; verify before review.",
  },
  خلع: {
    passive_participle: "مَخْلُوع commonly means deposed (of a ruler); verify the plain taken-off sense is clear in context.",
  },
  رفع: {
    imperative: "اِرْتَفَعَ (to rise) is rarely commanded in practice; the imperative shown is grammatically valid but pattern-based.",
    place_or_mim_masdar: "Form VIII verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar اِرْتِفَاع instead of a fabricated place noun.",
    passive_participle: "مُرْتَفَع is a common standalone noun for highland/elevated area, not a strict passive sense of being raised; verify the framing before review.",
  },
  شفي: {
    imperative: "This verb is classically most common in supplication (e.g. اللّٰهُمَّ اشْفِهِ); a plain command form is grammatical but less natural.",
    passive_participle: "مَشْفِيّ is grammatically valid but uncommon as a standalone passive participle; verify before review.",
  },
  فحص: {
    place_or_mim_masdar: "مَفْحَص is pattern-based and rare; verify before review.",
  },
  عود: {
    active_participle: "مُعِيد commonly means teaching assistant/instructor at a university, alongside the plain sense of one who repeats; verify the gloss shown fits the card's context.",
    passive_participle: "مُعَاد also commonly means recycled in modern usage; verify the plain returned sense is clear in context.",
  },
  شور: {
    active_participle: "مُشِير is also the term for the military rank Field Marshal; verify the plain indicating sense is clear in context.",
    passive_participle: "مُشَار is mainly seen in the fixed legal/formal phrase المُشَار إِلَيْهِ (the aforementioned); verify the framing before review.",
    place_or_mim_masdar: "إِشَارَة also commonly means a traffic signal/sign; verify the beginner-facing gloss.",
  },
  قول: {
    place_or_mim_masdar: "مَقَال is the everyday word for a written article, one step removed from a literal place noun; verify before review.",
    passive_participle: "مَقُول is grammatically valid but not very common as a standalone passive participle; verify before review.",
  },
  رتب: {
    place_or_mim_masdar: "Form II verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَرْتِيب instead of a fabricated place noun.",
    passive_participle: "مُرَتَّب very commonly means salary/wages in everyday usage, alongside the plain arranged sense; verify the gloss shown fits the card's context.",
  },
  بدل: {
    place_or_mim_masdar: "Form VI verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَبَادُل instead of a fabricated place noun.",
    active_participle: "مُتَبَادِل functions mainly as the adjective mutual/reciprocal (e.g. اِحْتِرَام مُتَبَادِل) rather than literally one who exchanges; verify the framing before review.",
    passive_participle: "For this reciprocal Form VI verb, the active and passive participles overlap heavily in everyday usage; verify before review.",
  },
  جوب: {
    place_or_mim_masdar: "Form IV verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar إِجَابَة instead of a fabricated place noun.",
  },
  صلو: {
    place_or_mim_masdar: "صَلَاة is an irregular/lexicalized masdar (the regular Form II pattern would be تَصْلِيَة); use صَلَاة exactly as given by the source vocabulary list.",
    active_participle: "Defective Form II active participle; drops the final radical in the indefinite nominative (مُصَلٍّ).",
    passive_participle: "مُصَلًّى is a very common noun for a prayer room/prayer area, functioning more as a place noun than a literal passive participle; verify the framing before review.",
  },
  رود: {
    place_or_mim_masdar: "Form IV verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar إِرَادَة instead of a fabricated place noun.",
    active_participle: "مُرِيد also commonly means a Sufi disciple/devotee; verify the plain wanting sense is clear in context.",
  },
  نوم: {
    passive_participle: "نَامَ is intransitive, so a standalone passive participle is pattern-based, awkward, and essentially unused; verify before review.",
  },
  فضل: {
    place_or_mim_masdar: "Form II verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَفْضِيل instead of a fabricated place noun.",
  },
  حول: {
    place_or_mim_masdar: "Form II verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَحْوِيل instead of a fabricated place noun.",
  },
  سفر: {
    place_or_mim_masdar: "The source gives both مُسَافَرَة and سَفَر as the masdar; سَفَر (journey) is used here as the more common everyday word.",
    passive_participle: "سَافَرَ is typically intransitive (to travel), so a standalone passive participle is pattern-based and rarely used.",
  },
  كون: {
    active_participle: "كَائِن (being, entity) is common in phrases like الكَائِنَات الحَيَّة (living beings); verify the plain gloss fits the card's context.",
    place_or_mim_masdar: "مَكَان is the ordinary word for place in general; its link to this specific verb is etymological rather than a regular Form-I pattern for كان.",
    passive_participle: "كَانَ functions as a copula/auxiliary verb and has essentially no standalone passive participle in real usage; this form is included only to satisfy the six-form structure and should not be treated as a real word to teach.",
  },
  كمل: {
    place_or_mim_masdar: "Form IV verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar إِكْمَال instead of a fabricated place noun.",
  },
  صبح: {
    imperative: "أَصْبَحَ functions as an auxiliary/stative verb (a kaana-sister), so a command form is grammatically valid but essentially never used.",
    place_or_mim_masdar: "Form IV verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar إِصْبَاح, itself an unusual/rarely invoked noun since أَصْبَحَ mainly functions as an auxiliary.",
    active_participle: "مُصْبِح is grammatically valid but essentially unused standalone, since أَصْبَحَ is mainly an auxiliary/stative verb; verify before review.",
    passive_participle: "أَصْبَحَ has no natural passive participle in real usage; this form is included only to satisfy the six-form structure and should not be treated as a real word to teach.",
  },
  سوق: {
    place_or_mim_masdar: "Form V verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَسَوُّق instead of a fabricated place noun.",
    passive_participle: "تَسَوَّقَ is intransitive/reflexive, so a standalone passive participle is pattern-based and rarely used.",
  },
  مطر: {
    imperative: "أَمْطَرَ is an impersonal weather verb, so a command form is grammatically valid but only ever used figuratively/poetically, never as a real instruction.",
    place_or_mim_masdar: "Form IV verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar إِمْطَار instead of a fabricated place noun.",
  },
  كلم: {
    place_or_mim_masdar: "Form V verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَكَلُّم instead of a fabricated place noun.",
    active_participle: "مُتَكَلِّم also specifically means grammatical first person (ضَمِير المُتَكَلِّم) and, in classical theology, a scholastic theologian; verify the plain speaking sense is clear in context.",
    passive_participle: "تَكَلَّمَ is typically intransitive, so a standalone passive participle is pattern-based and rarely used; verify before review.",
  },
  زوج: {
    place_or_mim_masdar: "The source gives both تَزَوُّج and زَوَاج as the masdar; تَزَوُّج (the regular Form V pattern) is used here, with زَوَاج noted as the more common everyday word for marriage.",
    passive_participle: "Native speakers typically use the verb تُزُوِّجَتْ rather than this participle; مُتَزَوَّج is pattern-based and rarely used standalone. Verify before review.",
  },
  لوث: {
    imperative: "تَلَوَّثَ (to become polluted) is rarely commanded in practice; the example given uses a loose, informal 'get muddy' sense to keep the sentence natural.",
    place_or_mim_masdar: "Form V verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَلَوُّث instead of a fabricated place noun.",
  },
  قوم: {
    place_or_mim_masdar: "Form IV verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar إِقَامَة instead of a fabricated place noun.",
    passive_participle: "مُقَام is also a common noun for a shrine, rank, or station, not only a strict passive of held/established; verify the framing before review.",
  },
  غدر: {
    place_or_mim_masdar: "Form III verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar مُغَادَرَة instead of a fabricated place noun.",
    passive_participle: "غَادَرَ is typically intransitive (to depart), so a standalone passive participle is pattern-based and rarely used.",
  },
  صوم: {
    place_or_mim_masdar: "مَصَام is pattern-based and not a standard word; there is no common place noun for this root. Verify before review.",
    passive_participle: "صَامَ is intransitive (to fast), so a standalone passive participle is pattern-based, awkward, and essentially unused.",
  },
  طوف: {
    place_or_mim_masdar: "المَطَاف is the well-known name for the tawaf area around the Kaaba; a strong, source-independent everyday word.",
    passive_participle: "مَطُوف is grammatically valid but uncommon as a standalone passive participle; verify before review.",
  },
  لبي: {
    place_or_mim_masdar: "Form II verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَلْبِيَة instead of a fabricated place noun.",
    active_participle: "Defective Form II active participle, specialized to Hajj/Umrah contexts; drops the final radical in the indefinite nominative (مُلَبٍّ).",
    passive_participle: "مُلَبًّى is pattern-based and rare; verify before review.",
  },
  صوب: {
    imperative: "أَصَابَ in the afflicted/hit sense is rarely commanded; the example instead uses the related hit-a-target sense, which is more naturally a command.",
    place_or_mim_masdar: "Form IV verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar إِصَابَة instead of a fabricated place noun.",
    active_participle: "مُصِيب very commonly means correct/right (of an opinion or answer), which is actually more frequent in everyday use than the afflicting sense; verify the gloss shown fits the card's context.",
  },
  غيب: {
    place_or_mim_masdar: "Form V verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar تَغَيُّب instead of a fabricated place noun.",
    passive_participle: "تَغَيَّبَ is typically intransitive, so a standalone passive participle is pattern-based and rarely used; verify before review.",
  },
  عطو: {
    place_or_mim_masdar: "The source gives both عَطَاء and إِعْطَاء as the masdar; عَطَاء is used here as the more common everyday word for a gift/grant.",
    passive_participle: "مُعْطًى is also the everyday word for a datum/given (plural مُعْطَيَات, data), a very common modern academic usage; verify the gloss shown fits the card's context.",
  },
  سعد: {
    place_or_mim_masdar: "Form III verbs have no distinct place-noun pattern; this slot reuses the source-verified masdar مُسَاعَدَة instead of a fabricated place noun.",
  },
  رأي: {
    imperative: "The source itself flags this imperative as grammatically valid but uncommon for learners; اُنْظُرْ (look!) is what learners typically meet instead. Kept here exactly as given.",
    active_participle: "رَاءٍ is a rare/classical word; everyday Arabic more often expresses this idea with a full clause rather than a participle. Verify before review.",
  },
};

const exampleFor = (
  root: string,
  key: SarfFormKey,
  fallback: DraftExample,
): DraftExample => reviewExamples[root]?.[key] ?? fallback;

const noteFor = (pattern: DraftPattern, key: SarfFormKey): string => {
  const note = pattern.formNotes?.[key] ?? reviewFormNotes[pattern.root]?.[key];
  if (!note) return AI_DRAFT_NOTE;
  return note.startsWith(AI_DRAFT_NOTE) ? note : `${AI_DRAFT_NOTE} ${note}`;
};

const buildForms = (pattern: DraftPattern): SarfForm[] => [
    {
      order: 1,
      key: "past",
      ...label("past"),
      arabic: pattern.past,
      transliteration: pattern.transliterations?.past ?? pattern.transliterationBase,
      meaningEn: pattern.formMeanings.past,
      ...exampleFor(pattern.root, "past", {
        exampleAr: `${pattern.past} الرَّجُلُ.`,
        exampleEn: `The man ${pattern.formMeanings.past.replace("he ", "")}.`,
      }),
      notes: noteFor(pattern, "past"),
    },
    {
      order: 2,
      key: "present",
      ...label("present"),
      arabic: pattern.present,
      transliteration: pattern.transliterations?.present ?? `ya-${pattern.transliterationBase}`,
      meaningEn: pattern.formMeanings.present,
      ...exampleFor(pattern.root, "present", {
        exampleAr: `${pattern.present} الطَّالِبُ.`,
        exampleEn: `The student ${pattern.formMeanings.present.replace("he ", "")}.`,
      }),
      notes: noteFor(pattern, "present"),
    },
    {
      order: 3,
      key: "imperative",
      ...label("imperative"),
      arabic: pattern.imperative,
      transliteration: pattern.transliterations?.imperative ?? `i/u-${pattern.transliterationBase}`,
      meaningEn: pattern.formMeanings.imperative,
      ...exampleFor(pattern.root, "imperative", {
        exampleAr: `${pattern.imperative} يَا صَدِيقِي.`,
        exampleEn: `${pattern.formMeanings.imperative} my friend.`,
      }),
      notes: noteFor(pattern, "imperative"),
    },
    {
      order: 4,
      key: "place_or_mim_masdar",
      ...label("place_or_mim_masdar"),
      arabic: pattern.place,
      transliteration:
        pattern.transliterations?.place_or_mim_masdar ?? `ma-${pattern.transliterationBase}`,
      meaningEn: pattern.formMeanings.place,
      ...exampleFor(pattern.root, "place_or_mim_masdar", {
        exampleAr: `هٰذَا ${pattern.place}.`,
        exampleEn: `This is ${pattern.formMeanings.place}.`,
      }),
      notes: noteFor(pattern, "place_or_mim_masdar"),
    },
    {
      order: 5,
      key: "active_participle",
      ...label("active_participle"),
      arabic: pattern.active,
      transliteration:
        pattern.transliterations?.active_participle ??
        `faaʿil pattern of ${pattern.transliterationBase}`,
      meaningEn: pattern.formMeanings.active,
      ...exampleFor(pattern.root, "active_participle", {
        exampleAr: `هُوَ ${pattern.active}.`,
        exampleEn: `He is ${pattern.formMeanings.active}.`,
      }),
      notes: noteFor(pattern, "active_participle"),
    },
    {
      order: 6,
      key: "passive_participle",
      ...label("passive_participle"),
      arabic: pattern.passive,
      transliteration:
        pattern.transliterations?.passive_participle ??
        `mafʿuul pattern of ${pattern.transliterationBase}`,
      meaningEn: pattern.formMeanings.passive,
      ...exampleFor(pattern.root, "passive_participle", {
        exampleAr: `الأَمْرُ ${pattern.passive}.`,
        exampleEn: `The matter is ${pattern.formMeanings.passive}.`,
      }),
      notes: noteFor(pattern, "passive_participle"),
    },
];

const draft = (
  pattern: DraftPattern,
  options: { includeQuranicMetadata?: boolean } = {},
): RootEntry => ({
  root: pattern.root,
  displayRoot: [...pattern.root].join(" "),
  meaningEn: pattern.meaningEn,
  status: "ai_draft",
  measure: pattern.measure ?? "I",
  ...(options.includeQuranicMetadata === false ? {} : { quranic: true }),
  notes: pattern.rootNote ? `${AI_DRAFT_NOTE} ${pattern.rootNote}` : AI_DRAFT_NOTE,
  updatedAt: "2026-07-03",
  forms: buildForms(pattern),
});

/**
 * Builds a same-root variant (a distinct sense/measure of a root that already has its own
 * RootEntry) instead of a full RootEntry — for attaching to an existing root via
 * EXTRA_VARIANTS rather than creating a duplicate top-level entry for the same root string.
 */
const draftVariant = (pattern: DraftPattern, id: string): RootVerbEntry => ({
  id,
  meaningEn: pattern.meaningEn,
  status: "ai_draft",
  measure: pattern.measure ?? "I",
  notes: pattern.rootNote ? `${AI_DRAFT_NOTE} ${pattern.rootNote}` : AI_DRAFT_NOTE,
  updatedAt: "2026-07-03",
  forms: buildForms(pattern),
});

type ImportedArabicVerbRow = {
  rowNumber: number;
  chapter: string;
  sourcePage: string;
  meaningEn: string;
  past: string;
  present: string;
  imperative: string;
  masdar: string;
  notes?: string;
};

type ImportedArabicVerbReport = {
  processedRows: number;
  addedEntries: number;
  skippedExactDuplicateRows: number;
  skippedAlreadyRepresentedRows: number;
  skippedInvalidRows: { rowNumber: number; reason: string; past: string }[];
};

const IMPORT_UPDATED_AT = "2026-07-09";
const IMPORT_VERIFIED_FIELDS: ImportedVerbSource["verifiedFields"] = [
  "meaning_en",
  "past_3ms",
  "present_3ms",
  "imperative_2ms",
  "masdar",
];
const HARAKAT_RE = /[\u064b-\u065f\u0670]/g;
const ARABIC_LETTER_RE = /[ء-ي]/;
const ROOT_RE = /^[ء-ي]{3}$/;

function parseImportedArabicVerbCsv(csv: string): ImportedArabicVerbRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...body] = rows;
  const cleanHeaders = headers.map((header) => header.replace(/^\uFEFF/, ""));
  const indexFor = (name: string) => cleanHeaders.indexOf(name);

  return body
    .filter((cells) => cells.some((cell) => cell.trim()))
    .map((cells, index) => ({
      rowNumber: index + 2,
      chapter: cells[indexFor("chapter")]?.trim() ?? "",
      sourcePage: cells[indexFor("source_page")]?.trim() ?? "",
      meaningEn: cells[indexFor("meaning_en")]?.trim() ?? "",
      past: cells[indexFor("past_3ms")]?.trim() ?? "",
      present: cells[indexFor("present_3ms")]?.trim() ?? "",
      imperative: cells[indexFor("imperative_2ms")]?.trim() ?? "",
      masdar: cells[indexFor("masdar")]?.trim() ?? "",
      notes: cells[indexFor("notes")]?.trim() || undefined,
    }));
}

function arabicLetters(value: string): string {
  return [...value.replace(HARAKAT_RE, "").replace(/ـ/g, "")]
    .filter((char) => ARABIC_LETTER_RE.test(char))
    .map((char) => (char === "ى" ? "ي" : char === "آ" || char === "إ" ? "أ" : char))
    .join("");
}

function normaliseImportedArabic(value: string): string {
  return arabicLetters(value).replace(/[اأإآ]/g, "ا");
}

/** Rows whose measure/root can't be recovered reliably from surface text alone (hollow
 * roots in augmented measures, Form-VIII infix assimilation ambiguous between و/ي, and a
 * few genuinely irregular/quadriliteral verbs) — verified by hand against the CSV, keyed by
 * CSV row number (stable as long as rows aren't inserted/removed above them). */
const IMPORT_ROW_OVERRIDES: Record<number, { root: string; measure: VerbMeasure } | { exclude: true; trueRoot: string }> = {
  30: { root: "حوج", measure: "VIII" }, // احتاج
  32: { root: "فوق", measure: "IV" }, // أفاق
  45: { root: "صيد", measure: "VIII" }, // اصطاد
  61: { root: "طوع", measure: "IV" }, // أطاع
  74: { root: "زيد", measure: "VIII" }, // ازداد
  81: { root: "وجه", measure: "VIII" }, // اتّجه (assimilated و-initial radical)
  98: { exclude: true, trueRoot: "ترجم" }, // quadriliteral
  112: { root: "دور", measure: "IV" }, // أدار
  134: { root: "وصل", measure: "VIII" }, // اتّصل (assimilated و-initial radical)
  163: { root: "وفق", measure: "VIII" }, // اتّفق (assimilated و-initial radical)
  176: { root: "زول", measure: "IV" }, // أزال
  192: { root: "عور", measure: "IV" }, // أعار
  193: { root: "قود", measure: "VII" }, // انقاد
  201: { root: "أتي", measure: "I" }, // أتى (not Form IV; hamza-initial defective Form I)
  220: { root: "وحد", measure: "VIII" }, // اتّحد (assimilated و-initial radical)
  222: { root: "عون", measure: "X" }, // استعان
  236: { root: "ثور", measure: "IV" }, // أثار
  237: { root: "خوف", measure: "IV" }, // أخاف
  240: { exclude: true, trueRoot: "طمأن" }, // quadriliteral اطمأنّ
  257: { exclude: true, trueRoot: "هيمن" }, // quadriliteral
  264: { root: "دوم", measure: "IV" }, // أدام
  280: { root: "حوط", measure: "VIII" }, // احتاط
  281: { root: "دعو", measure: "VIII" }, // ادّعى
  283: { root: "فيد", measure: "X" }, // استفاد
  289: { root: "ضوأ", measure: "IV" }, // أضاء
  296: { root: "جوب", measure: "X" }, // استجاب
  329: { root: "بوح", measure: "IV" }, // أباح
  349: { root: "أبي", measure: "I" }, // أبى (not Form IV; hamza-initial defective Form I)
  354: { root: "وصي", measure: "IV" }, // أوصى
  452: { root: "صوب", measure: "IV" }, // أصاب
  467: { root: "سوأ", measure: "IV" }, // أساء
  502: { root: "أذي", measure: "IV" }, // آذى
  535: { root: "روح", measure: "VIII" }, // ارتاح
  562: { root: "هور", measure: "VII" }, // انهار
  565: { root: "عود", measure: "VIII" }, // اعتاد
  577: { exclude: true, trueRoot: "كفهر" }, // quadriliteral اكفهرّ
  587: { root: "نوب", measure: "VIII" }, // انتاب — genuinely Form VIII (اِفْتَعَلَ of نوب),
  // not Form VII; Form VII is disallowed with initial-ن roots, so the leading "ان" here is
  // ا + ن(root) + ت(infix), not the اِنْفَعَلَ augment.
};

function inferMeasure(row: ImportedArabicVerbRow): VerbMeasure {
  const override = IMPORT_ROW_OVERRIDES[row.rowNumber];
  if (override && "measure" in override) return override.measure;

  const past = arabicLetters(row.past);
  const pastChars = [...past];
  const masdar = arabicLetters(row.masdar);
  const rawMasdar = row.masdar.trim();

  if (past.startsWith("است")) return "X";
  if (past.startsWith("ان")) return "VII";
  if (past.startsWith("ا")) return "VIII";
  if (past.startsWith("ت")) {
    return pastChars[2] === "ا" || pastChars[2] === "و" ? "VI" : "V";
  }
  if (past.startsWith("أ") && /^[إا]/.test(rawMasdar)) return "IV";
  // Only a 4-letter skeleton with medial ا is Form III (فَاعَلَ, e.g. حاور = ح ا و ر). A
  // 3-letter skeleton with medial ا is a hollow Form I verb (e.g. قال = ق ا ل), which the
  // shadda/masdar check below would otherwise misclassify.
  if (pastChars.length === 4 && pastChars[1] === "ا") return "III";
  if (row.past.includes("ّ")) {
    // Shadda on a 2-letter skeleton is a geminate Form I root collapsing (ضَرَّ = ض ر), not
    // Form II gemination of the middle radical (عَلَّمَ = ع ل م, 3 letters).
    return pastChars.length <= 2 ? "I" : "II";
  }
  if (masdar.startsWith("ت")) return "II";
  return "I";
}

function threeLetters(value: string): string {
  const chars = [...value];
  if (chars.length === 2) return `${chars[0]}${chars[1]}${chars[1]}`;
  return chars.slice(0, 3).join("");
}

function inferRoot(row: ImportedArabicVerbRow): string {
  const override = IMPORT_ROW_OVERRIDES[row.rowNumber];
  if (override) return "root" in override ? override.root : override.trueRoot;

  const measure = inferMeasure(row);
  const past = arabicLetters(row.past);
  const pastChars = [...past];
  const presentBase = arabicLetters(row.present).replace(/^[يتنأ]/, "");
  const presentChars = [...presentBase];
  const masdar = arabicLetters(row.masdar);

  if (measure === "I") {
    if (pastChars.length === 2) return `${pastChars[0]}${pastChars[1]}${pastChars[1]}`;
    if (pastChars.length >= 3 && (pastChars[2] === "ا" || pastChars[2] === "ي")) {
      return `${pastChars[0]}${pastChars[1]}${presentChars[2] ?? "ي"}`;
    }
    if (pastChars.length >= 3 && pastChars[1] === "ا") {
      const weak =
        presentChars[1] === "ي" || presentChars[1] === "و"
          ? presentChars[1]
          : masdar.includes("و")
            ? "و"
            : "ي";
      return `${pastChars[0]}${weak}${pastChars[2]}`;
    }
    return threeLetters(past);
  }

  if (measure === "II") return threeLetters(past);
  if (measure === "III") return `${pastChars[0]}${pastChars[2] ?? ""}${pastChars[3] ?? pastChars[2] ?? ""}`;

  if (measure === "IV") {
    const stem = [...past.slice(1)];
    if (stem[1] === "ا") {
      const weak =
        presentChars[1] === "ي" || presentChars[1] === "و"
          ? presentChars[1]
          : masdar.includes("و")
            ? "و"
            : "ي";
      return `${stem[0]}${weak}${stem[2]}`;
    }
    return threeLetters(past.slice(1));
  }

  if (measure === "V") return threeLetters(past.slice(1));
  if (measure === "VI") return `${pastChars[1]}${pastChars[3] ?? ""}${pastChars[4] ?? pastChars[3] ?? ""}`;
  if (measure === "VII") return threeLetters(past.slice(2));

  if (measure === "VIII") {
    const afterPrefix = [...past.slice(1)];
    // The اِفْتَعَلَ infix ت assimilates to a different letter depending on the root's own
    // first radical: it becomes د after ز/د/ذ (ازدهر from زهر) and ط after ص/ض/ط/ظ (اضطر
    // from ضرر). Detecting this keeps the root's true first radical instead of folding the
    // mutated infix into it (e.g. treating ازدهر's د as if it were part of the root, "زده").
    const MUTATES_TO_D = new Set(["ز", "د", "ذ"]);
    const MUTATES_TO_T = new Set(["ص", "ض", "ط", "ظ"]);
    const isMutatedInfix =
      (MUTATES_TO_D.has(afterPrefix[0]) && afterPrefix[1] === "د") ||
      (MUTATES_TO_T.has(afterPrefix[0]) && afterPrefix[1] === "ط");
    if (afterPrefix[1] === "ت" || isMutatedInfix) {
      return `${afterPrefix[0]}${afterPrefix[2] ?? ""}${afterPrefix[3] ?? afterPrefix[2] ?? ""}`;
    }
    return threeLetters(afterPrefix.join(""));
  }

  if (measure === "X") return threeLetters(past.slice(3));
  return threeLetters(past);
}

const TRANSLITERATION_MAP: Record<string, string> = {
  ء: "ʾ",
  ا: "a",
  أ: "ʾ",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "ḥ",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "ṣ",
  ض: "ḍ",
  ط: "ṭ",
  ظ: "ẓ",
  ع: "ʿ",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
};

function transliterate(value: string): string {
  return [...arabicLetters(value)].map((char) => TRANSLITERATION_MAP[char] ?? char).join("-");
}

function preferredMasdar(value: string): string {
  return value.split("/")[0]?.trim() || value.trim();
}

function importedForm(
  order: number,
  key: SarfFormKey,
  arabic: string,
  reviewState: NonNullable<SarfForm["reviewState"]>,
  meaningEn?: string,
  labels?: { labelAr: string; labelEn: string },
): SarfForm {
  return {
    order,
    key,
    ...(labels ?? label(key)),
    arabic,
    transliteration: arabic ? transliterate(arabic) : "",
    reviewState,
    ...(meaningEn ? { meaningEn } : {}),
  };
}

function csvRowToVerbEntry(row: ImportedArabicVerbRow, root: string): RootVerbEntry {
  const measure = inferMeasure(row);
  const masdar = preferredMasdar(row.masdar);
  const source: ImportedVerbSource = {
    chapter: row.chapter,
    sourcePage: row.sourcePage,
    verifiedFields: IMPORT_VERIFIED_FIELDS,
    ...(row.notes ? { csvNotes: row.notes } : {}),
  };
  const sourceNote = `CSV source: ${row.chapter}, ${row.sourcePage}. The CSV/PDF verifies only the English meaning, past, present, imperative, and masdar fields.`;
  const notes = [
    AI_DRAFT_NOTE,
    sourceNote,
    row.notes ? `CSV note: ${row.notes}.` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: `${root}-csv-${row.rowNumber}`,
    meaningEn: row.meaningEn,
    status: "ai_draft",
    measure,
    source,
    notes,
    updatedAt: IMPORT_UPDATED_AT,
    forms: [
      importedForm(1, "past", row.past, "source_backed", row.meaningEn),
      importedForm(2, "present", row.present, "source_backed", row.meaningEn),
      importedForm(3, "imperative", row.imperative, "source_backed", row.meaningEn),
      importedForm(4, "place_or_mim_masdar", masdar, "source_backed", row.meaningEn, {
        labelAr: "المصدر",
        labelEn: "Verbal noun",
      }),
      importedForm(5, "active_participle", "", "pending"),
      importedForm(6, "passive_participle", "", "pending"),
    ],
  };
}

function verbIdentity(root: string, entry: { measure: VerbMeasure; forms: SarfForm[] }): string {
  const past = entry.forms.find((form) => form.key === "past")?.arabic ?? "";
  const present = entry.forms.find((form) => form.key === "present")?.arabic ?? "";
  const imperative = entry.forms.find((form) => form.key === "imperative")?.arabic ?? "";
  return [
    normaliseImportedArabic(root),
    entry.measure,
    normaliseImportedArabic(past),
    normaliseImportedArabic(present),
    normaliseImportedArabic(imperative),
  ].join("|");
}

function importedRowIdentity(row: ImportedArabicVerbRow): string {
  return [
    row.meaningEn,
    normaliseImportedArabic(row.past),
    normaliseImportedArabic(row.present),
    normaliseImportedArabic(row.imperative),
    normaliseImportedArabic(row.masdar),
    row.notes ?? "",
  ].join("|");
}

function attachImportedArabicVerbRows(baseRoots: RootEntry[], rows: ImportedArabicVerbRow[]) {
  const report: ImportedArabicVerbReport = {
    processedRows: rows.length,
    addedEntries: 0,
    skippedExactDuplicateRows: 0,
    skippedAlreadyRepresentedRows: 0,
    skippedInvalidRows: [],
  };
  const nextRoots = baseRoots.map((entry) => ({
    ...entry,
    ...(entry.variants ? { variants: [...entry.variants] } : {}),
  }));
  const rootsByKey = new Map(nextRoots.map((entry) => [normaliseImportedArabic(entry.root), entry]));
  const represented = new Set<string>();
  const seenRows = new Set<string>();

  for (const entry of nextRoots) {
    represented.add(verbIdentity(entry.root, entry));
    for (const variant of entry.variants ?? []) {
      represented.add(verbIdentity(entry.root, variant));
    }
  }

  for (const row of rows) {
    const rowKey = importedRowIdentity(row);
    if (seenRows.has(rowKey)) {
      report.skippedExactDuplicateRows += 1;
      continue;
    }
    seenRows.add(rowKey);

    const missingFields = [
      ["meaning_en", row.meaningEn],
      ["past_3ms", row.past],
      ["present_3ms", row.present],
      ["imperative_2ms", row.imperative],
      ["masdar", row.masdar],
    ]
      .filter(([, value]) => !value)
      .map(([name]) => name);
    if (missingFields.length > 0) {
      report.skippedInvalidRows.push({
        rowNumber: row.rowNumber,
        past: row.past,
        reason: `missing required CSV field(s): ${missingFields.join(", ")}`,
      });
      continue;
    }

    const root = inferRoot(row);
    if (!ROOT_RE.test(root)) {
      report.skippedInvalidRows.push({
        rowNumber: row.rowNumber,
        past: row.past,
        reason: `could not infer a three-letter Arabic root; inferred "${root}"`,
      });
      continue;
    }

    const importedEntry = csvRowToVerbEntry(row, root);
    const identity = verbIdentity(root, importedEntry);
    if (represented.has(identity)) {
      report.skippedAlreadyRepresentedRows += 1;
      continue;
    }

    const rootKey = normaliseImportedArabic(root);
    const existingRoot = rootsByKey.get(rootKey);
    if (existingRoot) {
      existingRoot.variants = [...(existingRoot.variants ?? []), importedEntry];
    } else {
      const newRoot: RootEntry = {
        root,
        displayRoot: [...root].join(" "),
        meaningEn: importedEntry.meaningEn,
        status: "ai_draft",
        measure: importedEntry.measure,
        forms: importedEntry.forms,
        notes: importedEntry.notes,
        source: importedEntry.source,
        updatedAt: importedEntry.updatedAt,
      };
      nextRoots.push(newRoot);
      rootsByKey.set(rootKey, newRoot);
    }
    represented.add(identity);
    report.addedEntries += 1;
  }

  return { roots: nextRoots, report };
}

const aiDraftRoots: RootEntry[] = [
  draft({ root: "عبد", meaningEn: "worshipping, serving", past: "عَبَدَ", present: "يَعْبُدُ", imperative: "اُعْبُدْ", place: "مَعْبَد", active: "عَابِد", passive: "مَعْبُود", transliterationBase: "ʿabada", formMeanings: { past: "he worshipped", present: "he worships", imperative: "worship!", place: "a place of worship", active: "a worshipper", passive: "worshipped" } }),
  draft({ root: "رحم", meaningEn: "mercy, compassion", past: "رَحِمَ", present: "يَرْحَمُ", imperative: "اِرْحَمْ", place: "مَرْحَمَة", active: "رَاحِم", passive: "مَرْحُوم", transliterationBase: "raḥima", formMeanings: { past: "he had mercy", present: "he has mercy", imperative: "have mercy!", place: "mercy or compassion", active: "merciful", passive: "shown mercy" } }),
  draft({ root: "غفر", meaningEn: "forgiving, covering", past: "غَفَرَ", present: "يَغْفِرُ", imperative: "اِغْفِرْ", place: "مَغْفِرَة", active: "غَافِر", passive: "مَغْفُور", transliterationBase: "ghafara", formMeanings: { past: "he forgave", present: "he forgives", imperative: "forgive!", place: "forgiveness", active: "forgiver", passive: "forgiven" } }),
  draft({ root: "كفر", meaningEn: "covering, disbelieving", past: "كَفَرَ", present: "يَكْفُرُ", imperative: "اُكْفُرْ", place: "مَكْفَر", active: "كَافِر", passive: "مَكْفُور", transliterationBase: "kafara", formMeanings: { past: "he disbelieved", present: "he disbelieves", imperative: "disbelieve!", place: "a place or act of covering", active: "one who rejects or covers", passive: "covered or denied" } }),
  draft({ root: "سلم", meaningEn: "peace, safety, surrender", past: "سَلِمَ", present: "يَسْلَمُ", imperative: "اِسْلَمْ", place: "مَسْلَم", active: "سَالِم", passive: "مَسْلُوم", transliterationBase: "salima", formMeanings: { past: "he was safe", present: "he is safe", imperative: "be safe / submit!", place: "a place of safety", active: "safe or sound", passive: "made safe" } }),
  draft({ root: "عمل", meaningEn: "working, doing", past: "عَمِلَ", present: "يَعْمَلُ", imperative: "اِعْمَلْ", place: "مَعْمَل", active: "عَامِل", passive: "مَعْمُول", transliterationBase: "ʿamila", formMeanings: { past: "he worked", present: "he works", imperative: "work!", place: "workplace", active: "worker", passive: "done or made" } }),
  draft({ root: "فعل", meaningEn: "doing, acting", past: "فَعَلَ", present: "يَفْعَلُ", imperative: "اِفْعَلْ", place: "مَفْعَل", active: "فَاعِل", passive: "مَفْعُول", transliterationBase: "faʿala", formMeanings: { past: "he did", present: "he does", imperative: "do!", place: "a place or instance of action", active: "doer", passive: "done" } }),
  draft({ root: "بصر", meaningEn: "seeing, insight", past: "بَصُرَ", present: "يَبْصُرُ", imperative: "اُبْصُرْ", place: "مَبْصَر", active: "بَاصِر", passive: "مَبْصُور", transliterationBase: "baṣura", formMeanings: { past: "he saw clearly", present: "he sees clearly", imperative: "see!", place: "place of seeing", active: "seeing", passive: "seen" } }),
  draft({ root: "شهد", meaningEn: "witnessing, being present", past: "شَهِدَ", present: "يَشْهَدُ", imperative: "اِشْهَدْ", place: "مَشْهَد", active: "شَاهِد", passive: "مَشْهُود", transliterationBase: "shahida", formMeanings: { past: "he witnessed", present: "he witnesses", imperative: "witness!", place: "scene or place witnessed", active: "witness", passive: "witnessed" } }),
  draft({ root: "ذكر", meaningEn: "remembering, mentioning", past: "ذَكَرَ", present: "يَذْكُرُ", imperative: "اُذْكُرْ", place: "مَذْكَر", active: "ذَاكِر", passive: "مَذْكُور", transliterationBase: "dhakara", formMeanings: { past: "he remembered", present: "he remembers", imperative: "remember!", place: "place or act of remembrance", active: "remembering", passive: "mentioned" } }),
  draft({ root: "شكر", meaningEn: "thankfulness", past: "شَكَرَ", present: "يَشْكُرُ", imperative: "اُشْكُرْ", place: "مَشْكَر", active: "شَاكِر", passive: "مَشْكُور", transliterationBase: "shakara", formMeanings: { past: "he thanked", present: "he thanks", imperative: "thank!", place: "place or act of thanking", active: "thankful", passive: "thanked" } }),
  draft({ root: "حمد", meaningEn: "praising", past: "حَمِدَ", present: "يَحْمَدُ", imperative: "اِحْمَدْ", place: "مَحْمَد", active: "حَامِد", passive: "مَحْمُود", transliterationBase: "ḥamida", formMeanings: { past: "he praised", present: "he praises", imperative: "praise!", place: "place or cause of praise", active: "one who praises", passive: "praised" } }),
  draft({ root: "سبح", meaningEn: "swimming, floating", past: "سَبَحَ", present: "يَسْبَحُ", imperative: "اِسْبَحْ", place: "مَسْبَح", active: "سَابِح", passive: "مَسْبُوح", transliterationBase: "sabaḥa", rootNote: "Form I سَبَحَ means only to swim/float; glorifying (as in تسبيح) is Form II سَبَّحَ.", formMeanings: { past: "he swam", present: "he swims", imperative: "swim!", place: "swimming place", active: "swimmer", passive: "swum (rare, pattern-based)" } }),
  draft({ root: "سجد", meaningEn: "prostrating", past: "سَجَدَ", present: "يَسْجُدُ", imperative: "اُسْجُدْ", place: "مَسْجِد", active: "سَاجِد", passive: "مَسْجُود", transliterationBase: "sajada", formMeanings: { past: "he prostrated", present: "he prostrates", imperative: "prostrate!", place: "mosque or place of prostration", active: "prostrating", passive: "prostrated to" } }),
  draft({ root: "ركع", meaningEn: "bowing", past: "رَكَعَ", present: "يَرْكَعُ", imperative: "اِرْكَعْ", place: "مَرْكَع", active: "رَاكِع", passive: "مَرْكُوع", transliterationBase: "rakaʿa", formMeanings: { past: "he bowed", present: "he bows", imperative: "bow!", place: "place of bowing", active: "bowing", passive: "bowed to" } }),
  draft({ root: "نصر", meaningEn: "helping, victory", past: "نَصَرَ", present: "يَنْصُرُ", imperative: "اُنْصُرْ", place: "مَنْصَر", active: "نَاصِر", passive: "مَنْصُور", transliterationBase: "naṣara", formMeanings: { past: "he helped", present: "he helps", imperative: "help!", place: "place of help", active: "helper", passive: "helped or victorious" } }),
  draft({ root: "خلق", meaningEn: "creating", past: "خَلَقَ", present: "يَخْلُقُ", imperative: "اُخْلُقْ", place: "مَخْلَق", active: "خَالِق", passive: "مَخْلُوق", transliterationBase: "khalaqa", formMeanings: { past: "he created", present: "he creates", imperative: "create!", place: "place or act of creating", active: "creator", passive: "created" } }),
  draft({ root: "رزق", meaningEn: "providing, sustenance", past: "رَزَقَ", present: "يَرْزُقُ", imperative: "اُرْزُقْ", place: "مَرْزَق", active: "رَازِق", passive: "مَرْزُوق", transliterationBase: "razaqa", formMeanings: { past: "he provided", present: "he provides", imperative: "provide!", place: "place of provision", active: "provider", passive: "provided for" } }),
  draft({ root: "ملك", meaningEn: "owning, ruling", past: "مَلَكَ", present: "يَمْلِكُ", imperative: "اِمْلِكْ", place: "مَمْلَك", active: "مَالِك", passive: "مَمْلُوك", transliterationBase: "malaka", formMeanings: { past: "he owned", present: "he owns", imperative: "own!", place: "realm or place of rule", active: "owner", passive: "owned" } }),
  draft({ root: "حكم", meaningEn: "judging, ruling", past: "حَكَمَ", present: "يَحْكُمُ", imperative: "اُحْكُمْ", place: "مَحْكَم", active: "حَاكِم", passive: "مَحْكُوم", transliterationBase: "ḥakama", formMeanings: { past: "he judged", present: "he judges", imperative: "judge!", place: "court or place of judgement", active: "judge or ruler", passive: "judged or ruled" } }),
  draft({ root: "عدل", meaningEn: "justice, fairness", past: "عَدَلَ", present: "يَعْدِلُ", imperative: "اِعْدِلْ", place: "مَعْدِل", active: "عَادِل", passive: "مَعْدُول", transliterationBase: "ʿadala", formMeanings: { past: "he was just", present: "he is just", imperative: "be just!", place: "place or way of justice", active: "just", passive: "adjusted or turned aside" } }),
  draft({ root: "ظلم", meaningEn: "wrongdoing, oppression", past: "ظَلَمَ", present: "يَظْلِمُ", imperative: "اِظْلِمْ", place: "مَظْلِم", active: "ظَالِم", passive: "مَظْلُوم", transliterationBase: "ẓalama", formMeanings: { past: "he wronged", present: "he wrongs", imperative: "wrong!", place: "place of injustice", active: "wrongdoer", passive: "wronged" } }),
  draft({ root: "صدق", meaningEn: "truthfulness", past: "صَدَقَ", present: "يَصْدُقُ", imperative: "اُصْدُقْ", place: "مَصْدَق", active: "صَادِق", passive: "مَصْدُوق", transliterationBase: "ṣadaqa", formMeanings: { past: "he was truthful", present: "he is truthful", imperative: "be truthful!", place: "place or sign of truth", active: "truthful", passive: "believed or found true" } }),
  draft({ root: "كذب", meaningEn: "lying, denying", past: "كَذَبَ", present: "يَكْذِبُ", imperative: "اِكْذِبْ", place: "مَكْذَب", active: "كَاذِب", passive: "مَكْذُوب", transliterationBase: "kadhaba", formMeanings: { past: "he lied", present: "he lies", imperative: "lie!", place: "place or instance of lying", active: "liar", passive: "lied about" } }),
  draft({ root: "صبر", meaningEn: "patience, endurance", past: "صَبَرَ", present: "يَصْبِرُ", imperative: "اِصْبِرْ", place: "مَصْبَر", active: "صَابِر", passive: "مَصْبُور", transliterationBase: "ṣabara", formMeanings: { past: "he was patient", present: "he is patient", imperative: "be patient!", place: "place of endurance", active: "patient", passive: "endured" } }),
  draft({ root: "ترك", meaningEn: "leaving, abandoning", past: "تَرَكَ", present: "يَتْرُكُ", imperative: "اُتْرُكْ", place: "مَتْرَك", active: "تَارِك", passive: "مَتْرُوك", transliterationBase: "taraka", formMeanings: { past: "he left", present: "he leaves", imperative: "leave!", place: "place of leaving", active: "one who leaves", passive: "left behind" } }),
  draft({ root: "قرب", meaningEn: "nearness", past: "قَرُبَ", present: "يَقْرُبُ", imperative: "اُقْرُبْ", place: "مَقْرَب", active: "قَارِب", passive: "مَقْرُوب", transliterationBase: "qaruba", formMeanings: { past: "he was near", present: "he is near", imperative: "come near!", place: "place of nearness", active: "near or approaching", passive: "brought near" } }),
  draft({ root: "بعد", meaningEn: "distance, being far", past: "بَعُدَ", present: "يَبْعُدُ", imperative: "اُبْعُدْ", place: "مَبْعَد", active: "بَاعِد", passive: "مَبْعُود", transliterationBase: "baʿuda", formMeanings: { past: "he was far", present: "he is far", imperative: "go far!", place: "far place", active: "distant", passive: "kept far" } }),
  draft({ root: "كبر", meaningEn: "greatness, growing large", past: "كَبُرَ", present: "يَكْبُرُ", imperative: "اُكْبُرْ", place: "مَكْبَر", active: "كَابِر", passive: "مَكْبُور", transliterationBase: "kabura", formMeanings: { past: "he grew great", present: "he grows great", imperative: "grow great!", place: "place of greatness", active: "great or elder", passive: "magnified" } }),
  draft({ root: "حسن", meaningEn: "beauty, goodness", past: "حَسُنَ", present: "يَحْسُنُ", imperative: "اُحْسُنْ", place: "مَحْسَن", active: "حَاسِن", passive: "مَحْسُون", transliterationBase: "ḥasuna", formMeanings: { past: "he was good", present: "he is good", imperative: "be good!", place: "place of beauty", active: "good or beautiful", passive: "made good" } }),
  draft({ root: "نفع", meaningEn: "benefit", past: "نَفَعَ", present: "يَنْفَعُ", imperative: "اِنْفَعْ", place: "مَنْفَع", active: "نَافِع", passive: "مَنْفُوع", transliterationBase: "nafaʿa", formMeanings: { past: "he benefited", present: "he benefits", imperative: "benefit!", place: "place or source of benefit", active: "beneficial", passive: "benefited" } }),
  draft({ root: "ضرر", meaningEn: "harm", past: "ضَرَّ", present: "يَضُرُّ", imperative: "ضُرَّ", place: "مَضَرّ", active: "ضَارّ", passive: "مَضْرُور", transliterationBase: "ḍarra", formMeanings: { past: "he harmed", present: "he harms", imperative: "harm!", place: "place or source of harm", active: "harmful", passive: "harmed" } }),
  draft({ root: "حمل", meaningEn: "carrying, bearing", past: "حَمَلَ", present: "يَحْمِلُ", imperative: "اِحْمِلْ", place: "مَحْمَل", active: "حَامِل", passive: "مَحْمُول", transliterationBase: "ḥamala", formMeanings: { past: "he carried", present: "he carries", imperative: "carry!", place: "place or means of carrying", active: "carrier", passive: "carried" } }),
  draft({ root: "قبل", meaningEn: "accepting, facing", past: "قَبِلَ", present: "يَقْبَلُ", imperative: "اِقْبَلْ", place: "مَقْبَل", active: "قَابِل", passive: "مَقْبُول", transliterationBase: "qabila", formMeanings: { past: "he accepted", present: "he accepts", imperative: "accept!", place: "approach or front", active: "accepting", passive: "accepted" } }),
  draft({ root: "دبر", meaningEn: "turning back, managing", past: "دَبَرَ", present: "يَدْبُرُ", imperative: "اُدْبُرْ", place: "مَدْبَر", active: "دَابِر", passive: "مَدْبُور", transliterationBase: "dabara", formMeanings: { past: "he turned back", present: "he turns back", imperative: "turn back!", place: "rear place", active: "departing or last", passive: "managed or turned back" } }),
  draft({ root: "مسح", meaningEn: "wiping", past: "مَسَحَ", present: "يَمْسَحُ", imperative: "اِمْسَحْ", place: "مَمْسَح", active: "مَاسِح", passive: "مَمْسُوح", transliterationBase: "masaḥa", formMeanings: { past: "he wiped", present: "he wipes", imperative: "wipe!", place: "place or tool of wiping", active: "one who wipes", passive: "wiped" } }),
  draft({ root: "غسل", meaningEn: "washing", past: "غَسَلَ", present: "يَغْسِلُ", imperative: "اِغْسِلْ", place: "مَغْسَل", active: "غَاسِل", passive: "مَغْسُول", transliterationBase: "ghasala", formMeanings: { past: "he washed", present: "he washes", imperative: "wash!", place: "washing place", active: "washer", passive: "washed" } }),
  draft({ root: "طهر", meaningEn: "purity, becoming clean", past: "طَهُرَ", present: "يَطْهُرُ", imperative: "اُطْهُرْ", place: "مَطْهَر", active: "طَاهِر", passive: "مَطْهُور", transliterationBase: "ṭahura", formMeanings: { past: "he was pure", present: "he is pure", imperative: "be pure!", place: "place of purification", active: "pure", passive: "purified" } }),
  draft({ root: "جمع", meaningEn: "gathering", past: "جَمَعَ", present: "يَجْمَعُ", imperative: "اِجْمَعْ", place: "مَجْمَع", active: "جَامِع", passive: "مَجْمُوع", transliterationBase: "jamaʿa", formMeanings: { past: "he gathered", present: "he gathers", imperative: "gather!", place: "gathering place", active: "gatherer", passive: "gathered" } }),
  draft({ root: "فرق", meaningEn: "separating, distinguishing", past: "فَرَقَ", present: "يَفْرُقُ", imperative: "اُفْرُقْ", place: "مَفْرَق", active: "فَارِق", passive: "مَفْرُوق", transliterationBase: "faraqa", formMeanings: { past: "he separated", present: "he separates", imperative: "separate!", place: "parting place", active: "separator", passive: "separated" } }),
  // Expansion batch (sound triliteral roots only — weak and hamzated roots
  // are excluded until the validation gate supports their imperatives).
  draft({ root: "ذهب", meaningEn: "going", past: "ذَهَبَ", present: "يَذْهَبُ", imperative: "اِذْهَبْ", place: "مَذْهَب", active: "ذَاهِب", passive: "مَذْهُوب", transliterationBase: "dhahaba", formMeanings: { past: "he went", present: "he goes", imperative: "go!", place: "a way or school of thought", active: "going", passive: "gone to or taken away" } }),
  draft({ root: "نظر", meaningEn: "looking", past: "نَظَرَ", present: "يَنْظُرُ", imperative: "اُنْظُرْ", place: "مَنْظَر", active: "نَاظِر", passive: "مَنْظُور", transliterationBase: "naẓara", formMeanings: { past: "he looked", present: "he looks", imperative: "look!", place: "a view or scene", active: "one who looks", passive: "seen or considered" } }),
  draft({ root: "عقل", meaningEn: "understanding, reason", past: "عَقَلَ", present: "يَعْقِلُ", imperative: "اِعْقِلْ", place: "مَعْقِل", active: "عَاقِل", passive: "مَعْقُول", transliterationBase: "ʿaqala", formMeanings: { past: "he understood", present: "he understands", imperative: "understand!", place: "a stronghold or refuge", active: "reasonable or sane", passive: "reasonable or understood" } }),
  draft({ root: "فقه", meaningEn: "understanding deeply", past: "فَقِهَ", present: "يَفْقَهُ", imperative: "اِفْقَهْ", place: "مَفْقَه", active: "فَاقِه", passive: "مَفْقُوه", transliterationBase: "faqiha", formMeanings: { past: "he understood deeply", present: "he understands deeply", imperative: "understand deeply!", place: "a place or matter of deep understanding", active: "one who understands deeply", passive: "deeply understood" } }),
  draft({ root: "قلب", meaningEn: "turning, heart", past: "قَلَبَ", present: "يَقْلِبُ", imperative: "اِقْلِبْ", place: "مَقْلَب", active: "قَالِب", passive: "مَقْلُوب", transliterationBase: "qalaba", formMeanings: { past: "he turned over", present: "he turns over", imperative: "turn over!", place: "a place or act of turning", active: "one who turns", passive: "turned over or upside down" } }),
  draft({ root: "بعث", meaningEn: "raising, sending", past: "بَعَثَ", present: "يَبْعَثُ", imperative: "اِبْعَثْ", place: "مَبْعَث", active: "بَاعِث", passive: "مَبْعُوث", transliterationBase: "baʿatha", formMeanings: { past: "he sent forth", present: "he sends forth", imperative: "send forth!", place: "the origin or occasion of sending", active: "a sender or motive", passive: "sent forth or resurrected" } }),
  draft({ root: "كره", meaningEn: "disliking", past: "كَرِهَ", present: "يَكْرَهُ", imperative: "اِكْرَهْ", place: "مَكْرَه", active: "كَارِه", passive: "مَكْرُوه", transliterationBase: "kariha", formMeanings: { past: "he disliked", present: "he dislikes", imperative: "dislike!", place: "a disliked thing or hardship", active: "one who dislikes", passive: "disliked" } }),
  draft({ root: "شرب", meaningEn: "drinking", past: "شَرِبَ", present: "يَشْرَبُ", imperative: "اِشْرَبْ", place: "مَشْرَب", active: "شَارِب", passive: "مَشْرُوب", transliterationBase: "shariba", formMeanings: { past: "he drank", present: "he drinks", imperative: "drink!", place: "a drinking place", active: "a drinker", passive: "drunk (of a liquid)" } }),
  draft({ root: "لبس", meaningEn: "wearing, clothing", past: "لَبِسَ", present: "يَلْبَسُ", imperative: "اِلْبَسْ", place: "مَلْبَس", active: "لَابِس", passive: "مَلْبُوس", transliterationBase: "labisa", formMeanings: { past: "he wore", present: "he wears", imperative: "wear!", place: "clothing or attire", active: "one who wears", passive: "worn" } }),
  draft({ root: "فقد", meaningEn: "losing", past: "فَقَدَ", present: "يَفْقِدُ", imperative: "اِفْقِدْ", place: "مَفْقِد", active: "فَاقِد", passive: "مَفْقُود", transliterationBase: "faqada", formMeanings: { past: "he lost", present: "he loses", imperative: "lose!", place: "a place or instance of loss", active: "one who has lost", passive: "lost or missing" } }),
  draft({ root: "بخل", meaningEn: "stinginess", past: "بَخِلَ", present: "يَبْخَلُ", imperative: "اِبْخَلْ", place: "مَبْخَل", active: "بَاخِل", passive: "مَبْخُول", transliterationBase: "bakhila", formMeanings: { past: "he was stingy", present: "he is stingy", imperative: "be stingy!", place: "a cause or place of stinginess", active: "stingy", passive: "withheld stingily" } }),
  draft({ root: "غلب", meaningEn: "overcoming", past: "غَلَبَ", present: "يَغْلِبُ", imperative: "اِغْلِبْ", place: "مَغْلَب", active: "غَالِب", passive: "مَغْلُوب", transliterationBase: "ghalaba", formMeanings: { past: "he overcame", present: "he overcomes", imperative: "overcome!", place: "a place or instance of victory", active: "prevailing", passive: "overcome or defeated" } }),
  draft({ root: "جنب", meaningEn: "side, avoiding", past: "جَنَبَ", present: "يَجْنُبُ", imperative: "اُجْنُبْ", place: "مَجْنَب", active: "جَانِب", passive: "مَجْنُوب", transliterationBase: "janaba", formMeanings: { past: "he kept away", present: "he keeps away", imperative: "keep away!", place: "a side or flank", active: "a side or one keeping aside", passive: "kept away" } }),
  draft({ root: "فجر", meaningEn: "bursting forth, dawn", past: "فَجَرَ", present: "يَفْجُرُ", imperative: "اُفْجُرْ", place: "مَفْجَر", active: "فَاجِر", passive: "مَفْجُور", transliterationBase: "fajara", formMeanings: { past: "he caused to burst forth", present: "he causes to burst forth", imperative: "cause to burst forth!", place: "a place of bursting forth", active: "one who bursts forth or transgresses", passive: "burst open" } }),
  draft({ root: "عصر", meaningEn: "pressing, squeezing", past: "عَصَرَ", present: "يَعْصِرُ", imperative: "اِعْصِرْ", place: "مَعْصَر", active: "عَاصِر", passive: "مَعْصُور", transliterationBase: "ʿaṣara", formMeanings: { past: "he pressed", present: "he presses", imperative: "press!", place: "a press or pressing place", active: "one who presses", passive: "pressed or squeezed" } }),
  draft({ root: "حفظ", meaningEn: "guarding, memorizing", past: "حَفِظَ", present: "يَحْفَظُ", imperative: "اِحْفَظْ", place: "مَحْفَظ", active: "حَافِظ", passive: "مَحْفُوظ", transliterationBase: "ḥafiẓa", formMeanings: { past: "he guarded", present: "he guards", imperative: "guard!", place: "a place of safekeeping", active: "a guardian or memorizer", passive: "guarded or preserved" } }),
  draft({ root: "نزل", meaningEn: "descending", past: "نَزَلَ", present: "يَنْزِلُ", imperative: "اِنْزِلْ", place: "مَنْزِل", active: "نَازِل", passive: "مَنْزُول", transliterationBase: "nazala", formMeanings: { past: "he descended", present: "he descends", imperative: "descend!", place: "a dwelling or stopping place", active: "descending", passive: "descended upon" } }),
  draft({ root: "ضرب", meaningEn: "striking", past: "ضَرَبَ", present: "يَضْرِبُ", imperative: "اِضْرِبْ", place: "مَضْرِب", active: "ضَارِب", passive: "مَضْرُوب", transliterationBase: "ḍaraba", formMeanings: { past: "he struck", present: "he strikes", imperative: "strike!", place: "a place or manner of striking", active: "one who strikes", passive: "struck" } }),
  draft({ root: "قتل", meaningEn: "killing", past: "قَتَلَ", present: "يَقْتُلُ", imperative: "اُقْتُلْ", place: "مَقْتَل", active: "قَاتِل", passive: "مَقْتُول", transliterationBase: "qatala", formMeanings: { past: "he killed", present: "he kills", imperative: "kill!", place: "a place of killing", active: "a killer", passive: "killed" } }),
  draft({ root: "سكن", meaningEn: "dwelling, being calm", past: "سَكَنَ", present: "يَسْكُنُ", imperative: "اُسْكُنْ", place: "مَسْكَن", active: "سَاكِن", passive: "مَسْكُون", transliterationBase: "sakana", formMeanings: { past: "he dwelt", present: "he dwells", imperative: "dwell!", place: "a dwelling", active: "a dweller or still", passive: "inhabited" } }),
  draft({ root: "عرف", meaningEn: "knowing, recognizing", past: "عَرَفَ", present: "يَعْرِفُ", imperative: "اِعْرِفْ", place: "مَعْرِف", active: "عَارِف", passive: "مَعْرُوف", transliterationBase: "ʿarafa", formMeanings: { past: "he recognized", present: "he recognizes", imperative: "recognize!", place: "a place or mark of recognition", active: "one who knows", passive: "known or a good deed" } }),
  draft({ root: "كسب", meaningEn: "earning", past: "كَسَبَ", present: "يَكْسِبُ", imperative: "اِكْسِبْ", place: "مَكْسَب", active: "كَاسِب", passive: "مَكْسُوب", transliterationBase: "kasaba", formMeanings: { past: "he earned", present: "he earns", imperative: "earn!", place: "a gain or source of earning", active: "an earner", passive: "earned" } }),
  draft({ root: "رجع", meaningEn: "returning", past: "رَجَعَ", present: "يَرْجِعُ", imperative: "اِرْجِعْ", place: "مَرْجِع", active: "رَاجِع", passive: "مَرْجُوع", transliterationBase: "rajaʿa", formMeanings: { past: "he returned", present: "he returns", imperative: "return!", place: "a reference or place of return", active: "returning", passive: "returned" } }),
  draft({ root: "ركب", meaningEn: "riding", past: "رَكِبَ", present: "يَرْكَبُ", imperative: "اِرْكَبْ", place: "مَرْكَب", active: "رَاكِب", passive: "مَرْكُوب", transliterationBase: "rakiba", formMeanings: { past: "he rode", present: "he rides", imperative: "ride!", place: "a vehicle or vessel", active: "a rider", passive: "ridden" } }),
  draft({ root: "سجن", meaningEn: "imprisoning", past: "سَجَنَ", present: "يَسْجُنُ", imperative: "اُسْجُنْ", place: "مَسْجَن", active: "سَاجِن", passive: "مَسْجُون", transliterationBase: "sajana", formMeanings: { past: "he imprisoned", present: "he imprisons", imperative: "imprison!", place: "a place of imprisonment", active: "a jailer", passive: "imprisoned" } }),
  draft({ root: "سبق", meaningEn: "preceding, racing ahead", past: "سَبَقَ", present: "يَسْبِقُ", imperative: "اِسْبِقْ", place: "مَسْبَق", active: "سَابِق", passive: "مَسْبُوق", transliterationBase: "sabaqa", formMeanings: { past: "he preceded", present: "he precedes", imperative: "precede!", place: "a place or instance of precedence", active: "preceding or former", passive: "preceded or outraced" } }),
  draft({ root: "سرق", meaningEn: "stealing", past: "سَرَقَ", present: "يَسْرِقُ", imperative: "اِسْرِقْ", place: "مَسْرَق", active: "سَارِق", passive: "مَسْرُوق", transliterationBase: "saraqa", formMeanings: { past: "he stole", present: "he steals", imperative: "steal!", place: "a place or instance of theft", active: "a thief", passive: "stolen" } }),
  draft({ root: "صرف", meaningEn: "turning away, morphology", past: "صَرَفَ", present: "يَصْرِفُ", imperative: "اِصْرِفْ", place: "مَصْرِف", active: "صَارِف", passive: "مَصْرُوف", transliterationBase: "ṣarafa", formMeanings: { past: "he turned away", present: "he turns away", imperative: "turn away!", place: "an outlet or bank", active: "one who turns away", passive: "turned away or spent" } }),
  draft({ root: "صنع", meaningEn: "making, crafting", past: "صَنَعَ", present: "يَصْنَعُ", imperative: "اِصْنَعْ", place: "مَصْنَع", active: "صَانِع", passive: "مَصْنُوع", transliterationBase: "ṣanaʿa", formMeanings: { past: "he made", present: "he makes", imperative: "make!", place: "a factory or workshop", active: "a maker or craftsman", passive: "made or manufactured" } }),
  draft({ root: "ظهر", meaningEn: "appearing", past: "ظَهَرَ", present: "يَظْهَرُ", imperative: "اِظْهَرْ", place: "مَظْهَر", active: "ظَاهِر", passive: "مَظْهُور", transliterationBase: "ẓahara", formMeanings: { past: "he appeared", present: "he appears", imperative: "appear!", place: "an appearance or aspect", active: "apparent or outward", passive: "made apparent" } }),
  draft({ root: "قعد", meaningEn: "sitting", past: "قَعَدَ", present: "يَقْعُدُ", imperative: "اُقْعُدْ", place: "مَقْعَد", active: "قَاعِد", passive: "مَقْعُود", transliterationBase: "qaʿada", formMeanings: { past: "he sat", present: "he sits", imperative: "sit!", place: "a seat", active: "sitting", passive: "sat upon" } }),
  draft({ root: "قطع", meaningEn: "cutting", past: "قَطَعَ", present: "يَقْطَعُ", imperative: "اِقْطَعْ", place: "مَقْطَع", active: "قَاطِع", passive: "مَقْطُوع", transliterationBase: "qaṭaʿa", formMeanings: { past: "he cut", present: "he cuts", imperative: "cut!", place: "a section or cutting place", active: "cutting or decisive", passive: "cut off" } }),
  draft({ root: "قسم", meaningEn: "dividing, apportioning", past: "قَسَمَ", present: "يَقْسِمُ", imperative: "اِقْسِمْ", place: "مَقْسَم", active: "قَاسِم", passive: "مَقْسُوم", transliterationBase: "qasama", formMeanings: { past: "he divided", present: "he divides", imperative: "divide!", place: "a share or dividing place", active: "one who divides", passive: "divided" } }),
  draft({ root: "كتم", meaningEn: "concealing", past: "كَتَمَ", present: "يَكْتُمُ", imperative: "اُكْتُمْ", place: "مَكْتَم", active: "كَاتِم", passive: "مَكْتُوم", transliterationBase: "katama", formMeanings: { past: "he concealed", present: "he conceals", imperative: "conceal!", place: "a place of concealment", active: "one who conceals", passive: "concealed" } }),
  draft({ root: "كشف", meaningEn: "uncovering, removing", past: "كَشَفَ", present: "يَكْشِفُ", imperative: "اِكْشِفْ", place: "مَكْشَف", active: "كَاشِف", passive: "مَكْشُوف", transliterationBase: "kashafa", formMeanings: { past: "he uncovered", present: "he uncovers", imperative: "uncover!", place: "an exposed place", active: "one who uncovers", passive: "uncovered or exposed" } }),
  draft({ root: "لعب", meaningEn: "playing", past: "لَعِبَ", present: "يَلْعَبُ", imperative: "اِلْعَبْ", place: "مَلْعَب", active: "لَاعِب", passive: "مَلْعُوب", transliterationBase: "laʿiba", formMeanings: { past: "he played", present: "he plays", imperative: "play!", place: "a playground or stadium", active: "a player", passive: "played" } }),
  draft({ root: "لبث", meaningEn: "remaining, staying", past: "لَبِثَ", present: "يَلْبَثُ", imperative: "اِلْبَثْ", place: "مَلْبَث", active: "لَابِث", passive: "مَلْبُوث", transliterationBase: "labitha", formMeanings: { past: "he remained", present: "he remains", imperative: "remain!", place: "a place or period of staying", active: "one who remains", passive: "stayed through" } }),
  draft({ root: "مكث", meaningEn: "staying, waiting", past: "مَكَثَ", present: "يَمْكُثُ", imperative: "اُمْكُثْ", place: "مَمْكَث", active: "مَاكِث", passive: "مَمْكُوث", transliterationBase: "makatha", formMeanings: { past: "he stayed", present: "he stays", imperative: "stay!", place: "a place of staying", active: "one who stays", passive: "stayed in" } }),
  draft({ root: "منع", meaningEn: "preventing", past: "مَنَعَ", present: "يَمْنَعُ", imperative: "اِمْنَعْ", place: "مَمْنَع", active: "مَانِع", passive: "مَمْنُوع", transliterationBase: "manaʿa", formMeanings: { past: "he prevented", present: "he prevents", imperative: "prevent!", place: "a stronghold or barrier", active: "a preventer or obstacle", passive: "forbidden or prevented" } }),
  draft({ root: "نصح", meaningEn: "advising sincerely", past: "نَصَحَ", present: "يَنْصَحُ", imperative: "اِنْصَحْ", place: "مَنْصَح", active: "نَاصِح", passive: "مَنْصُوح", transliterationBase: "naṣaḥa", formMeanings: { past: "he advised sincerely", present: "he advises sincerely", imperative: "advise sincerely!", place: "a place or act of sincere advice", active: "a sincere adviser", passive: "advised" } }),
  draft({ root: "نطق", meaningEn: "speaking, uttering", past: "نَطَقَ", present: "يَنْطِقُ", imperative: "اِنْطِقْ", place: "مَنْطِق", active: "نَاطِق", passive: "مَنْطُوق", transliterationBase: "naṭaqa", formMeanings: { past: "he uttered", present: "he utters", imperative: "utter!", place: "speech or logic", active: "speaking", passive: "uttered or pronounced" } }),
  draft({ root: "نفخ", meaningEn: "blowing", past: "نَفَخَ", present: "يَنْفُخُ", imperative: "اُنْفُخْ", place: "مَنْفَخ", active: "نَافِخ", passive: "مَنْفُوخ", transliterationBase: "nafakha", formMeanings: { past: "he blew", present: "he blows", imperative: "blow!", place: "a place or tool of blowing", active: "one who blows", passive: "inflated or blown into" } }),
  draft({ root: "هجر", meaningEn: "abandoning, emigrating", past: "هَجَرَ", present: "يَهْجُرُ", imperative: "اُهْجُرْ", place: "مَهْجَر", active: "هَاجِر", passive: "مَهْجُور", transliterationBase: "hajara", formMeanings: { past: "he abandoned", present: "he abandons", imperative: "abandon!", place: "a place of emigration", active: "one who abandons", passive: "abandoned or deserted" } }),
  draft({ root: "هلك", meaningEn: "perishing", past: "هَلَكَ", present: "يَهْلِكُ", imperative: "اِهْلِكْ", place: "مَهْلَك", active: "هَالِك", passive: "مَهْلُوك", transliterationBase: "halaka", formMeanings: { past: "he perished", present: "he perishes", imperative: "perish!", place: "a place or cause of ruin", active: "perishing or doomed", passive: "destroyed" } }),
  draft({ root: "خسر", meaningEn: "losing, incurring loss", past: "خَسِرَ", present: "يَخْسَرُ", imperative: "اِخْسَرْ", place: "مَخْسَر", active: "خَاسِر", passive: "مَخْسُور", transliterationBase: "khasira", formMeanings: { past: "he lost", present: "he loses", imperative: "lose!", place: "a place or cause of loss", active: "a loser", passive: "diminished or lost" } }),
  draft({ root: "خلد", meaningEn: "abiding forever", past: "خَلَدَ", present: "يَخْلُدُ", imperative: "اُخْلُدْ", place: "مَخْلَد", active: "خَالِد", passive: "مَخْلُود", transliterationBase: "khalada", formMeanings: { past: "he abided forever", present: "he abides forever", imperative: "abide forever!", place: "a place of eternity", active: "eternal or abiding", passive: "made eternal" } }),
  draft({ root: "درس", meaningEn: "studying", past: "دَرَسَ", present: "يَدْرُسُ", imperative: "اُدْرُسْ", place: "مَدْرَس", active: "دَارِس", passive: "مَدْرُوس", transliterationBase: "darasa", formMeanings: { past: "he studied", present: "he studies", imperative: "study!", place: "a place of study", active: "a student or examiner", passive: "studied" } }),
  draft({ root: "ذبح", meaningEn: "slaughtering", past: "ذَبَحَ", present: "يَذْبَحُ", imperative: "اِذْبَحْ", place: "مَذْبَح", active: "ذَابِح", passive: "مَذْبُوح", transliterationBase: "dhabaḥa", formMeanings: { past: "he slaughtered", present: "he slaughters", imperative: "slaughter!", place: "an altar or slaughtering place", active: "one who slaughters", passive: "slaughtered" } }),
  draft({ root: "شرح", meaningEn: "expanding, explaining", past: "شَرَحَ", present: "يَشْرَحُ", imperative: "اِشْرَحْ", place: "مَشْرَح", active: "شَارِح", passive: "مَشْرُوح", transliterationBase: "sharaḥa", formMeanings: { past: "he explained", present: "he explains", imperative: "explain!", place: "a place of explanation or dissection", active: "an explainer", passive: "explained or opened" } }),
  draft({ root: "شعر", meaningEn: "perceiving, feeling", past: "شَعَرَ", present: "يَشْعُرُ", imperative: "اُشْعُرْ", place: "مَشْعَر", active: "شَاعِر", passive: "مَشْعُور", transliterationBase: "shaʿara", formMeanings: { past: "he perceived", present: "he perceives", imperative: "perceive!", place: "a sacred site or place of rites", active: "a poet or one who perceives", passive: "perceived" } }),
  draft({ root: "عجب", meaningEn: "wondering, marveling", past: "عَجِبَ", present: "يَعْجَبُ", imperative: "اِعْجَبْ", place: "مَعْجَب", active: "عَاجِب", passive: "مَعْجُوب", transliterationBase: "ʿajiba", formMeanings: { past: "he marveled", present: "he marvels", imperative: "marvel!", place: "a cause or place of wonder", active: "one who marvels", passive: "marveled at" } }),
  draft({ root: "غضب", meaningEn: "being angry", past: "غَضِبَ", present: "يَغْضَبُ", imperative: "اِغْضَبْ", place: "مَغْضَب", active: "غَاضِب", passive: "مَغْضُوب", transliterationBase: "ghaḍiba", formMeanings: { past: "he was angry", present: "he is angry", imperative: "be angry!", place: "a cause or place of anger", active: "angry", passive: "subject to anger" } }),
  draft({ root: "غفل", meaningEn: "being heedless", past: "غَفَلَ", present: "يَغْفُلُ", imperative: "اُغْفُلْ", place: "مَغْفَل", active: "غَافِل", passive: "مَغْفُول", transliterationBase: "ghafala", formMeanings: { past: "he was heedless", present: "he is heedless", imperative: "be heedless!", place: "a place or state of heedlessness", active: "heedless", passive: "overlooked" } }),
  draft({ root: "بلغ", meaningEn: "reaching", past: "بَلَغَ", present: "يَبْلُغُ", imperative: "اُبْلُغْ", place: "مَبْلَغ", active: "بَالِغ", passive: "مَبْلُوغ", transliterationBase: "balagha", formMeanings: { past: "he reached", present: "he reaches", imperative: "reach!", place: "an amount or extent", active: "reaching or mature", passive: "reached" } }),
  draft({ root: "كسر", meaningEn: "breaking", past: "كَسَرَ", present: "يَكْسِرُ", imperative: "اِكْسِرْ", place: "مَكْسِر", active: "كَاسِر", passive: "مَكْسُور", transliterationBase: "kasara", transliterations: { past: "kasara", present: "yaksiru", imperative: "iksir", place_or_mim_masdar: "maksir", active_participle: "kāsir", passive_participle: "maksūr" }, formMeanings: { past: "he broke", present: "he breaks", imperative: "break!", place: "a breaking point or place", active: "breaker", passive: "broken" } }, { includeQuranicMetadata: false }),
  draft({ root: "أخذ", meaningEn: "taking", past: "أَخَذَ", present: "يَأْخُذُ", imperative: "خُذْ", place: "مَأْخَذ", active: "آخِذ", passive: "مَأْخُوذ", transliterationBase: "akhadha", transliterations: { past: "akhadha", present: "ya'khudhu", imperative: "khudh", place_or_mim_masdar: "ma'khadh", active_participle: "aakhidh", passive_participle: "ma'khudh" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Hamzated verb; the common imperative is shortened to خُذْ.` }, formMeanings: { past: "he took", present: "he takes", imperative: "take!", place: "a place or way of taking", active: "one who takes", passive: "taken" } }, { includeQuranicMetadata: false }),
  draft({ root: "أكل", meaningEn: "eating", past: "أَكَلَ", present: "يَأْكُلُ", imperative: "كُلْ", place: "مَأْكَل", active: "آكِل", passive: "مَأْكُول", transliterationBase: "akala", transliterations: { past: "akala", present: "ya'kulu", imperative: "kul", place_or_mim_masdar: "ma'kal", active_participle: "aakil", passive_participle: "ma'kul" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Hamzated verb; the common imperative is shortened to كُلْ.` }, formMeanings: { past: "he ate", present: "he eats", imperative: "eat!", place: "a place or act of eating", active: "eater", passive: "eaten" } }, { includeQuranicMetadata: false }),
  draft({ root: "حبس", meaningEn: "holding back, imprisoning", past: "حَبَسَ", present: "يَحْبِسُ", imperative: "اِحْبِسْ", place: "مَحْبِس", active: "حَابِس", passive: "مَحْبُوس", transliterationBase: "ḥabasa", transliterations: { past: "ḥabasa", present: "yaḥbisu", imperative: "iḥbis", place_or_mim_masdar: "maḥbis", active_participle: "ḥābis", passive_participle: "maḥbūs" }, formMeanings: { past: "he held back", present: "he holds back", imperative: "hold back!", place: "a place of confinement", active: "one who holds back", passive: "held back or imprisoned" } }, { includeQuranicMetadata: false }),
  draft({ root: "سأل", meaningEn: "asking", past: "سَأَلَ", present: "يَسْأَلُ", imperative: "اِسْأَلْ", place: "مَسْأَلَة", active: "سَائِل", passive: "مَسْؤُول", transliterationBase: "sa'ala", transliterations: { past: "sa'ala", present: "yas'alu", imperative: "is'al", place_or_mim_masdar: "mas'alah", active_participle: "sā'il", passive_participle: "mas'ūl" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Hamzated verb; keep hamzat waṣl at the start, not إ.` }, formMeanings: { past: "he asked", present: "he asks", imperative: "ask!", place: "a question or matter", active: "one who asks", passive: "asked or responsible" } }, { includeQuranicMetadata: false }),
  draft({ root: "طبخ", meaningEn: "cooking", past: "طَبَخَ", present: "يَطْبُخُ", imperative: "اُطْبُخْ", place: "مَطْبَخ", active: "طَابِخ", passive: "مَطْبُوخ", transliterationBase: "ṭabakha", transliterations: { past: "ṭabakha", present: "yaṭbukhu", imperative: "uṭbukh", place_or_mim_masdar: "maṭbakh", active_participle: "ṭābikh", passive_participle: "maṭbūkh" }, formMeanings: { past: "he cooked", present: "he cooks", imperative: "cook!", place: "a kitchen", active: "one who cooks", passive: "cooked" } }, { includeQuranicMetadata: false }),
  draft({ root: "طلب", meaningEn: "seeking, requesting", past: "طَلَبَ", present: "يَطْلُبُ", imperative: "اُطْلُبْ", place: "مَطْلَب", active: "طَالِب", passive: "مَطْلُوب", transliterationBase: "ṭalaba", transliterations: { past: "ṭalaba", present: "yaṭlubu", imperative: "uṭlub", place_or_mim_masdar: "maṭlab", active_participle: "ṭālib", passive_participle: "maṭlūb" }, formMeanings: { past: "he sought", present: "he seeks", imperative: "seek!", place: "a request or demand", active: "seeker or student", passive: "wanted or requested" } }, { includeQuranicMetadata: false }),
  draft({ root: "قرأ", meaningEn: "reading, reciting", past: "قَرَأَ", present: "يَقْرَأُ", imperative: "اِقْرَأْ", place: "مَقْرَأ", active: "قَارِئ", passive: "مَقْرُوء", transliterationBase: "qara'a", transliterations: { past: "qara'a", present: "yaqra'u", imperative: "iqra'", place_or_mim_masdar: "maqra'", active_participle: "qāri'", passive_participle: "maqrū'" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Hamzated verb; keep hamzat waṣl at the start, not إ.` }, formMeanings: { past: "he read", present: "he reads", imperative: "read!", place: "a reading place or recitation", active: "reader or reciter", passive: "read or recited" } }, { includeQuranicMetadata: false }),
  draft({ root: "وضع", meaningEn: "putting, placing", past: "وَضَعَ", present: "يَضَعُ", imperative: "ضَعْ", place: "مَوْضِع", active: "وَاضِع", passive: "مَوْضُوع", transliterationBase: "waḍaʿa", transliterations: { past: "waḍaʿa", present: "yaḍaʿu", imperative: "ḍaʿ", place_or_mim_masdar: "mawḍiʿ", active_participle: "wāḍiʿ", passive_participle: "mawḍūʿ" }, formNotes: { present: `${AI_DRAFT_NOTE} Initial-waw weak verb; the و drops in the present.`, imperative: `${AI_DRAFT_NOTE} Initial-waw weak verb; the imperative drops the initial و.` }, formMeanings: { past: "he put", present: "he puts", imperative: "put!", place: "a place or position", active: "one who puts", passive: "placed or a topic" } }, { includeQuranicMetadata: false }),
  draft({ root: "وعد", meaningEn: "promising", past: "وَعَدَ", present: "يَعِدُ", imperative: "عِدْ", place: "مَوْعِد", active: "وَاعِد", passive: "مَوْعُود", transliterationBase: "waʿada", transliterations: { past: "waʿada", present: "yaʿidu", imperative: "ʿid", place_or_mim_masdar: "mawʿid", active_participle: "wāʿid", passive_participle: "mawʿūd" }, formNotes: { present: `${AI_DRAFT_NOTE} Initial-waw weak verb; the و drops in the present.`, imperative: `${AI_DRAFT_NOTE} Initial-waw weak verb; the imperative drops the initial و.` }, formMeanings: { past: "he promised", present: "he promises", imperative: "promise!", place: "an appointment or meeting time", active: "one who promises", passive: "promised" } }, { includeQuranicMetadata: false }),
  draft({ root: "وجد", meaningEn: "finding", past: "وَجَدَ", present: "يَجِدُ", imperative: "جِدْ", place: "مَوْجِد", active: "وَاجِد", passive: "مَوْجُود", transliterationBase: "wajada", transliterations: { past: "wajada", present: "yajidu", imperative: "jid", place_or_mim_masdar: "mawjid", active_participle: "wājid", passive_participle: "mawjūd" }, formNotes: { present: `${AI_DRAFT_NOTE} Initial-waw weak verb; the و drops in the present.`, imperative: `${AI_DRAFT_NOTE} Initial-waw weak verb; the imperative drops the initial و.`, place_or_mim_masdar: `${AI_DRAFT_NOTE} مَوْجِد is pattern-based and less common than مَوْجُود in beginner usage.` }, formMeanings: { past: "he found", present: "he finds", imperative: "find!", place: "a place or source of finding", active: "one who finds", passive: "found or existing" } }, { includeQuranicMetadata: false }),
  draft({ root: "وصل", meaningEn: "arriving, connecting", past: "وَصَلَ", present: "يَصِلُ", imperative: "صِلْ", place: "مَوْصِل", active: "وَاصِل", passive: "مَوْصُول", transliterationBase: "waṣala", transliterations: { past: "waṣala", present: "yaṣilu", imperative: "ṣil", place_or_mim_masdar: "mawṣil", active_participle: "wāṣil", passive_participle: "mawṣūl" }, formNotes: { present: `${AI_DRAFT_NOTE} Initial-waw weak verb; the و drops in the present.`, imperative: `${AI_DRAFT_NOTE} Initial-waw weak verb; the imperative drops the initial و.` }, formMeanings: { past: "he arrived", present: "he arrives", imperative: "arrive or connect!", place: "a point of connection", active: "arriving or connecting", passive: "connected" } }, { includeQuranicMetadata: false }),
  draft({ root: "وقف", meaningEn: "standing, stopping", past: "وَقَفَ", present: "يَقِفُ", imperative: "قِفْ", place: "مَوْقِف", active: "وَاقِف", passive: "مَوْقُوف", transliterationBase: "waqafa", transliterations: { past: "waqafa", present: "yaqifu", imperative: "qif", place_or_mim_masdar: "mawqif", active_participle: "wāqif", passive_participle: "mawqūf" }, formNotes: { present: `${AI_DRAFT_NOTE} Initial-waw weak verb; the و drops in the present.`, imperative: `${AI_DRAFT_NOTE} Initial-waw weak verb; the imperative drops the initial و.` }, formMeanings: { past: "he stood or stopped", present: "he stands or stops", imperative: "stand or stop!", place: "a position or situation", active: "standing", passive: "stopped or suspended" } }, { includeQuranicMetadata: false }),
  draft({ root: "حسب", meaningEn: "calculating, reckoning", past: "حَسَبَ", present: "يَحْسِبُ", imperative: "اِحْسَبْ", place: "مَحْسَب", active: "حَاسِب", passive: "مَحْسُوب", transliterationBase: "ḥasaba", transliterations: { past: "ḥasaba", present: "yaḥsibu", imperative: "iḥsab", place_or_mim_masdar: "maḥsab", active_participle: "ḥāsib", passive_participle: "maḥsūb" }, formMeanings: { past: "he calculated", present: "he calculates", imperative: "calculate!", place: "a calculation point or place", active: "one who calculates", passive: "calculated or counted" } }, { includeQuranicMetadata: false }),
  draft({ root: "سهر", meaningEn: "staying awake at night", past: "سَهِرَ", present: "يَسْهَرُ", imperative: "اِسْهَرْ", place: "مَسْهَر", active: "سَاهِر", passive: "مَسْهُور", transliterationBase: "sahira", transliterations: { past: "sahira", present: "yas'haru", imperative: "is'har", place_or_mim_masdar: "mas'har", active_participle: "sāhir", passive_participle: "mas'hūr" }, formMeanings: { past: "he stayed awake", present: "he stays awake", imperative: "stay awake!", place: "a place or time of wakefulness", active: "awake or watchful", passive: "kept awake through" } }, { includeQuranicMetadata: false }),
  draft({ root: "صعب", meaningEn: "being difficult", past: "صَعُبَ", present: "يَصْعُبُ", imperative: "اُصْعُبْ", place: "مَصْعَب", active: "صَاعِب", passive: "مَصْعُوب", transliterationBase: "ṣaʿuba", transliterations: { past: "ṣaʿuba", present: "yaṣʿubu", imperative: "uṣʿub", place_or_mim_masdar: "maṣʿab", active_participle: "ṣāʿib", passive_participle: "maṣʿūb" }, formMeanings: { past: "it was difficult", present: "it is difficult", imperative: "be difficult!", place: "a difficult point", active: "difficult in a pattern-based sense", passive: "made difficult" } }, { includeQuranicMetadata: false }),
  draft({ root: "طلق", meaningEn: "fluency, release, being free", past: "طَلَقَ", present: "يَطْلُقُ", imperative: "اُطْلُقْ", place: "مَطْلَق", active: "طَالِق", passive: "مَطْلُوق", transliterationBase: "ṭalaqa", transliterations: { past: "ṭalaqa", present: "yaṭluqu", imperative: "uṭluq", place_or_mim_masdar: "maṭlaq", active_participle: "ṭāliq", passive_participle: "maṭlūq" }, formMeanings: { past: "he became free or fluent", present: "he becomes free or fluent", imperative: "be free or fluent!", place: "a starting point or unrestricted sense", active: "free, flowing, or fluent", passive: "released or set loose" } }, { includeQuranicMetadata: false }),
  draft({ root: "عمر", meaningEn: "inhabiting, filling, flourishing", past: "عَمَرَ", present: "يَعْمُرُ", imperative: "اُعْمُرْ", place: "مَعْمَر", active: "عَامِر", passive: "مَعْمُور", transliterationBase: "ʿamara", transliterations: { past: "ʿamara", present: "yaʿmuru", imperative: "uʿmur", place_or_mim_masdar: "maʿmar", active_participle: "ʿāmir", passive_participle: "maʿmūr" }, formMeanings: { past: "he inhabited or filled", present: "he inhabits or fills", imperative: "inhabit or fill!", place: "a dwelling place", active: "inhabiting, full, or flourishing", passive: "inhabited or built up" } }, { includeQuranicMetadata: false }),
  draft({ root: "برك", meaningEn: "kneeling, settling, blessing", past: "بَرَكَ", present: "يَبْرُكُ", imperative: "اُبْرُكْ", place: "مَبْرَك", active: "بَارِك", passive: "مَبْرُوك", transliterationBase: "baraka", transliterations: { past: "baraka", present: "yabruku", imperative: "ubruk", place_or_mim_masdar: "mabrak", active_participle: "bārik", passive_participle: "mabrūk" }, formMeanings: { past: "he or it knelt", present: "he or it kneels", imperative: "kneel!", place: "a kneeling place", active: "kneeling", passive: "made to kneel or blessed" } }, { includeQuranicMetadata: false }),
  draft({ root: "جهد", meaningEn: "striving, exerting effort", past: "جَهَدَ", present: "يَجْهَدُ", imperative: "اِجْهَدْ", place: "مَجْهَد", active: "جَاهِد", passive: "مَجْهُود", transliterationBase: "jahada", transliterations: { past: "jahada", present: "yajhadu", imperative: "ijhad", place_or_mim_masdar: "majhad", active_participle: "jāhid", passive_participle: "majhūd" }, formMeanings: { past: "he strove", present: "he strives", imperative: "strive!", place: "a place or point of effort", active: "one who strives", passive: "worked on with effort" } }, { includeQuranicMetadata: false }),
  draft({ root: "ورث", meaningEn: "inheriting", past: "وَرِثَ", present: "يَرِثُ", imperative: "رِثْ", place: "مَوْرِث", active: "وَارِث", passive: "مَوْرُوث", transliterationBase: "waritha", transliterations: { past: "waritha", present: "yarithu", imperative: "rith", place_or_mim_masdar: "mawrith", active_participle: "wārith", passive_participle: "mawrūth" }, formMeanings: { past: "he inherited", present: "he inherits", imperative: "inherit!", place: "a source of inheritance", active: "heir or inheritor", passive: "inherited" } }, { includeQuranicMetadata: false }),
  draft({ root: "وقد", meaningEn: "burning, kindling", past: "وَقَدَ", present: "يَقِدُ", imperative: "قِدْ", place: "مَوْقِد", active: "وَاقِد", passive: "مَوْقُود", transliterationBase: "waqada", transliterations: { past: "waqada", present: "yaqidu", imperative: "qid", place_or_mim_masdar: "mawqid", active_participle: "wāqid", passive_participle: "mawqūd" }, formMeanings: { past: "it burned", present: "it burns", imperative: "burn!", place: "a fireplace or stove", active: "burning", passive: "kindled or burned" } }, { includeQuranicMetadata: false }),
  draft({ root: "وقع", meaningEn: "falling, happening, being located", past: "وَقَعَ", present: "يَقَعُ", imperative: "قَعْ", place: "مَوْقِع", active: "وَاقِع", passive: "مَوْقُوع", transliterationBase: "waqaʿa", transliterations: { past: "waqaʿa", present: "yaqaʿu", imperative: "qaʿ", place_or_mim_masdar: "mawqiʿ", active_participle: "wāqiʿ", passive_participle: "mawqūʿ" }, formMeanings: { past: "it fell or happened", present: "it falls, happens, or is located", imperative: "fall!", place: "a location or site", active: "happening or real", passive: "fallen into or occurred upon" } }, { includeQuranicMetadata: false }),
  draft({ root: "ملأ", meaningEn: "filling", past: "مَلَأَ", present: "يَمْلَأُ", imperative: "اِمْلَأْ", place: "مَمْلَأ", active: "مَالِئ", passive: "مَمْلُوء", transliterationBase: "mala'a", transliterations: { past: "mala'a", present: "yamla'u", imperative: "imla'", place_or_mim_masdar: "mamla'", active_participle: "māli'", passive_participle: "mamlū'" }, formMeanings: { past: "he filled", present: "he fills", imperative: "fill!", place: "a filling place or point", active: "one who fills", passive: "filled or full" } }, { includeQuranicMetadata: false }),
  // Book 1 (Al-'Arabiyyah Bayna Yadayk) expansion batch. Past/present/imperative/masdar are
  // source-verified from the textbook vocabulary list; place/active/passive participles are
  // AI-generated per the verb's measure and are not source-verified (see per-form notes above).
  draft({ root: "مرر", meaningEn: "passing by", past: "مَرَّ", present: "يَمُرُّ", imperative: "مُرَّ", place: "مَمَرّ", active: "مَارّ", passive: "مَمْرُور", transliterationBase: "marra", transliterations: { past: "marra", present: "yamurru", imperative: "murra", place_or_mim_masdar: "mamarr", active_participle: "mārr", passive_participle: "mamrūr" }, formMeanings: { past: "he passed by", present: "he passes by", imperative: "pass by!", place: "a passageway", active: "passing by", passive: "passed by" }, rootNote: "Form I verb, doubled/geminate root (often used with بِـ)." }, { includeQuranicMetadata: false }),
  draft({ root: "نسخ", meaningEn: "copying", past: "نَسَخَ", present: "يَنْسَخُ", imperative: "اِنْسَخْ", place: "مَنْسَخ", active: "نَاسِخ", passive: "مَنْسُوخ", transliterationBase: "nasakha", transliterations: { past: "nasakha", present: "yansakhu", imperative: "insakh", place_or_mim_masdar: "mansakh", active_participle: "nāsikh", passive_participle: "mansūkh" }, formMeanings: { past: "he copied", present: "he copies", imperative: "copy!", place: "a copying place", active: "copier", passive: "copied" } }, { includeQuranicMetadata: false }),
  draft({ root: "وضأ", meaningEn: "performing ablution (wudoo)", past: "تَوَضَّأَ", present: "يَتَوَضَّأُ", imperative: "تَوَضَّأْ", place: "تَوَضُّؤ", active: "مُتَوَضِّئ", passive: "مُتَوَضَّأ", transliterationBase: "tawaḍḍa'a", transliterations: { past: "tawaḍḍa'a", present: "yatawaḍḍa'u", imperative: "tawaḍḍa'", place_or_mim_masdar: "tawaḍḍu'", active_participle: "mutawaḍḍi'", passive_participle: "mutawaḍḍa'" }, formMeanings: { past: "he performed ablution", present: "he performs ablution", imperative: "perform ablution!", place: "ablution (verbal noun)", active: "one who has performed ablution", passive: "the ablution performed (rare, pattern-based)" }, rootNote: "Form V verb.", measure: "V" }, { includeQuranicMetadata: false }),
  draft({ root: "يقظ", meaningEn: "waking up", past: "اِسْتَيْقَظَ", present: "يَسْتَيْقِظُ", imperative: "اِسْتَيْقِظْ", place: "اِسْتِيقَاظ", active: "مُسْتَيْقِظ", passive: "مُسْتَيْقَظ", transliterationBase: "istayqaẓa", transliterations: { past: "istayqaẓa", present: "yastayqiẓu", imperative: "istayqiẓ", place_or_mim_masdar: "istīqāẓ", active_participle: "mustayqiẓ", passive_participle: "mustayqaẓ" }, formMeanings: { past: "he woke up", present: "he wakes up", imperative: "wake up!", place: "waking up (verbal noun)", active: "awake", passive: "woken (rare, pattern-based)" }, rootNote: "Form X verb.", measure: "X" }, { includeQuranicMetadata: false }),
  draft({ root: "كنس", meaningEn: "sweeping, vacuuming", past: "كَنَسَ", present: "يَكْنُسُ", imperative: "اُكْنُسْ", place: "مَكْنَس", active: "كَانِس", passive: "مَكْنُوس", transliterationBase: "kanasa", transliterations: { past: "kanasa", present: "yaknusu", imperative: "uknus", place_or_mim_masdar: "maknas", active_participle: "kānis", passive_participle: "maknūs" }, formMeanings: { past: "he swept", present: "he sweeps", imperative: "sweep!", place: "a sweeping place", active: "sweeper", passive: "swept" } }, { includeQuranicMetadata: false }),
  draft({ root: "كوي", meaningEn: "ironing", past: "كَوَى", present: "يَكْوِي", imperative: "اِكْوِ", place: "مَكْوًى", active: "كَاوٍ", passive: "مَكْوِيّ", transliterationBase: "kawā", transliterations: { past: "kawā", present: "yakwī", imperative: "ikwi", place_or_mim_masdar: "makwan", active_participle: "kāwin", passive_participle: "makwiyy" }, formMeanings: { past: "he ironed", present: "he irons", imperative: "iron!", place: "an ironing place", active: "one who irons", passive: "ironed" }, rootNote: "Form I verb, doubly weak root (medial-weak and final-weak)." }, { includeQuranicMetadata: false }),
  draft({ root: "طوع", meaningEn: "being able, can", past: "اِسْتَطَاعَ", present: "يَسْتَطِيعُ", imperative: "اِسْتَطِعْ", place: "اِسْتِطَاعَة", active: "مُسْتَطِيع", passive: "مُسْتَطَاع", transliterationBase: "istaṭāʿa", transliterations: { past: "istaṭāʿa", present: "yastaṭīʿu", imperative: "istaṭiʿ", place_or_mim_masdar: "istiṭāʿah", active_participle: "mustaṭīʿ", passive_participle: "mustaṭāʿ" }, formMeanings: { past: "he was able", present: "he is able", imperative: "be able!", place: "ability", active: "able, capable", passive: "achievable (rare, pattern-based)" }, rootNote: "Form X verb, hollow root.", measure: "X" }, { includeQuranicMetadata: false }),
  draft({ root: "بدأ", meaningEn: "starting, beginning", past: "بَدَأَ", present: "يَبْدَأُ", imperative: "اِبْدَأْ", place: "مَبْدَأ", active: "بَادِئ", passive: "مَبْدُوء", transliterationBase: "bada'a", transliterations: { past: "bada'a", present: "yabda'u", imperative: "ibda'", place_or_mim_masdar: "mabda'", active_participle: "bādi'", passive_participle: "mabdū'" }, formMeanings: { past: "he started", present: "he starts", imperative: "start!", place: "a starting point, principle", active: "starter, one who begins", passive: "begun" } }, { includeQuranicMetadata: false }),
  draft({ root: "نهي", meaningEn: "finishing", past: "اِنْتَهَى", present: "يَنْتَهِي", imperative: "اِنْتَهِ", place: "اِنْتِهَاء", active: "مُنْتَهٍ", passive: "مُنْتَهًى", transliterationBase: "intahā", transliterations: { past: "intahā", present: "yantahī", imperative: "intahi", place_or_mim_masdar: "intihā'", active_participle: "muntahin", passive_participle: "muntahan" }, formMeanings: { past: "he finished", present: "he finishes", imperative: "finish!", place: "an end, a finishing (verbal noun)", active: "finishing, ending", passive: "endpoint, utmost" }, rootNote: "Form VIII verb, defective (final-weak) root.", measure: "VIII" }, { includeQuranicMetadata: false }),
  draft({ root: "صحح", meaningEn: "correcting", past: "صَحَّحَ", present: "يُصَحِّحُ", imperative: "صَحِّحْ", place: "تَصْحِيح", active: "مُصَحِّح", passive: "مُصَحَّح", transliterationBase: "ṣaḥḥaḥa", transliterations: { past: "ṣaḥḥaḥa", present: "yuṣaḥḥiḥu", imperative: "ṣaḥḥiḥ", place_or_mim_masdar: "taṣḥīḥ", active_participle: "muṣaḥḥiḥ", passive_participle: "muṣaḥḥaḥ" }, formMeanings: { past: "he corrected", present: "he corrects", imperative: "correct!", place: "a correction (verbal noun)", active: "corrector, proofreader", passive: "corrected" }, rootNote: "Form II verb, doubled/geminate root.", measure: "II" }, { includeQuranicMetadata: false }),
  draft({ root: "حبب", meaningEn: "loving, liking", past: "أَحَبَّ", present: "يُحِبُّ", imperative: "أَحِبَّ", place: "حُبّ", active: "مُحِبّ", passive: "مُحَبّ", transliterationBase: "aḥabba", transliterations: { past: "aḥabba", present: "yuḥibbu", imperative: "aḥibba", place_or_mim_masdar: "ḥubb", active_participle: "muḥibb", passive_participle: "muḥabb" }, formMeanings: { past: "he loved", present: "he loves", imperative: "love!", place: "love (verbal noun)", active: "lover, one who loves", passive: "loved" }, rootNote: "Form IV verb, doubled/geminate root.", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "رسم", meaningEn: "drawing", past: "رَسَمَ", present: "يَرْسُمُ", imperative: "اُرْسُمْ", place: "مَرْسَم", active: "رَاسِم", passive: "مَرْسُوم", transliterationBase: "rasama", transliterations: { past: "rasama", present: "yarsumu", imperative: "ursum", place_or_mim_masdar: "marsam", active_participle: "rāsim", passive_participle: "marsūm" }, formMeanings: { past: "he drew", present: "he draws", imperative: "draw!", place: "a drawing studio", active: "one who draws", passive: "drawn" } }, { includeQuranicMetadata: false }),
  draft({ root: "خير", meaningEn: "choosing", past: "اِخْتَارَ", present: "يَخْتَارُ", imperative: "اِخْتَرْ", place: "اِخْتِيَار", active: "مُخْتَار", passive: "مُخْتَار", transliterationBase: "ikhtāra", transliterations: { past: "ikhtāra", present: "yakhtāru", imperative: "ikhtar", place_or_mim_masdar: "ikhtiyār", active_participle: "mukhtār", passive_participle: "mukhtār" }, formMeanings: { past: "he chose", present: "he chooses", imperative: "choose!", place: "a choice", active: "one who chooses", passive: "chosen" }, rootNote: "Form VIII verb, hollow root.", measure: "VIII" }, { includeQuranicMetadata: false }),
  draft({ root: "روح", meaningEn: "resting, relaxing, taking a break", past: "اِسْتَرَاحَ", present: "يَسْتَرِيحُ", imperative: "اِسْتَرِحْ", place: "اِسْتِرَاحَة", active: "مُسْتَرِيح", passive: "مُسْتَرَاح", transliterationBase: "istarāḥa", transliterations: { past: "istarāḥa", present: "yastarīḥu", imperative: "istariḥ", place_or_mim_masdar: "istirāḥah", active_participle: "mustarīḥ", passive_participle: "mustarāḥ" }, formMeanings: { past: "he rested", present: "he rests", imperative: "rest!", place: "a rest, a rest stop", active: "resting, relaxed", passive: "rested (rare, pattern-based)" }, rootNote: "Form X verb, hollow root.", measure: "X" }, { includeQuranicMetadata: false }),
  draft({ root: "بقي", meaningEn: "staying, remaining", past: "بَقِيَ", present: "يَبْقَى", imperative: "اِبْقَ", place: "مَبْقًى", active: "بَاقٍ", passive: "مَبْقِيّ", transliterationBase: "baqiya", transliterations: { past: "baqiya", present: "yabqā", imperative: "ibqa", place_or_mim_masdar: "mabqan", active_participle: "bāqin", passive_participle: "mabqiyy" }, formMeanings: { past: "he stayed", present: "he stays", imperative: "stay!", place: "a place of staying", active: "remaining, lasting", passive: "kept remaining (rare, pattern-based)" } }, { includeQuranicMetadata: false }),
  draft({ root: "قضي", meaningEn: "spending time", past: "قَضَى", present: "يَقْضِي", imperative: "اِقْضِ", place: "مَقْضًى", active: "قَاضٍ", passive: "مَقْضِيّ", transliterationBase: "qaḍā", transliterations: { past: "qaḍā", present: "yaqḍī", imperative: "iqḍi", place_or_mim_masdar: "maqḍan", active_participle: "qāḍin", passive_participle: "maqḍiyy" }, formMeanings: { past: "he spent (time)", present: "he spends (time)", imperative: "spend (time)!", place: "a place/matter of spending time", active: "one spending time (usually: judge)", passive: "spent, decreed" } }, { includeQuranicMetadata: false }),
  draft({ root: "حضر", meaningEn: "attending, being present", past: "حَضَرَ", present: "يَحْضُرُ", imperative: "اُحْضُرْ", place: "مَحْضَر", active: "حَاضِر", passive: "مَحْضُور", transliterationBase: "ḥaḍara", transliterations: { past: "ḥaḍara", present: "yaḥḍuru", imperative: "uḥḍur", place_or_mim_masdar: "maḥḍar", active_participle: "ḥāḍir", passive_participle: "maḥḍūr" }, formMeanings: { past: "he attended", present: "he attends", imperative: "attend!", place: "a record, place of attendance", active: "present, attending", passive: "attended (rare, pattern-based)" } }, { includeQuranicMetadata: false }),
  draft({ root: "نقل", meaningEn: "moving, transferring", past: "اِنْتَقَلَ", present: "يَنْتَقِلُ", imperative: "اِنْتَقِلْ", place: "اِنْتِقَال", active: "مُنْتَقِل", passive: "مُنْتَقَل", transliterationBase: "intaqala", transliterations: { past: "intaqala", present: "yantaqilu", imperative: "intaqil", place_or_mim_masdar: "intiqāl", active_participle: "muntaqil", passive_participle: "muntaqal" }, formMeanings: { past: "he moved", present: "he moves", imperative: "move!", place: "a move, a transfer", active: "one who moves, relocating", passive: "moved (rare, pattern-based)" }, rootNote: "Form VIII verb.", measure: "VIII" }, { includeQuranicMetadata: false }),
  draft({ root: "غرق", meaningEn: "taking (time), being absorbed", past: "اِسْتَغْرَقَ", present: "يَسْتَغْرِقُ", imperative: "اِسْتَغْرِقْ", place: "اِسْتِغْرَاق", active: "مُسْتَغْرِق", passive: "مُسْتَغْرَق", transliterationBase: "istaghraqa", transliterations: { past: "istaghraqa", present: "yastaghriqu", imperative: "istaghriq", place_or_mim_masdar: "istighrāq", active_participle: "mustaghriq", passive_participle: "mustaghraq" }, formMeanings: { past: "he took (time), was absorbed", present: "he takes (time), is absorbed", imperative: "take your time! / be absorbed!", place: "absorption, duration (verbal noun)", active: "taking (time), absorbed", passive: "absorbed, used up (rare, pattern-based)" }, rootNote: "Form X verb.", measure: "X" }, { includeQuranicMetadata: false }),
  draft({ root: "زحم", meaningEn: "being crowded, congested", past: "اِزْدَحَمَ", present: "يَزْدَحِمُ", imperative: "اِزْدَحِمْ", place: "اِزْدِحَام", active: "مُزْدَحِم", passive: "مُزْدَحَم", transliterationBase: "izdaḥama", transliterations: { past: "izdaḥama", present: "yazdaḥimu", imperative: "izdaḥim", place_or_mim_masdar: "izdiḥām", active_participle: "muzdaḥim", passive_participle: "muzdaḥam" }, formMeanings: { past: "it became crowded", present: "it becomes crowded", imperative: "crowd together!", place: "congestion, crowding (verbal noun)", active: "crowded, congested", passive: "thronged, crowded" }, rootNote: "Form VIII verb; the ت assimilates to د after ز.", measure: "VIII" }, { includeQuranicMetadata: false }),
  draft({ root: "حجز", meaningEn: "booking, reserving", past: "حَجَزَ", present: "يَحْجِزُ", imperative: "اِحْجِزْ", place: "مَحْجَز", active: "حَاجِز", passive: "مَحْجُوز", transliterationBase: "ḥajaza", transliterations: { past: "ḥajaza", present: "yaḥjizu", imperative: "iḥjiz", place_or_mim_masdar: "maḥjaz", active_participle: "ḥājiz", passive_participle: "maḥjūz" }, formMeanings: { past: "he booked", present: "he books", imperative: "book!", place: "a reservation place", active: "one who books", passive: "booked, reserved" } }, { includeQuranicMetadata: false }),
  draft({ root: "أكد", meaningEn: "confirming", past: "أَكَّدَ", present: "يُؤَكِّدُ", imperative: "أَكِّدْ", place: "تَأْكِيد", active: "مُؤَكِّد", passive: "مُؤَكَّد", transliterationBase: "akkada", transliterations: { past: "akkada", present: "yu'akkidu", imperative: "akkid", place_or_mim_masdar: "ta'kīd", active_participle: "mu'akkid", passive_participle: "mu'akkad" }, formMeanings: { past: "he confirmed", present: "he confirms", imperative: "confirm!", place: "a confirmation (verbal noun)", active: "confirming", passive: "confirmed" }, rootNote: "Form II verb, hamzated root.", measure: "II" }, { includeQuranicMetadata: false }),
  draft({ root: "حلق", meaningEn: "shaving", past: "حَلَقَ", present: "يَحْلِقُ", imperative: "اِحْلِقْ", place: "مَحْلَق", active: "حَالِق", passive: "مَحْلُوق", transliterationBase: "ḥalaqa", transliterations: { past: "ḥalaqa", present: "yaḥliqu", imperative: "iḥliq", place_or_mim_masdar: "maḥlaq", active_participle: "ḥāliq", passive_participle: "maḥlūq" }, formMeanings: { past: "he shaved", present: "he shaves", imperative: "shave!", place: "a shaving place", active: "barber, one who shaves", passive: "shaved" }, rootNote: "Form I verb; this root ح ل ق also means throat, a separate common word." }, { includeQuranicMetadata: false }),
  draft({ root: "رمي", meaningEn: "throwing", past: "رَمَى", present: "يَرْمِي", imperative: "اِرْمِ", place: "مَرْمًى", active: "رَامٍ", passive: "مَرْمِيّ", transliterationBase: "ramā", transliterations: { past: "ramā", present: "yarmī", imperative: "irmi", place_or_mim_masdar: "marman", active_participle: "rāmin", passive_participle: "marmiyy" }, formMeanings: { past: "he threw", present: "he throws", imperative: "throw!", place: "a target, a goal", active: "thrower", passive: "thrown" } }, { includeQuranicMetadata: false }),
  draft({ root: "سعي", meaningEn: "striving; making sa'ee", past: "سَعَى", present: "يَسْعَى", imperative: "اِسْعَ", place: "مَسْعًى", active: "سَاعٍ", passive: "مَسْعِيّ", transliterationBase: "saʿā", transliterations: { past: "saʿā", present: "yasʿā", imperative: "isʿa", place_or_mim_masdar: "masʿan", active_participle: "sāʿin", passive_participle: "masʿiyy" }, formMeanings: { past: "he strove, made sa'ee", present: "he strives, makes sa'ee", imperative: "strive! / make sa'ee!", place: "al-Mas'a, the sa'ee course", active: "one who strives", passive: "pursued (rare, pattern-based)" } }, { includeQuranicMetadata: false }),
  draft({ root: "خلع", meaningEn: "taking off, undressing", past: "خَلَعَ", present: "يَخْلَعُ", imperative: "اِخْلَعْ", place: "مَخْلَع", active: "خَالِع", passive: "مَخْلُوع", transliterationBase: "khalaʿa", transliterations: { past: "khalaʿa", present: "yakhlaʿu", imperative: "ikhlaʿ", place_or_mim_masdar: "makhlaʿ", active_participle: "khāliʿ", passive_participle: "makhlūʿ" }, formMeanings: { past: "he took off", present: "he takes off", imperative: "take off!", place: "a place for taking off (clothes)", active: "one who takes off", passive: "taken off" } }, { includeQuranicMetadata: false }),
  draft({ root: "رفع", meaningEn: "rising, being elevated", past: "اِرْتَفَعَ", present: "يَرْتَفِعُ", imperative: "اِرْتَفِعْ", place: "اِرْتِفَاع", active: "مُرْتَفِع", passive: "مُرْتَفَع", transliterationBase: "irtafaʿa", transliterations: { past: "irtafaʿa", present: "yartafiʿu", imperative: "irtafiʿ", place_or_mim_masdar: "irtifāʿ", active_participle: "murtafiʿ", passive_participle: "murtafaʿ" }, formMeanings: { past: "it rose", present: "it rises", imperative: "rise!", place: "a rise, a height (verbal noun)", active: "elevated, rising", passive: "a highland, elevated area" }, rootNote: "Form VIII verb.", measure: "VIII" }, { includeQuranicMetadata: false }),
  draft({ root: "شفي", meaningEn: "curing, healing", past: "شَفَى", present: "يَشْفِي", imperative: "اِشْفِ", place: "مَشْفًى", active: "شَافٍ", passive: "مَشْفِيّ", transliterationBase: "shafā", transliterations: { past: "shafā", present: "yashfī", imperative: "ishfi", place_or_mim_masdar: "mashfan", active_participle: "shāfin", passive_participle: "mashfiyy" }, formMeanings: { past: "he cured", present: "he cures", imperative: "cure!", place: "a hospital, clinic", active: "curative, healing", passive: "cured, healed" } }, { includeQuranicMetadata: false }),
  draft({ root: "فحص", meaningEn: "checking, examining", past: "فَحَصَ", present: "يَفْحَصُ", imperative: "اِفْحَصْ", place: "مَفْحَص", active: "فَاحِص", passive: "مَفْحُوص", transliterationBase: "faḥaṣa", transliterations: { past: "faḥaṣa", present: "yafḥaṣu", imperative: "ifḥaṣ", place_or_mim_masdar: "mafḥaṣ", active_participle: "fāḥiṣ", passive_participle: "mafḥūṣ" }, formMeanings: { past: "he examined", present: "he examines", imperative: "examine!", place: "an examination place", active: "examiner, inspector", passive: "examined" } }, { includeQuranicMetadata: false }),
  // Book 1 (Al-'Arabiyyah Bayna Yadayk) expansion batch, part 2: previously deferred
  // Form II/III/IV/V/VI verbs and bare hollow Form-I verbs, now unblocked by the
  // measure-aware imperative test. Past/present/imperative/masdar are source-verified;
  // place/active/passive participles are AI-generated per measure (see per-form notes above).
  draft({ root: "عود", meaningEn: "repeating, returning (something)", past: "أَعَادَ", present: "يُعِيدُ", imperative: "أَعِدْ", place: "إِعَادَة", active: "مُعِيد", passive: "مُعَاد", transliterationBase: "aʿāda", transliterations: { past: "aʿāda", present: "yuʿīdu", imperative: "aʿid", place_or_mim_masdar: "iʿādah", active_participle: "muʿīd", passive_participle: "muʿād" }, formMeanings: { past: "he repeated, returned (it)", present: "he repeats, returns (it)", imperative: "return it!", place: "a repetition, a return (verbal noun)", active: "one who repeats; teaching assistant", passive: "repeated, returned; recycled" }, rootNote: "Form IV verb, hollow root.", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "شور", meaningEn: "pointing, indicating", past: "أَشَارَ", present: "يُشِيرُ", imperative: "أَشِرْ", place: "إِشَارَة", active: "مُشِير", passive: "مُشَار", transliterationBase: "ashāra", transliterations: { past: "ashāra", present: "yushīru", imperative: "ashir", place_or_mim_masdar: "ishārah", active_participle: "mushīr", passive_participle: "mushār" }, formMeanings: { past: "he pointed, indicated", present: "he points, indicates", imperative: "point!", place: "a sign, a signal", active: "one who points; a marshal", passive: "indicated, referred to" }, rootNote: "Form IV verb, hollow root.", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "قول", meaningEn: "saying", past: "قَالَ", present: "يَقُولُ", imperative: "قُلْ", place: "مَقَال", active: "قَائِل", passive: "مَقُول", transliterationBase: "qāla", transliterations: { past: "qāla", present: "yaqūlu", imperative: "qul", place_or_mim_masdar: "maqāl", active_participle: "qā'il", passive_participle: "maqūl" }, formMeanings: { past: "he said", present: "he says", imperative: "say!", place: "an article", active: "sayer, speaker", passive: "said" }, rootNote: "Form I verb, hollow root.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "رتب", meaningEn: "arranging", past: "رَتَّبَ", present: "يُرَتِّبُ", imperative: "رَتِّبْ", place: "تَرْتِيب", active: "مُرَتِّب", passive: "مُرَتَّب", transliterationBase: "rattaba", transliterations: { past: "rattaba", present: "yurattibu", imperative: "rattib", place_or_mim_masdar: "tartīb", active_participle: "murattib", passive_participle: "murattab" }, formMeanings: { past: "he arranged", present: "he arranges", imperative: "arrange!", place: "an arrangement (verbal noun)", active: "one who arranges", passive: "arranged; a salary" }, rootNote: "Form II verb.", measure: "II" }, { includeQuranicMetadata: false }),
  draft({ root: "بدل", meaningEn: "exchanging", past: "تَبَادَلَ", present: "يَتَبَادَلُ", imperative: "تَبَادَلْ", place: "تَبَادُل", active: "مُتَبَادِل", passive: "مُتَبَادَل", transliterationBase: "tabādala", transliterations: { past: "tabādala", present: "yatabādalu", imperative: "tabādal", place_or_mim_masdar: "tabādul", active_participle: "mutabādil", passive_participle: "mutabādal" }, formMeanings: { past: "he exchanged", present: "he exchanges", imperative: "exchange!", place: "an exchange (verbal noun)", active: "mutual, reciprocal", passive: "exchanged, mutual" }, rootNote: "Form VI verb.", measure: "VI" }, { includeQuranicMetadata: false }),
  draft({ root: "جوب", meaningEn: "answering", past: "أَجَابَ", present: "يُجِيبُ", imperative: "أَجِبْ", place: "إِجَابَة", active: "مُجِيب", passive: "مُجَاب", transliterationBase: "ajāba", transliterations: { past: "ajāba", present: "yujību", imperative: "ajib", place_or_mim_masdar: "ijābah", active_participle: "mujīb", passive_participle: "mujāb" }, formMeanings: { past: "he answered", present: "he answers", imperative: "answer!", place: "an answer", active: "one who answers", passive: "answered" }, rootNote: "Form IV verb, hollow root.", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "صلو", meaningEn: "praying", past: "صَلَّى", present: "يُصَلِّي", imperative: "صَلِّ", place: "صَلَاة", active: "مُصَلٍّ", passive: "مُصَلًّى", transliterationBase: "ṣallā", transliterations: { past: "ṣallā", present: "yuṣallī", imperative: "ṣalli", place_or_mim_masdar: "ṣalāh", active_participle: "muṣallin", passive_participle: "muṣallan" }, formMeanings: { past: "he prayed", present: "he prays", imperative: "pray!", place: "a prayer (irregular masdar)", active: "one who prays", passive: "a prayer room, prayer area" }, rootNote: "Form II verb, defective root; the masdar صَلَاة is irregular.", measure: "II" }, { includeQuranicMetadata: false }),
  draft({ root: "رود", meaningEn: "wanting, intending", past: "أَرَادَ", present: "يُرِيدُ", imperative: "أَرِدْ", place: "إِرَادَة", active: "مُرِيد", passive: "مُرَاد", transliterationBase: "arāda", transliterations: { past: "arāda", present: "yurīdu", imperative: "arid", place_or_mim_masdar: "irādah", active_participle: "murīd", passive_participle: "murād" }, formMeanings: { past: "he wanted, intended", present: "he wants, intends", imperative: "wish (good)!", place: "will, intention, willpower", active: "one who wants; a Sufi disciple", passive: "wanted, intended, meant" }, rootNote: "Form IV verb, hollow root.", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "نوم", meaningEn: "sleeping", past: "نَامَ", present: "يَنَامُ", imperative: "نَمْ", place: "مَنَام", active: "نَائِم", passive: "مَنُوم", transliterationBase: "nāma", transliterations: { past: "nāma", present: "yanāmu", imperative: "nam", place_or_mim_masdar: "manām", active_participle: "nā'im", passive_participle: "manūm" }, formMeanings: { past: "he slept", present: "he sleeps", imperative: "sleep!", place: "a dream, a sleeping place", active: "sleeping, asleep", passive: "put to sleep (rare, pattern-based)" }, rootNote: "Form I verb, hollow root.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "فضل", meaningEn: "preferring", past: "فَضَّلَ", present: "يُفَضِّلُ", imperative: "فَضِّلْ", place: "تَفْضِيل", active: "مُفَضِّل", passive: "مُفَضَّل", transliterationBase: "faḍḍala", transliterations: { past: "faḍḍala", present: "yufaḍḍilu", imperative: "faḍḍil", place_or_mim_masdar: "tafḍīl", active_participle: "mufaḍḍil", passive_participle: "mufaḍḍal" }, formMeanings: { past: "he preferred", present: "he prefers", imperative: "prefer!", place: "a preference (verbal noun)", active: "one who prefers", passive: "preferred, favorite" }, rootNote: "Form II verb.", measure: "II" }, { includeQuranicMetadata: false }),
  draft({ root: "حول", meaningEn: "changing, converting, transferring", past: "حَوَّلَ", present: "يُحَوِّلُ", imperative: "حَوِّلْ", place: "تَحْوِيل", active: "مُحَوِّل", passive: "مُحَوَّل", transliterationBase: "ḥawwala", transliterations: { past: "ḥawwala", present: "yuḥawwilu", imperative: "ḥawwil", place_or_mim_masdar: "taḥwīl", active_participle: "muḥawwil", passive_participle: "muḥawwal" }, formMeanings: { past: "he changed, transferred", present: "he changes, transfers", imperative: "transfer!", place: "a transfer, a conversion (verbal noun)", active: "converter, transformer", passive: "converted, transferred" }, rootNote: "Form II verb, hollow root.", measure: "II" }, { includeQuranicMetadata: false }),
  draft({ root: "سفر", meaningEn: "traveling", past: "سَافَرَ", present: "يُسَافِرُ", imperative: "سَافِرْ", place: "سَفَر", active: "مُسَافِر", passive: "مُسَافَر", transliterationBase: "sāfara", transliterations: { past: "sāfara", present: "yusāfiru", imperative: "sāfir", place_or_mim_masdar: "safar", active_participle: "musāfir", passive_participle: "musāfar" }, formMeanings: { past: "he traveled", present: "he travels", imperative: "travel!", place: "a journey, a trip", active: "traveler", passive: "traveled (rare, pattern-based)" }, rootNote: "Form III verb.", measure: "III" }, { includeQuranicMetadata: false }),
  draft({ root: "كون", meaningEn: "being", past: "كَانَ", present: "يَكُونُ", imperative: "كُنْ", place: "مَكَان", active: "كَائِن", passive: "مَكُون", transliterationBase: "kāna", transliterations: { past: "kāna", present: "yakūnu", imperative: "kun", place_or_mim_masdar: "makān", active_participle: "kā'in", passive_participle: "makūn" }, formMeanings: { past: "he was", present: "he is, becomes", imperative: "be!", place: "a place", active: "being, existing", passive: "essentially unused (pattern-based only)" }, rootNote: "Form I verb, hollow root, functions as a copula/auxiliary.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "كمل", meaningEn: "completing", past: "أَكْمَلَ", present: "يُكْمِلُ", imperative: "أَكْمِلْ", place: "إِكْمَال", active: "مُكْمِل", passive: "مُكْمَل", transliterationBase: "akmala", transliterations: { past: "akmala", present: "yukmilu", imperative: "akmil", place_or_mim_masdar: "ikmāl", active_participle: "mukmil", passive_participle: "mukmal" }, formMeanings: { past: "he completed", present: "he completes", imperative: "complete!", place: "a completion (verbal noun)", active: "completer", passive: "completed" }, rootNote: "Form IV verb.", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "صبح", meaningEn: "becoming", past: "أَصْبَحَ", present: "يُصْبِحُ", imperative: "أَصْبِحْ", place: "إِصْبَاح", active: "مُصْبِح", passive: "مُصْبَح", transliterationBase: "aṣbaḥa", transliterations: { past: "aṣbaḥa", present: "yuṣbiḥu", imperative: "aṣbiḥ", place_or_mim_masdar: "iṣbāḥ", active_participle: "muṣbiḥ", passive_participle: "muṣbaḥ" }, formMeanings: { past: "he became", present: "he becomes", imperative: "become!", place: "becoming (rarely used verbal noun)", active: "becoming (rare, pattern-based)", passive: "essentially unused (pattern-based only)" }, rootNote: "Form IV verb, functions as a stative/auxiliary verb (kaana-sister).", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "سوق", meaningEn: "shopping", past: "تَسَوَّقَ", present: "يَتَسَوَّقُ", imperative: "تَسَوَّقْ", place: "تَسَوُّق", active: "مُتَسَوِّق", passive: "مُتَسَوَّق", transliterationBase: "tasawwaqa", transliterations: { past: "tasawwaqa", present: "yatasawwaqu", imperative: "tasawwaq", place_or_mim_masdar: "tasawwuq", active_participle: "mutasawwiq", passive_participle: "mutasawwaq" }, formMeanings: { past: "he shopped", present: "he shops", imperative: "shop!", place: "shopping (verbal noun)", active: "shopper", passive: "shopped in (rare, pattern-based)" }, rootNote: "Form V verb.", measure: "V" }, { includeQuranicMetadata: false }),
  draft({ root: "مطر", meaningEn: "raining", past: "أَمْطَرَ", present: "يُمْطِرُ", imperative: "أَمْطِرْ", place: "إِمْطَار", active: "مُمْطِر", passive: "مُمْطَر", transliterationBase: "amṭara", transliterations: { past: "amṭara", present: "yumṭiru", imperative: "amṭir", place_or_mim_masdar: "imṭār", active_participle: "mumṭir", passive_participle: "mumṭar" }, formMeanings: { past: "it rained", present: "it rains", imperative: "rain! (figurative)", place: "rainfall (verbal noun)", active: "rainy, raining", passive: "rained upon" }, rootNote: "Form IV verb, impersonal weather verb.", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "كلم", meaningEn: "speaking", past: "تَكَلَّمَ", present: "يَتَكَلَّمُ", imperative: "تَكَلَّمْ", place: "تَكَلُّم", active: "مُتَكَلِّم", passive: "مُتَكَلَّم", transliterationBase: "takallama", transliterations: { past: "takallama", present: "yatakallamu", imperative: "takallam", place_or_mim_masdar: "takallum", active_participle: "mutakallim", passive_participle: "mutakallam" }, formMeanings: { past: "he spoke", present: "he speaks", imperative: "speak!", place: "speaking (verbal noun)", active: "speaker", passive: "spoken about (rare, pattern-based)" }, rootNote: "Form V verb.", measure: "V" }, { includeQuranicMetadata: false }),
  draft({ root: "زوج", meaningEn: "marrying", past: "تَزَوَّجَ", present: "يَتَزَوَّجُ", imperative: "تَزَوَّجْ", place: "تَزَوُّج", active: "مُتَزَوِّج", passive: "مُتَزَوَّج", transliterationBase: "tazawwaja", transliterations: { past: "tazawwaja", present: "yatazawwaju", imperative: "tazawwaj", place_or_mim_masdar: "tazawwuj", active_participle: "mutazawwij", passive_participle: "mutazawwaj" }, formMeanings: { past: "he got married", present: "he gets married", imperative: "get married!", place: "marriage (verbal noun)", active: "married (person)", passive: "married (rare, pattern-based)" }, rootNote: "Form V verb.", measure: "V" }, { includeQuranicMetadata: false }),
  draft({ root: "زور", meaningEn: "visiting", past: "زَارَ", present: "يَزُورُ", imperative: "زُرْ", place: "مَزَار", active: "زَائِر", passive: "مَزُور", transliterationBase: "zāra", transliterations: { past: "zāra", present: "yazūru", imperative: "zur", place_or_mim_masdar: "mazār", active_participle: "zā'ir", passive_participle: "mazūr" }, formMeanings: { past: "he visited", present: "he visits", imperative: "visit!", place: "a shrine, a place of visitation", active: "visitor", passive: "visited" }, rootNote: "Form I verb, hollow root.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "لوث", meaningEn: "being polluted", past: "تَلَوَّثَ", present: "يَتَلَوَّثُ", imperative: "تَلَوَّثْ", place: "تَلَوُّث", active: "مُتَلَوِّث", passive: "مُتَلَوَّث", transliterationBase: "talawwatha", transliterations: { past: "talawwatha", present: "yatalawwathu", imperative: "talawwath", place_or_mim_masdar: "talawwuth", active_participle: "mutalawwith", passive_participle: "mutalawwath" }, formMeanings: { past: "it became polluted", present: "it becomes polluted", imperative: "get dirty! (informal)", place: "pollution (verbal noun)", active: "polluted, contaminated", passive: "polluted (with something)" }, rootNote: "Form V verb.", measure: "V" }, { includeQuranicMetadata: false }),
  draft({ root: "قوم", meaningEn: "staying, residing", past: "أَقَامَ", present: "يُقِيمُ", imperative: "أَقِمْ", place: "إِقَامَة", active: "مُقِيم", passive: "مُقَام", transliterationBase: "aqāma", transliterations: { past: "aqāma", present: "yuqīmu", imperative: "aqim", place_or_mim_masdar: "iqāmah", active_participle: "muqīm", passive_participle: "muqām" }, formMeanings: { past: "he stayed, resided", present: "he stays, resides", imperative: "stay!", place: "a residence, a stay", active: "resident", passive: "held, established; a shrine/rank" }, rootNote: "Form IV verb, hollow root.", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "غدر", meaningEn: "departing", past: "غَادَرَ", present: "يُغَادِرُ", imperative: "غَادِرْ", place: "مُغَادَرَة", active: "مُغَادِر", passive: "مُغَادَر", transliterationBase: "ghādara", transliterations: { past: "ghādara", present: "yughādiru", imperative: "ghādir", place_or_mim_masdar: "mughādarah", active_participle: "mughādir", passive_participle: "mughādar" }, formMeanings: { past: "he departed", present: "he departs", imperative: "depart!", place: "a departure (verbal noun)", active: "one departing", passive: "departed from (rare, pattern-based)" }, rootNote: "Form III verb.", measure: "III" }, { includeQuranicMetadata: false }),
  draft({ root: "صوم", meaningEn: "fasting", past: "صَامَ", present: "يَصُومُ", imperative: "صُمْ", place: "مَصَام", active: "صَائِم", passive: "مَصُوم", transliterationBase: "ṣāma", transliterations: { past: "ṣāma", present: "yaṣūmu", imperative: "ṣum", place_or_mim_masdar: "maṣām", active_participle: "ṣā'im", passive_participle: "maṣūm" }, formMeanings: { past: "he fasted", present: "he fasts", imperative: "fast!", place: "a period of fasting (rare, pattern-based)", active: "fasting person", passive: "essentially unused (pattern-based only)" }, rootNote: "Form I verb, hollow root.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "طوف", meaningEn: "making tawaf", past: "طَافَ", present: "يَطُوفُ", imperative: "طُفْ", place: "مَطَاف", active: "طَائِف", passive: "مَطُوف", transliterationBase: "ṭāfa", transliterations: { past: "ṭāfa", present: "yaṭūfu", imperative: "ṭuf", place_or_mim_masdar: "maṭāf", active_participle: "ṭā'if", passive_participle: "maṭūf" }, formMeanings: { past: "he made tawaf", present: "he makes tawaf", imperative: "make tawaf!", place: "the tawaf area", active: "one making tawaf", passive: "circled around (rare, pattern-based)" }, rootNote: "Form I verb, hollow root.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "لبي", meaningEn: "saying the Talbiyah", past: "لَبَّى", present: "يُلَبِّي", imperative: "لَبِّ", place: "تَلْبِيَة", active: "مُلَبٍّ", passive: "مُلَبًّى", transliterationBase: "labbā", transliterations: { past: "labbā", present: "yulabbī", imperative: "labbi", place_or_mim_masdar: "talbiyah", active_participle: "mulabbin", passive_participle: "mulabban" }, formMeanings: { past: "he said the Talbiyah", present: "he says the Talbiyah", imperative: "say the Talbiyah!", place: "the Talbiyah (verbal noun)", active: "one saying the Talbiyah", passive: "answered, responded to (rare, pattern-based)" }, rootNote: "Form II verb, defective root.", measure: "II" }, { includeQuranicMetadata: false }),
  draft({ root: "صوب", meaningEn: "being afflicted, hit", past: "أَصَابَ", present: "يُصِيبُ", imperative: "أَصِبْ", place: "إِصَابَة", active: "مُصِيب", passive: "مُصَاب", transliterationBase: "aṣāba", transliterations: { past: "aṣāba", present: "yuṣību", imperative: "aṣib", place_or_mim_masdar: "iṣābah", active_participle: "muṣīb", passive_participle: "muṣāb" }, formMeanings: { past: "it afflicted, hit", present: "it afflicts, hits", imperative: "hit (your target)!", place: "an injury, an affliction", active: "correct, on target", passive: "afflicted (with an illness/injury)" }, rootNote: "Form IV verb, hollow root.", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "غيب", meaningEn: "being absent", past: "تَغَيَّبَ", present: "يَتَغَيَّبُ", imperative: "تَغَيَّبْ", place: "تَغَيُّب", active: "مُتَغَيِّب", passive: "مُتَغَيَّب", transliterationBase: "taghayyaba", transliterations: { past: "taghayyaba", present: "yataghayyabu", imperative: "taghayyab", place_or_mim_masdar: "taghayyub", active_participle: "mutaghayyib", passive_participle: "mutaghayyab" }, formMeanings: { past: "he was absent", present: "he is absent", imperative: "be absent!", place: "an absence (verbal noun)", active: "absent (person)", passive: "absented from (rare, pattern-based)" }, rootNote: "Form V verb.", measure: "V" }, { includeQuranicMetadata: false }),
  draft({ root: "عطو", meaningEn: "giving", past: "أَعْطَى", present: "يُعْطِي", imperative: "أَعْطِ", place: "عَطَاء", active: "مُعْطٍ", passive: "مُعْطًى", transliterationBase: "aʿṭā", transliterations: { past: "aʿṭā", present: "yuʿṭī", imperative: "aʿṭi", place_or_mim_masdar: "ʿaṭā'", active_participle: "muʿṭin", passive_participle: "muʿṭan" }, formMeanings: { past: "he gave", present: "he gives", imperative: "give!", place: "a gift, a giving", active: "giver", passive: "given; a datum" }, rootNote: "Form IV verb, defective root.", measure: "IV" }, { includeQuranicMetadata: false }),
  draft({ root: "سعد", meaningEn: "helping", past: "سَاعَدَ", present: "يُسَاعِدُ", imperative: "سَاعِدْ", place: "مُسَاعَدَة", active: "مُسَاعِد", passive: "مُسَاعَد", transliterationBase: "sāʿada", transliterations: { past: "sāʿada", present: "yusāʿidu", imperative: "sāʿid", place_or_mim_masdar: "musāʿadah", active_participle: "musāʿid", passive_participle: "musāʿad" }, formMeanings: { past: "he helped", present: "he helps", imperative: "help!", place: "help, assistance (verbal noun)", active: "helper, assistant", passive: "helped, assisted" }, rootNote: "Form III verb.", measure: "III" }, { includeQuranicMetadata: false }),
  draft({ root: "رأي", meaningEn: "seeing", past: "رَأَى", present: "يَرَى", imperative: "رَ", place: "رُؤْيَة", active: "رَاءٍ", passive: "مَرْئِيّ", transliterationBase: "ra'ā", transliterations: { past: "ra'ā", present: "yarā", imperative: "ra", place_or_mim_masdar: "ru'yah", active_participle: "rā'in", passive_participle: "mar'iyy" }, formMeanings: { past: "he saw", present: "he sees", imperative: "see! (rare, uncommon for learners)", place: "vision, sight", active: "one who sees (rare, classical)", passive: "visible, visual" }, rootNote: "Form I verb, doubly irregular root (medial hamza, final weak); imperative رَ is grammatically valid but uncommon for learners, per the source vocabulary list.", measure: "I" }, { includeQuranicMetadata: false }),
  // Book 2 CSV expansion batch 1: Book 2 Part 1 Chapter One. Past/present/imperative/masdar
  // are from the CSV; place/active/passive fields are conservative AI-draft generated forms.
  draft({ root: "علج", meaningEn: "treating, curing", past: "عَالَجَ", present: "يُعَالِجُ", imperative: "عَالِجْ", place: "مُعَالَجَة", active: "مُعَالِج", passive: "مُعَالَج", transliterationBase: "ʿālaja", transliterations: { past: "ʿālaja", present: "yuʿāliju", imperative: "ʿālij", place_or_mim_masdar: "muʿālajah", active_participle: "muʿālij", passive_participle: "muʿālaj" }, formMeanings: { past: "he treated", present: "he treats", imperative: "treat!", place: "treatment (verbal noun)", active: "one who treats", passive: "treated" }, rootNote: "Book 2 CSV row: To treat, cure. Form III verb; the fourth slot reuses the CSV masdar because there is no distinct common place noun for this pattern.", measure: "III" }, { includeQuranicMetadata: false }),
  draft({ root: "شكو", meaningEn: "complaining, suffering from", past: "اِشْتَكَى", present: "يَشْتَكِي", imperative: "اِشْتَكِ", place: "اِشْتِكَاء", active: "مُشْتَكٍ", passive: "مُشْتَكًى", transliterationBase: "ishtakā", transliterations: { past: "ishtakā", present: "yashtakī", imperative: "ishtaki", place_or_mim_masdar: "ishtikā'", active_participle: "mushtakin", passive_participle: "mushtakan" }, formMeanings: { past: "he complained", present: "he complains", imperative: "complain!", place: "complaint (verbal noun)", active: "complaining", passive: "complained of (rare, pattern-based)" }, rootNote: "Book 2 CSV row: To complain, suffer from. Form VIII defective verb; passive participle is context-dependent.", measure: "VIII" }, { includeQuranicMetadata: false }),
  draft({ root: "أمر", meaningEn: "commanding", past: "أَمَرَ", present: "يَأْمُرُ", imperative: "مُرْ", place: "مَأْمَر", active: "آمِر", passive: "مَأْمُور", transliterationBase: "amara", transliterations: { past: "amara", present: "ya'muru", imperative: "mur", place_or_mim_masdar: "ma'mar", active_participle: "āmir", passive_participle: "ma'mūr" }, formMeanings: { past: "he commanded", present: "he commands", imperative: "command!", place: "a command point or place (pattern-based)", active: "commander, one commanding", passive: "commanded, ordered" }, rootNote: "Book 2 CSV note: with بِـ. Form I hamzated verb; imperative is shortened to مُرْ.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "سقي", meaningEn: "giving drink, watering", past: "سَقَى", present: "يَسْقِي", imperative: "اِسْقِ", place: "مَسْقًى", active: "سَاقٍ", passive: "مَسْقِيّ", transliterationBase: "saqā", transliterations: { past: "saqā", present: "yasqī", imperative: "isqi", place_or_mim_masdar: "masqan", active_participle: "sāqin", passive_participle: "masqiyy" }, formMeanings: { past: "he gave drink", present: "he gives drink", imperative: "give drink!", place: "a watering place", active: "one who gives drink", passive: "watered, given drink" } }, { includeQuranicMetadata: false }),
  draft({ root: "فكر", meaningEn: "thinking", past: "فَكَّرَ", present: "يُفَكِّرُ", imperative: "فَكِّرْ", place: "تَفْكِير", active: "مُفَكِّر", passive: "مُفَكَّر", transliterationBase: "fakkara", transliterations: { past: "fakkara", present: "yufakkiru", imperative: "fakkir", place_or_mim_masdar: "tafkir", active_participle: "mufakkir", passive_participle: "mufakkar" }, formMeanings: { past: "he thought", present: "he thinks", imperative: "think!", place: "thinking (verbal noun)", active: "thinker", passive: "thought about (rare, pattern-based)" }, rootNote: "Book 2 CSV row: To think. Form II verb; the fourth slot reuses the CSV masdar.", measure: "II" }, { includeQuranicMetadata: false }),
  draft({ root: "شبه", meaningEn: "resembling", past: "تَشَابَهَ", present: "يَتَشَابَهُ", imperative: "تَشَابَهْ", place: "تَشَابُه", active: "مُتَشَابِه", passive: "مُتَشَابَه", transliterationBase: "tashābaha", transliterations: { past: "tashābaha", present: "yatashābahu", imperative: "tashābah", place_or_mim_masdar: "tashābuh", active_participle: "mutashābih", passive_participle: "mutashābah" }, formMeanings: { past: "he resembled", present: "he resembles", imperative: "resemble!", place: "resemblance (verbal noun)", active: "similar, resembling", passive: "made similar (rare, pattern-based)" }, rootNote: "Book 2 CSV row: To resemble. Form VI reciprocal/stative verb; passive participle is rarely useful standalone.", measure: "VI" }, { includeQuranicMetadata: false }),
  draft({ root: "خلف", meaningEn: "differing", past: "اِخْتَلَفَ", present: "يَخْتَلِفُ", imperative: "اِخْتَلِفْ", place: "اِخْتِلَاف", active: "مُخْتَلِف", passive: "مُخْتَلَف", transliterationBase: "ikhtalafa", transliterations: { past: "ikhtalafa", present: "yakhtalifu", imperative: "ikhtalif", place_or_mim_masdar: "ikhtilāf", active_participle: "mukhtalif", passive_participle: "mukhtalaf" }, formMeanings: { past: "he differed", present: "he differs", imperative: "differ!", place: "difference, disagreement", active: "different, differing", passive: "disagreed over" }, rootNote: "Book 2 CSV row: To differ. Form VIII verb; the fourth slot reuses the CSV masdar.", measure: "VIII" }, { includeQuranicMetadata: false }),
  draft({ root: "زيد", meaningEn: "increasing", past: "زَادَ", present: "يَزِيدُ", imperative: "زِدْ", place: "مَزِيد", active: "زَائِد", passive: "مَزِيد", transliterationBase: "zāda", transliterations: { past: "zāda", present: "yazīdu", imperative: "zid", place_or_mim_masdar: "mazīd", active_participle: "zā'id", passive_participle: "mazīd" }, formMeanings: { past: "he increased", present: "he increases", imperative: "increase!", place: "increase, addition", active: "extra, increasing", passive: "increased, added" }, rootNote: "Book 2 CSV row: To increase. Form I hollow verb; مَزِيد is lexicalized as increase/addition as well as a passive participle.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "نجح", meaningEn: "succeeding, passing", past: "نَجَحَ", present: "يَنْجَحُ", imperative: "اِنْجَحْ", place: "مَنْجَح", active: "نَاجِح", passive: "مَنْجُوح", transliterationBase: "najaḥa", transliterations: { past: "najaḥa", present: "yanjaḥu", imperative: "injaḥ", place_or_mim_masdar: "manjaḥ", active_participle: "nājiḥ", passive_participle: "manjūḥ" }, formMeanings: { past: "he succeeded", present: "he succeeds", imperative: "succeed!", place: "a place or point of success (pattern-based)", active: "successful", passive: "succeeded in (rare, pattern-based)" }, rootNote: "Book 2 CSV row: To pass, be successful. Intransitive; passive participle and place noun are pattern-based and should be reviewed.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "مرس", meaningEn: "practising, exercising", past: "مَارَسَ", present: "يُمَارِسُ", imperative: "مَارِسْ", place: "مُمَارَسَة", active: "مُمَارِس", passive: "مُمَارَس", transliterationBase: "mārasa", transliterations: { past: "mārasa", present: "yumārisu", imperative: "māris", place_or_mim_masdar: "mumārasah", active_participle: "mumāris", passive_participle: "mumāras" }, formMeanings: { past: "he practised", present: "he practises", imperative: "practise!", place: "practice (verbal noun)", active: "practising, practitioner", passive: "practised" }, rootNote: "Book 2 CSV row: To exercise, practice. Form III verb; the fourth slot reuses the CSV masdar.", measure: "III" }, { includeQuranicMetadata: false }),
  draft({ root: "نقص", meaningEn: "decreasing, lacking", past: "نَقَصَ", present: "يَنْقُصُ", imperative: "اُنْقُصْ", place: "مَنْقَص", active: "نَاقِص", passive: "مَنْقُوص", transliterationBase: "naqasa", transliterations: { past: "naqasa", present: "yanquṣu", imperative: "unquṣ", place_or_mim_masdar: "manqaṣ", active_participle: "nāqiṣ", passive_participle: "manqūṣ" }, formMeanings: { past: "it decreased", present: "it decreases", imperative: "decrease!", place: "a point of deficiency", active: "deficient, incomplete", passive: "reduced, deficient" } }, { includeQuranicMetadata: false }),
  draft({ root: "نول", meaningEn: "taking, consuming", past: "تَنَاوَلَ", present: "يَتَنَاوَلُ", imperative: "تَنَاوَلْ", place: "تَنَاوُل", active: "مُتَنَاوِل", passive: "مُتَنَاوَل", transliterationBase: "tanāwala", transliterations: { past: "tanāwala", present: "yatanāwalu", imperative: "tanāwal", place_or_mim_masdar: "tanāwul", active_participle: "mutanāwil", passive_participle: "mutanāwal" }, formMeanings: { past: "he took, consumed", present: "he takes, consumes", imperative: "take, consume!", place: "taking, consumption (verbal noun)", active: "one taking or consuming", passive: "taken, consumed" }, rootNote: "Book 2 CSV row: To consume. Form VI verb; the fourth slot reuses the CSV masdar.", measure: "VI" }, { includeQuranicMetadata: false }),
  draft({ root: "حدث", meaningEn: "happening, occurring", past: "حَدَثَ", present: "يَحْدُثُ", imperative: "اُحْدُثْ", place: "مَحْدَث", active: "حَادِث", passive: "مَحْدُوث", transliterationBase: "ḥadatha", transliterations: { past: "ḥadatha", present: "yaḥduthu", imperative: "uḥduth", place_or_mim_masdar: "maḥdath", active_participle: "ḥādith", passive_participle: "maḥdūth" }, formMeanings: { past: "it happened", present: "it happens", imperative: "happen! (rare)", place: "place or time of occurrence (pattern-based)", active: "happening, new", passive: "newly made; caused (rare)" }, rootNote: "Book 2 CSV row: To happen. Intransitive/stative in this meaning, so command and passive forms are awkward and context-dependent.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "عقد", meaningEn: "believing", past: "اِعْتَقَدَ", present: "يَعْتَقِدُ", imperative: "اِعْتَقِدْ", place: "اِعْتِقَاد", active: "مُعْتَقِد", passive: "مُعْتَقَد", transliterationBase: "iʿtaqada", transliterations: { past: "iʿtaqada", present: "yaʿtaqidu", imperative: "iʿtaqid", place_or_mim_masdar: "iʿtiqād", active_participle: "muʿtaqid", passive_participle: "muʿtaqad" }, formMeanings: { past: "he believed", present: "he believes", imperative: "believe!", place: "belief (verbal noun)", active: "believer, one holding a belief", passive: "believed, a belief" }, rootNote: "Book 2 CSV row: To believe. Form VIII verb; the fourth slot reuses the CSV masdar.", measure: "VIII" }, { includeQuranicMetadata: false }),
  draft({ root: "تبع", meaningEn: "following", past: "اِتَّبَعَ", present: "يَتَّبِعُ", imperative: "اِتَّبِعْ", place: "اِتِّبَاع", active: "مُتَّبِع", passive: "مُتَّبَع", transliterationBase: "ittabaʿa", transliterations: { past: "ittabaʿa", present: "yattabiʿu", imperative: "ittabiʿ", place_or_mim_masdar: "ittibāʿ", active_participle: "muttabiʿ", passive_participle: "muttabaʿ" }, formMeanings: { past: "he followed", present: "he follows", imperative: "follow!", place: "following (verbal noun)", active: "follower", passive: "followed" }, rootNote: "Book 2 CSV row: To follow. Form VIII verb with assimilation of ت to تّ; the fourth slot reuses the CSV masdar.", measure: "VIII" }, { includeQuranicMetadata: false }),
  draft({ root: "كفي", meaningEn: "sufficing, being enough", past: "كَفَى", present: "يَكْفِي", imperative: "اِكْفِ", place: "كِفَايَة", active: "كَافٍ", passive: "مَكْفِيّ", transliterationBase: "kafā", transliterations: { past: "kafā", present: "yakfī", imperative: "ikfi", place_or_mim_masdar: "kifāyah", active_participle: "kāfin", passive_participle: "makfiyy" }, formMeanings: { past: "it was enough", present: "it is enough", imperative: "be enough!", place: "sufficiency (verbal noun)", active: "sufficient", passive: "sufficed (rare, pattern-based)" }, rootNote: "Book 2 CSV row: To suffice, be enough. Intransitive/stative; passive participle is pattern-based and rare.", measure: "I" }, { includeQuranicMetadata: false }),
  draft({ root: "قدم", meaningEn: "progressing, advancing", past: "تَقَدَّمَ", present: "يَتَقَدَّمُ", imperative: "تَقَدَّمْ", place: "تَقَدُّم", active: "مُتَقَدِّم", passive: "مُتَقَدَّم", transliterationBase: "taqaddama", transliterations: { past: "taqaddama", present: "yataqaddamu", imperative: "taqaddam", place_or_mim_masdar: "taqaddum", active_participle: "mutaqaddim", passive_participle: "mutaqaddam" }, formMeanings: { past: "he progressed", present: "he progresses", imperative: "advance!", place: "progress, advancement", active: "advanced, progressing", passive: "advanced, put forward" }, rootNote: "Book 2 CSV row: To progress, improve, advance. Form V verb; the fourth slot reuses the CSV masdar.", measure: "V" }, { includeQuranicMetadata: false }),
  draft({ root: "ضغط", meaningEn: "pressing, pressurising", past: "ضَغَطَ", present: "يَضْغَطُ", imperative: "اِضْغَطْ", place: "مَضْغَط", active: "ضَاغِط", passive: "مَضْغُوط", transliterationBase: "ḍaghaṭa", transliterations: { past: "ḍaghaṭa", present: "yaḍghaṭu", imperative: "iḍghaṭ", place_or_mim_masdar: "maḍghaṭ", active_participle: "ḍāghiṭ", passive_participle: "maḍghūṭ" }, formMeanings: { past: "he pressed", present: "he presses", imperative: "press!", place: "a pressure point or press (pattern-based)", active: "pressing", passive: "pressed, stressed" } }, { includeQuranicMetadata: false }),
  draft({ root: "حذر", meaningEn: "warning", past: "حَذَّرَ", present: "يُحَذِّرُ", imperative: "حَذِّرْ", place: "تَحْذِير", active: "مُحَذِّر", passive: "مُحَذَّر", transliterationBase: "ḥadhdhara", transliterations: { past: "ḥadhdhara", present: "yuḥadhdhiru", imperative: "ḥadhdhir", place_or_mim_masdar: "taḥdhīr", active_participle: "muḥadhdhir", passive_participle: "muḥadhdhar" }, formMeanings: { past: "he warned", present: "he warns", imperative: "warn!", place: "warning (verbal noun)", active: "one warning", passive: "warned" }, rootNote: "Book 2 CSV note: with مِنْ. Form II verb; the fourth slot reuses the CSV masdar.", measure: "II" }, { includeQuranicMetadata: false }),
  draft({ root: "سرف", meaningEn: "wasting, being excessive", past: "أَسْرَفَ", present: "يُسْرِفُ", imperative: "أَسْرِفْ", place: "إِسْرَاف", active: "مُسْرِف", passive: "مُسْرَف", transliterationBase: "asrafa", transliterations: { past: "asrafa", present: "yusrifu", imperative: "asrif", place_or_mim_masdar: "isrāf", active_participle: "musrif", passive_participle: "musraf" }, formMeanings: { past: "he wasted, was excessive", present: "he wastes, is excessive", imperative: "be excessive! (usually negative)", place: "wastefulness, excess", active: "wasteful, excessive", passive: "wasted excessively (rare, pattern-based)" }, rootNote: "Book 2 CSV row: To waste. Form IV verb; imperative is grammatically valid but usually appears in prohibitions such as لا تُسْرِفْ.", measure: "IV" }, { includeQuranicMetadata: false }),
];

/**
 * Quranic root index expansion (see docs/ or the review artifact for provenance): hand-drafted,
 * fully-vocalized entries for roots verified as Quranic vocabulary by Fable (an Arabic-morphology
 * advisor model), added ahead of the CSV import so any matching CSV row dedupes against these
 * instead of the CSV's own unvocalized auto-generated forms.
 */
const quranicExpansionRoots: RootEntry[] = [
  draft({ root: "موت", meaningEn: "death, dying", past: "مَاتَ", present: "يَمُوتُ", imperative: "مُتْ", place: "مَمَاتٌ", active: "مَائِتٌ", passive: "مَيِّتٌ", transliterationBase: "māta", transliterations: { past: "māta", present: "yamūtu", imperative: "mut", place_or_mim_masdar: "mamāt", active_participle: "māʾit", passive_participle: "mayyit" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Hollow verb; imperative contracts to two consonants and is used rhetorically (عِشْ كَرِيمًا أَوْ مُتْ كَرِيمًا), not as a literal command.`, passive_participle: `${AI_DRAFT_NOTE} مَاتَ is intransitive, so there is no true passive participle; مَيِّتٌ (dead) is the common adjective (ṣifa mushabbaha) filling this slot instead of a fabricated template word.` }, formMeanings: { past: "he died", present: "he dies", imperative: "die! (rhetorical)", place: "death, dying", active: "dying, mortal", passive: "dead" }, rootNote: "Form I hollow verb.", measure: "I" }),
  draft({ root: "ربب", meaningEn: "lordship, nurturing", past: "رَبَّ", present: "يَرُبُّ", imperative: "رُبَّ", place: "رُبُوبِيَّةٌ", active: "رَابٌّ", passive: "مَرْبُوبٌ", transliterationBase: "rabba", transliterations: { past: "rabba", present: "yarubbu", imperative: "rubba", place_or_mim_masdar: "rubūbiyyah", active_participle: "rābb", passive_participle: "marbūb" }, formNotes: { place_or_mim_masdar: `${AI_DRAFT_NOTE} رُبُوبِيَّة is an abstract noun (lordship), not a regular mim-masdar; the root is known almost entirely through the noun رَبّ, and the Form-I verb itself is rare.`, imperative: `${AI_DRAFT_NOTE} Geminate imperative رُبَّ is a homograph of the common particle رُبَّ ("many a...").` }, formMeanings: { past: "he lorded over; raised, nurtured", present: "he raises, nurtures", imperative: "raise!, nurture!", place: "lordship", active: "one who nurtures, caretaker", passive: "lorded over; a creature under a lord" }, rootNote: "Form I geminate verb; this root is known almost entirely through the noun رَبّ (Lord).", measure: "I" }),
  draft({ root: "رجو", meaningEn: "hoping", past: "رَجَا", present: "يَرْجُو", imperative: "اُرْجُ", place: "رَجَاءٌ", active: "رَاجٍ", passive: "مَرْجُوٌّ", transliterationBase: "rajā", transliterations: { past: "rajā", present: "yarjū", imperative: "urju", place_or_mim_masdar: "rajāʾ", active_participle: "rājin", passive_participle: "marjūw" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Defective (wāw) verb; imperative drops the final radical, and hamzat waṣl takes ḍamma since the imperfect stem vowel is ḍamma.` }, formMeanings: { past: "he hoped", present: "he hopes", imperative: "hope!", place: "hope", active: "hopeful, one who hopes", passive: "hoped for" }, rootNote: "Form I defective (wāw) verb.", measure: "I" }),
  draft({ root: "توب", meaningEn: "turning back, repentance", past: "تَابَ", present: "يَتُوبُ", imperative: "تُبْ", place: "تَوْبَةٌ", active: "تَائِبٌ", passive: "مَتُوبٌ", transliterationBase: "tāba", transliterations: { past: "tāba", present: "yatūbu", imperative: "tub", place_or_mim_masdar: "tawbah", active_participle: "tāʾib", passive_participle: "matūb" }, formNotes: { passive_participle: `${AI_DRAFT_NOTE} مَتُوبٌ only occurs prepositionally (مَتُوبٌ عَلَيْهِ, "one whose repentance is accepted"), not as a standalone word.` }, formMeanings: { past: "he repented", present: "he repents", imperative: "repent!", place: "repentance", active: "repentant, penitent", passive: "forgiven (with عَلَيْهِ)" }, rootNote: "Form I hollow verb.", measure: "I" }),
  draft({ root: "جيء", meaningEn: "coming", past: "جَاءَ", present: "يَجِيءُ", imperative: "جِئْ", place: "مَجِيءٌ", active: "جَاءٍ", passive: "مَجِيءٌ", transliterationBase: "jāʾa", transliterations: { past: "jāʾa", present: "yajīʾu", imperative: "jiʾ", place_or_mim_masdar: "majīʾ", active_participle: "jāʾin", passive_participle: "majīʾ" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Hollow (yāʾ) + final-hamza verb; in real usage تَعَالَ or اِئْتِ usually replaces this imperative.`, active_participle: `${AI_DRAFT_NOTE} جَاءٍ is the classical answer but rare in texts; آتٍ (from أتى) is more commonly used for "coming".`, passive_participle: `${AI_DRAFT_NOTE} جَاءَ is intransitive, so there is no true passive participle; this slot reuses the masdar مَجِيء instead of a fabricated word.` }, formMeanings: { past: "he came", present: "he comes", imperative: "come!", place: "coming, arrival", active: "coming (rare; آتٍ preferred)", passive: "coming, arrival" }, rootNote: "Form I doubly weak (hollow yāʾ + final hamza) verb.", measure: "I" }),
  draft({ root: "يمم", meaningEn: "dry ablution; aiming for", past: "تَيَمَّمَ", present: "يَتَيَمَّمُ", imperative: "تَيَمَّمْ", place: "تَيَمُّمٌ", active: "مُتَيَمِّمٌ", passive: "مُتَيَمَّمٌ", transliterationBase: "tayammama", transliterations: { past: "tayammama", present: "yatayammamu", imperative: "tayammam", place_or_mim_masdar: "tayammum", active_participle: "mutayammim", passive_participle: "mutayammam" }, formNotes: { passive_participle: `${AI_DRAFT_NOTE} Used prepositionally (الصَّعِيدُ مُتَيَمَّمٌ بِهِ, "the earth [is what is] used for tayammum").` }, formMeanings: { past: "he performed dry ablution", present: "he performs dry ablution", imperative: "perform dry ablution!", place: "dry ablution; aiming for", active: "one performing dry ablution", passive: "used for tayammum" }, rootNote: "Form V verb; Form I of this root is not in practical use. Original sense is 'to aim at/intend' (Q2:267), narrowed in fiqh to the ritual dry ablution (Q4:43, Q5:6).", measure: "V" }),
  draft({ root: "نور", meaningEn: "light", past: "أَنَارَ", present: "يُنِيرُ", imperative: "أَنِرْ", place: "إِنَارَةٌ", active: "مُنِيرٌ", passive: "مُنَارٌ", transliterationBase: "anāra", transliterations: { past: "anāra", present: "yunīru", imperative: "anir", place_or_mim_masdar: "ināra", active_participle: "munīr", passive_participle: "manār" }, formMeanings: { past: "he/it illuminated", present: "he/it illuminates", imperative: "illuminate!", place: "illumination, lighting", active: "illuminating, radiant", passive: "illuminated, lit" }, rootNote: "Form IV verb. This root is nominal in the Quran (نُور، نَار); the verb أَنَارَ itself doesn't occur there, though its active participle مُنِير does (سِرَاجٌ مُنِيرٌ, Q33:46).", measure: "IV" }),
  // Quranic root index expansion, part 2 (Section-C coverage-gap roots verified with Fable).
  draft({ root: "شيء", meaningEn: "will, wanting", past: "شَاءَ", present: "يَشَاءُ", imperative: "شَأْ", place: "مَشِيئَةٌ", active: "شَائِئٌ", passive: "مَشِيءٌ", transliterationBase: "shāʾa", transliterations: { past: "shāʾa", present: "yashāʾu", imperative: "shaʾ", place_or_mim_masdar: "mashīʾah", active_participle: "shāʾiʾ", passive_participle: "mashīʾ" }, formNotes: { imperative: `${AI_DRAFT_NOTE} "Will!" is a semantically odd command and is essentially never used imperatively; derived for structural completeness only.`, active_participle: `${AI_DRAFT_NOTE} Not naturally attested; real usage overwhelmingly prefers the finite verb شَاءَ/يَشَاءُ.`, passive_participle: `${AI_DRAFT_NOTE} Rare, grammar-book form.` }, formMeanings: { past: "he willed, wished, wanted", present: "he wills", imperative: "will!, wish! (rare)", place: "will, wish, volition", active: "one who wills (rare, pattern-based)", passive: "willed, decreed (rare)" }, rootNote: "Form I hollow (medial ي) + final-hamza verb.", measure: "I" }),
  draft({ root: "وقي", meaningEn: "guarding; God-consciousness", past: "اِتَّقَى", present: "يَتَّقِي", imperative: "اِتَّقِ", place: "تَقْوَى", active: "مُتَّقٍ", passive: "مُتَّقًى", transliterationBase: "ittaqā", transliterations: { past: "ittaqā", present: "yattaqī", imperative: "ittaqi", place_or_mim_masdar: "taqwā", active_participle: "muttaqin", passive_participle: "muttaqan" }, formNotes: { place_or_mim_masdar: `${AI_DRAFT_NOTE} تَقْوَى is a suppletive masdar; the regular Form VIII masdar would be اِتِّقَاءٌ.`, passive_participle: `${AI_DRAFT_NOTE} Rare, and only occurs prepositionally.` }, formMeanings: { past: "he was mindful of God, guarded himself (against)", present: "he is mindful of God, guards himself", imperative: "be mindful (of God)!, guard yourself!", place: "God-consciousness, piety", active: "God-conscious, pious", passive: "guarded against (rare)" }, rootNote: "Form VIII verb; root-initial و assimilates to ت (اوتقى → اتَّقَى).", measure: "VIII" }),
  draft({ root: "عذب", meaningEn: "punishment, torment", past: "عَذَّبَ", present: "يُعَذِّبُ", imperative: "عَذِّبْ", place: "تَعْذِيبٌ", active: "مُعَذِّبٌ", passive: "مُعَذَّبٌ", transliterationBase: "ʿadhdhaba", transliterations: { past: "ʿadhdhaba", present: "yuʿadhdhibu", imperative: "ʿadhdhib", place_or_mim_masdar: "taʿdhīb", active_participle: "muʿadhdhib", passive_participle: "muʿadhdhab" }, formNotes: { place_or_mim_masdar: `${AI_DRAFT_NOTE} The dominant Quranic noun for punishment is عَذَاب (a separate ism-masdar), not this regular Form-II masdar.` }, formMeanings: { past: "he punished, tormented", present: "he punishes", imperative: "punish!", place: "punishing, torment", active: "one who punishes", passive: "punished, tormented" }, rootNote: "Form II verb, sound root.", measure: "II" }),
  draft({ root: "سمو", meaningEn: "loftiness, rising high", past: "سَمَا", present: "يَسْمُو", imperative: "اُسْمُ", place: "سُمُوٌّ", active: "سَامٍ", passive: "مَسْمُوٌّ", transliterationBase: "samā", transliterations: { past: "samā", present: "yasmū", imperative: "usmu", place_or_mim_masdar: "sumūw", active_participle: "sāmin", passive_participle: "masmūw" }, formNotes: { passive_participle: `${AI_DRAFT_NOTE} سَمَا is intransitive, so a standalone passive participle is pattern-based and rarely used.` }, formMeanings: { past: "he rose high, was exalted", present: "he rises high, is exalted", imperative: "rise high!, be exalted!", place: "loftiness, elevation", active: "lofty, exalted", passive: "risen to (rare, pattern-based)" }, rootNote: "Form I defective (wāw) verb. This root's Quranic footprint is almost entirely nominal (سَمَاء, sky); the finite verb itself is not frequent there.", measure: "I" }),
  draft({ root: "مثل", meaningEn: "likeness, parable", past: "مَثَّلَ", present: "يُمَثِّلُ", imperative: "مَثِّلْ", place: "تَمْثِيلٌ", active: "مُمَثِّلٌ", passive: "مُمَثَّلٌ", transliterationBase: "maththala", transliterations: { past: "maththala", present: "yumaththilu", imperative: "maththil", place_or_mim_masdar: "tamthīl", active_participle: "mumaththil", passive_participle: "mumaththal" }, formMeanings: { past: "he likened, depicted, compared", present: "he likens, depicts", imperative: "liken!, illustrate!", place: "representation, depiction", active: "one who depicts/represents", passive: "depicted, represented" }, rootNote: "Form II verb, sound root. The dominant Quranic noun of this root is مَثَل/أَمْثَال (parable/parables); the idiomatic Quranic pairing is ضَرَبَ مَثَلًا ('to strike a parable') rather than this plain verb.", measure: "II" }),
  draft({ root: "نبأ", meaningEn: "news, informing", past: "نَبَّأَ", present: "يُنَبِّئُ", imperative: "نَبِّئْ", place: "تَنْبِئَةٌ", active: "مُنَبِّئٌ", passive: "مُنَبَّأٌ", transliterationBase: "nabbaʾa", transliterations: { past: "nabbaʾa", present: "yunabbiʾu", imperative: "nabbiʾ", place_or_mim_masdar: "tanbiʾah", active_participle: "munabbiʾ", passive_participle: "munabbaʾ" }, formNotes: { place_or_mim_masdar: `${AI_DRAFT_NOTE} The more idiomatic Quranic noun is نَبَأ (news, tidings), not this regular Form-II masdar.` }, formMeanings: { past: "he informed, told (someone)", present: "he informs", imperative: "inform!, tell!", place: "informing; news, tidings", active: "one who informs", passive: "informed, told" }, rootNote: "Form II verb, final-hamza root.", measure: "II" }),
  draft({ root: "دنو", meaningEn: "nearness, drawing near", past: "دَنَا", present: "يَدْنُو", imperative: "اُدْنُ", place: "دُنُوٌّ", active: "دَانٍ", passive: "مَدْنُوٌّ", transliterationBase: "danā", transliterations: { past: "danā", present: "yadnū", imperative: "udnu", place_or_mim_masdar: "dunūw", active_participle: "dānin", passive_participle: "madnūw" }, formNotes: { passive_participle: `${AI_DRAFT_NOTE} دَنَا is intransitive, so a standalone passive participle is pattern-based and rarely used.` }, formMeanings: { past: "he drew near, approached", present: "he draws near", imperative: "draw near!, approach!", place: "nearness, drawing near", active: "near, close", passive: "approached (rare, pattern-based)" }, rootNote: "Form I defective (wāw) verb. The Quranic noun for 'this world' (الدُّنْيَا, elative of this root) derives from it.", measure: "I" }),
  draft({ root: "نذر", meaningEn: "warning", past: "أَنْذَرَ", present: "يُنْذِرُ", imperative: "أَنْذِرْ", place: "إِنْذَارٌ", active: "مُنْذِرٌ", passive: "مُنْذَرٌ", transliterationBase: "andhara", transliterations: { past: "andhara", present: "yundhiru", imperative: "andhir", place_or_mim_masdar: "indhār", active_participle: "mundhir", passive_participle: "mundhar" }, formMeanings: { past: "he warned", present: "he warns", imperative: "warn!", place: "warning", active: "warner", passive: "warned" }, rootNote: "Form IV verb, sound root; directly Quranic (Q26:214). نَذِير (warner) and نَذْر (votive vow) are related nouns of this root.", measure: "IV" }),
  draft({ root: "عظم", meaningEn: "greatness", past: "عَظُمَ", present: "يَعْظُمُ", imperative: "اُعْظُمْ", place: "عَظَمَةٌ", active: "عَظِيمٌ", passive: "مَعْظُومٌ", transliterationBase: "ʿaẓuma", transliterations: { past: "ʿaẓuma", present: "yaʿẓumu", imperative: "uʿẓum", place_or_mim_masdar: "ʿaẓamah", active_participle: "ʿaẓīm", passive_participle: "maʿẓūm" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Stative (فَعُلَ-pattern) verb; "become great!" is rarely a real command.`, active_participle: `${AI_DRAFT_NOTE} The true فَاعِل-pattern participle (عَاظِم) is not idiomatic; the adjective عَظِيم (a فَعِيل pattern) fills this role in real usage.`, passive_participle: `${AI_DRAFT_NOTE} Not naturally in use; verb is intransitive/stative.` }, formMeanings: { past: "he/it became great, mighty", present: "he/it becomes great", imperative: "become great! (rare)", place: "greatness, majesty", active: "great, mighty", passive: "regarded as great (rare, pattern-based)" }, rootNote: "Form I stative verb, sound root.", measure: "I" }),
  draft({ root: "بشر", meaningEn: "glad tidings, human being", past: "بَشَّرَ", present: "يُبَشِّرُ", imperative: "بَشِّرْ", place: "بُشْرَى", active: "مُبَشِّرٌ", passive: "مُبَشَّرٌ", transliterationBase: "bashshara", transliterations: { past: "bashshara", present: "yubashshiru", imperative: "bashshir", place_or_mim_masdar: "bushrā", active_participle: "mubashshir", passive_participle: "mubashshar" }, formMeanings: { past: "he gave glad tidings, announced good news", present: "he gives glad tidings", imperative: "give glad tidings!", place: "glad tidings", active: "bringer of glad tidings", passive: "given glad tidings" }, rootNote: "Form II verb, sound root; directly Quranic (Q9:112). بَشَر (human being) is a separate common noun of this root.", measure: "II" }),
  draft({ root: "عزز", meaningEn: "might, honor", past: "عَزَّ", present: "يَعِزُّ", imperative: "عِزَّ", place: "عِزَّةٌ", active: "عَزِيزٌ", passive: "مَعْزُوزٌ", transliterationBase: "ʿazza", transliterations: { past: "ʿazza", present: "yaʿizzu", imperative: "ʿizza", place_or_mim_masdar: "ʿizzah", active_participle: "ʿazīz", passive_participle: "maʿzūz" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Contracted geminate imperative; grammatically regular but rarely a real command.`, active_participle: `${AI_DRAFT_NOTE} The true فَاعِل-pattern participle (عَازّ) is not idiomatic; the adjective عَزِيز (a فَعِيل pattern) fills this role in real usage.` }, formMeanings: { past: "he/it was/became mighty, dear", present: "he/it is/becomes mighty", imperative: "be mighty!, prevail! (rare)", place: "might, honor, glory", active: "mighty, dear", passive: "strengthened, made mighty (rare)" }, rootNote: "Form I geminate verb, intransitive sense ('to be mighty'); a separate transitive/u-type sense ('to overpower') also exists classically.", measure: "I" }),
  draft({ root: "أذن", meaningEn: "permission", past: "أَذِنَ", present: "يَأْذَنُ", imperative: "اِئْذَنْ", place: "إِذْنٌ", active: "آذِنٌ", passive: "مَأْذُونٌ", transliterationBase: "adhina", transliterations: { past: "adhina", present: "yaʾdhanu", imperative: "iʾdhan", place_or_mim_masdar: "idhn", active_participle: "āʾidhin", passive_participle: "maʾdhūn" }, formMeanings: { past: "he permitted, gave permission", present: "he permits", imperative: "permit!, give permission!", place: "permission", active: "one who permits", passive: "permitted, authorized" }, rootNote: "Form I hamza-initial verb; not one of the three exceptional roots (أخذ/أكل/أمر) that drop the hamza, so the imperfect is a-type and the imperative takes the regular hamzat-waṣl pattern (hamza seated on yāʾ): اِئْذَنْ.", measure: "I" }),
  draft({ root: "دين", meaningEn: "religion; debt", past: "دَانَ", present: "يَدِينُ", imperative: "دِنْ", place: "دِينٌ", active: "دَائِنٌ", passive: "مَدِينٌ", transliterationBase: "dāna", transliterations: { past: "dāna", present: "yadīnu", imperative: "din", place_or_mim_masdar: "dīn", active_participle: "dāʾin", passive_participle: "madīn" }, formMeanings: { past: "he was indebted; adhered to (a religion/creed)", present: "he is indebted; adheres to (a religion)", imperative: "adhere (to)!, be indebted!", place: "religion; judgment; debt", active: "creditor; one who adheres (to a religion)", passive: "indebted, in debt" }, rootNote: "Form I hollow verb. The specific finite verb form for the commercial/debt sense that appears in the Quran is Form VI تَدَايَنتُم (Q2:282, reciprocal, 'when you transact on credit'); Form I is chosen here as the more beginner-friendly base verb.", measure: "I" }),
  draft({ root: "وحي", meaningEn: "revelation", past: "أَوْحَى", present: "يُوحِي", imperative: "أَوْحِ", place: "وَحْيٌ", active: "مُوحٍ", passive: "مُوحًى", transliterationBase: "awḥā", transliterations: { past: "awḥā", present: "yūḥī", imperative: "awḥi", place_or_mim_masdar: "waḥy", active_participle: "mūḥin", passive_participle: "mūḥan" }, formMeanings: { past: "he revealed, inspired", present: "he reveals, inspires", imperative: "reveal!, inspire!", place: "revelation", active: "one who reveals/inspires", passive: "revealed, inspired" }, rootNote: "Form IV verb; root-initial و is retained (أَفْعَلَ → أَوْحَى, cf. أَوْجَبَ), and the defective final radical drops in the imperative (أَوْحِ, parallel to أَعْطِ).", measure: "IV" }),
  draft({ root: "وكل", meaningEn: "trust, reliance", past: "تَوَكَّلَ", present: "يَتَوَكَّلُ", imperative: "تَوَكَّلْ", place: "تَوَكُّلٌ", active: "مُتَوَكِّلٌ", passive: "مُتَوَكَّلٌ", transliterationBase: "tawakkala", transliterations: { past: "tawakkala", present: "yatawakkalu", imperative: "tawakkal", place_or_mim_masdar: "tawakkul", active_participle: "mutawakkil", passive_participle: "mutawakkal" }, formNotes: { passive_participle: `${AI_DRAFT_NOTE} تَوَكَّلَ is reflexive/intransitive, so a standalone passive participle is pattern-based and rarely used.` }, formMeanings: { past: "he placed his trust (in Allah), relied (upon)", present: "he places his trust, relies", imperative: "place your trust!, rely!", place: "trust, reliance (upon Allah)", active: "one who trusts/relies (upon Allah)", passive: "trusted in (rare, pattern-based)" }, rootNote: "Form V verb; root-initial و is retained (no assimilation). Extremely Quranic and devotionally central (Q3:159, Q65:3). Form I وَكَلَ ('to entrust to someone') is a plausible alternate primary sense.", measure: "V" }),
  draft({ root: "تلو", meaningEn: "reciting, following", past: "تَلَا", present: "يَتْلُو", imperative: "اُتْلُ", place: "تِلَاوَةٌ", active: "تَالٍ", passive: "مَتْلُوٌّ", transliterationBase: "talā", transliterations: { past: "talā", present: "yatlū", imperative: "utlu", place_or_mim_masdar: "tilāwah", active_participle: "tālin", passive_participle: "matlūw" }, formMeanings: { past: "he recited, followed (in reading)", present: "he recites", imperative: "recite!", place: "recitation", active: "reciter, one who recites", passive: "recited" }, rootNote: "Form I defective (wāw) verb; directly Quranic (Q18:27, Q29:45 وَاتْلُ).", measure: "I" }),
  draft({ root: "زكو", meaningEn: "purification, alms", past: "زَكَّى", present: "يُزَكِّي", imperative: "زَكِّ", place: "تَزْكِيَةٌ", active: "مُزَكٍّ", passive: "مُزَكًّى", transliterationBase: "zakkā", transliterations: { past: "zakkā", present: "yuzakkī", imperative: "zakki", place_or_mim_masdar: "tazkiyah", active_participle: "muzakkin", passive_participle: "muzakkan" }, formMeanings: { past: "he purified, caused to grow (spiritually)", present: "he purifies", imperative: "purify!", place: "purification", active: "one who purifies", passive: "purified" }, rootNote: "Form II defective (wāw→ى) verb. زَكَاة (the pillar of obligatory alms) is a separate, irregular ism of this root, not the regular masdar shown here. Form V تَزَكَّى ('to purify oneself', Q87:14) is an equally Quranic reflexive alternate.", measure: "II" }),
  draft({ root: "فلح", meaningEn: "success, prosperity", past: "أَفْلَحَ", present: "يُفْلِحُ", imperative: "أَفْلِحْ", place: "إِفْلَاحٌ", active: "مُفْلِحٌ", passive: "مُفْلَحٌ", transliterationBase: "aflaḥa", transliterations: { past: "aflaḥa", present: "yufliḥu", imperative: "aflih", place_or_mim_masdar: "iflāḥ", active_participle: "muflih", passive_participle: "muflaḥ" }, formNotes: { passive_participle: `${AI_DRAFT_NOTE} أَفْلَحَ is intransitive, so a standalone passive participle is pattern-based and rarely used.` }, formMeanings: { past: "he succeeded, prospered", present: "he succeeds, prospers", imperative: "succeed!, prosper!", place: "succeeding, prospering", active: "successful, prosperous", passive: "prospered in (rare, pattern-based)" }, rootNote: "Form IV verb, sound root; directly Quranic (Q23:1 قَدْ أَفْلَحَ الْمُؤْمِنُونَ). فَلَاح (success) is a related ism, not this exact masdar pattern.", measure: "IV" }),
];

/**
 * Seed dataset. Edit this file to add or correct roots.
 * Every entry must pass validateRootEntry (run `npm test` after editing).
 *
 * Spelling rule: Form-I imperatives use hamzat waṣl (اِ / اُ), never hamzat qaṭʿ (أ / إ).
 */
const baseRoots: RootEntry[] = [
  {
    root: "سمع",
    displayRoot: "س م ع",
    meaningEn: "hearing, listening",
    status: "reviewed",
    measure: "I",
    quranic: true,
    updatedAt: "2026-07-03",
    forms: [
      {
        order: 1,
        key: "past",
        ...label("past"),
        arabic: "سَمِعَ",
        transliteration: "samiʿa",
        meaningEn: "he heard / to hear",
        exampleAr: "سَمِعَ الطَّالِبُ الصَّوْتَ.",
        exampleEn: "The student heard the sound.",
      },
      {
        order: 2,
        key: "present",
        ...label("present"),
        arabic: "يَسْمَعُ",
        transliteration: "yasmaʿu",
        meaningEn: "he hears / is hearing",
        exampleAr: "يَسْمَعُ الوَلَدُ القُرآنَ.",
        exampleEn: "The boy hears the Qur'an.",
      },
      {
        order: 3,
        key: "imperative",
        ...label("imperative"),
        arabic: "اِسْمَعْ",
        transliteration: "ismaʿ",
        meaningEn: "listen! / hear!",
        exampleAr: "اِسْمَعْ جَيِّدًا.",
        exampleEn: "Listen carefully.",
      },
      {
        order: 4,
        key: "place_or_mim_masdar",
        ...label("place_or_mim_masdar"),
        arabic: "مَسْمَع",
        transliteration: "masmaʿ",
        meaningEn: "hearing; earshot; place of hearing",
        exampleAr: "تَكَلَّمَ عَلَى مَسْمَعٍ مِنَ النَّاسِ.",
        exampleEn: "He spoke within people's hearing.",
      },
      {
        order: 5,
        key: "active_participle",
        ...label("active_participle"),
        arabic: "سَامِع",
        transliteration: "sāmiʿ",
        meaningEn: "listener / one who hears",
        exampleAr: "السَّامِعُ يَفْهَمُ الكَلَامَ.",
        exampleEn: "The listener understands the speech.",
      },
      {
        order: 6,
        key: "passive_participle",
        ...label("passive_participle"),
        arabic: "مَسْمُوع",
        transliteration: "masmūʿ",
        meaningEn: "heard / audible",
        exampleAr: "الصَّوْتُ مَسْمُوعٌ.",
        exampleEn: "The sound is audible.",
      },
    ],
  },
  {
    root: "كتب",
    displayRoot: "ك ت ب",
    meaningEn: "writing",
    status: "reviewed",
    measure: "I",
    quranic: true,
    updatedAt: "2026-07-03",
    forms: [
      {
        order: 1,
        key: "past",
        ...label("past"),
        arabic: "كَتَبَ",
        transliteration: "kataba",
        meaningEn: "he wrote / to write",
        exampleAr: "كَتَبَ الطَّالِبُ الدَّرْسَ.",
        exampleEn: "The student wrote the lesson.",
      },
      {
        order: 2,
        key: "present",
        ...label("present"),
        arabic: "يَكْتُبُ",
        transliteration: "yaktubu",
        meaningEn: "he writes / is writing",
        exampleAr: "يَكْتُبُ الوَلَدُ رِسَالَةً.",
        exampleEn: "The boy writes a letter.",
      },
      {
        order: 3,
        key: "imperative",
        ...label("imperative"),
        arabic: "اُكْتُبْ",
        transliteration: "uktub",
        meaningEn: "write!",
        exampleAr: "اُكْتُبِ اسْمَكَ.",
        exampleEn: "Write your name.",
      },
      {
        order: 4,
        key: "place_or_mim_masdar",
        ...label("place_or_mim_masdar"),
        arabic: "مَكْتَب",
        transliteration: "maktab",
        meaningEn: "office / desk",
        exampleAr: "الكِتَابُ عَلَى المَكْتَبِ.",
        exampleEn: "The book is on the desk.",
      },
      {
        order: 5,
        key: "active_participle",
        ...label("active_participle"),
        arabic: "كَاتِب",
        transliteration: "kātib",
        meaningEn: "writer",
        exampleAr: "الكَاتِبُ يَكْتُبُ قِصَّةً.",
        exampleEn: "The writer writes a story.",
      },
      {
        order: 6,
        key: "passive_participle",
        ...label("passive_participle"),
        arabic: "مَكْتُوب",
        transliteration: "maktūb",
        meaningEn: "written; letter (as a noun)",
        exampleAr: "الاسْمُ مَكْتُوبٌ عَلَى البَابِ.",
        exampleEn: "The name is written on the door.",
      },
    ],
  },
  {
    root: "فتح",
    displayRoot: "ف ت ح",
    meaningEn: "opening",
    status: "reviewed",
    measure: "I",
    quranic: true,
    updatedAt: "2026-07-03",
    forms: [
      {
        order: 1,
        key: "past",
        ...label("past"),
        arabic: "فَتَحَ",
        transliteration: "fataḥa",
        meaningEn: "he opened / to open",
        exampleAr: "فَتَحَ المُعَلِّمُ البَابَ.",
        exampleEn: "The teacher opened the door.",
      },
      {
        order: 2,
        key: "present",
        ...label("present"),
        arabic: "يَفْتَحُ",
        transliteration: "yaftaḥu",
        meaningEn: "he opens / is opening",
        exampleAr: "يَفْتَحُ الوَلَدُ الكِتَابَ.",
        exampleEn: "The boy opens the book.",
      },
      {
        order: 3,
        key: "imperative",
        ...label("imperative"),
        arabic: "اِفْتَحْ",
        transliteration: "iftaḥ",
        meaningEn: "open!",
        exampleAr: "اِفْتَحِ النَّافِذَةَ.",
        exampleEn: "Open the window.",
      },
      {
        order: 4,
        key: "place_or_mim_masdar",
        ...label("place_or_mim_masdar"),
        arabic: "مَفْتَح",
        transliteration: "maftaḥ",
        meaningEn: "place of opening",
        exampleAr: "هٰذَا مَفْتَحُ الخِزَانَةِ.",
        exampleEn: "This is the opening-place of the cabinet.",
        notes:
          "Place-noun sense of فتح is rare on its own; 'مفتاح' (key) is the far more common related word but is an instrument noun, not this pattern. Needs scholarly review.",
      },
      {
        order: 5,
        key: "active_participle",
        ...label("active_participle"),
        arabic: "فَاتِح",
        transliteration: "fātiḥ",
        meaningEn: "opener; conqueror",
        exampleAr: "هُوَ فَاتِحُ البَابِ.",
        exampleEn: "He is the one who opened the door.",
      },
      {
        order: 6,
        key: "passive_participle",
        ...label("passive_participle"),
        arabic: "مَفْتُوح",
        transliteration: "maftūḥ",
        meaningEn: "open / opened",
        exampleAr: "البَابُ مَفْتُوحٌ.",
        exampleEn: "The door is open.",
      },
    ],
  },
  {
    root: "علم",
    displayRoot: "ع ل م",
    meaningEn: "knowing",
    status: "reviewed",
    measure: "I",
    quranic: true,
    updatedAt: "2026-07-03",
    forms: [
      {
        order: 1,
        key: "past",
        ...label("past"),
        arabic: "عَلِمَ",
        transliteration: "ʿalima",
        meaningEn: "he knew / to know",
        exampleAr: "عَلِمَ الطَّالِبُ الجَوَابَ.",
        exampleEn: "The student knew the answer.",
      },
      {
        order: 2,
        key: "present",
        ...label("present"),
        arabic: "يَعْلَمُ",
        transliteration: "yaʿlamu",
        meaningEn: "he knows / is knowing",
        exampleAr: "يَعْلَمُ المُعَلِّمُ الحَقِيقَةَ.",
        exampleEn: "The teacher knows the truth.",
      },
      {
        order: 3,
        key: "imperative",
        ...label("imperative"),
        arabic: "اِعْلَمْ",
        transliteration: "iʿlam",
        meaningEn: "know!",
        exampleAr: "اِعْلَمْ أَنَّ العِلْمَ نُورٌ.",
        exampleEn: "Know that knowledge is light.",
      },
      {
        order: 4,
        key: "place_or_mim_masdar",
        ...label("place_or_mim_masdar"),
        arabic: "مَعْلَم",
        transliteration: "maʿlam",
        meaningEn: "landmark; sign; distinguishing feature",
        exampleAr: "هٰذَا البُرْجُ مَعْلَمٌ مَشْهُورٌ.",
        exampleEn: "This tower is a famous landmark.",
      },
      {
        order: 5,
        key: "active_participle",
        ...label("active_participle"),
        arabic: "عَالِم",
        transliteration: "ʿālim",
        meaningEn: "knower; scholar",
        exampleAr: "العَالِمُ يُعَلِّمُ النَّاسَ.",
        exampleEn: "The scholar teaches the people.",
      },
      {
        order: 6,
        key: "passive_participle",
        ...label("passive_participle"),
        arabic: "مَعْلُوم",
        transliteration: "maʿlūm",
        meaningEn: "known",
        exampleAr: "هٰذَا الأَمْرُ مَعْلُومٌ.",
        exampleEn: "This matter is known.",
      },
    ],
  },
  {
    root: "دخل",
    displayRoot: "د خ ل",
    meaningEn: "entering",
    status: "reviewed",
    measure: "I",
    quranic: true,
    updatedAt: "2026-07-03",
    forms: [
      {
        order: 1,
        key: "past",
        ...label("past"),
        arabic: "دَخَلَ",
        transliteration: "dakhala",
        meaningEn: "he entered / to enter",
        exampleAr: "دَخَلَ الطَّالِبُ الفَصْلَ.",
        exampleEn: "The student entered the classroom.",
      },
      {
        order: 2,
        key: "present",
        ...label("present"),
        arabic: "يَدْخُلُ",
        transliteration: "yadkhulu",
        meaningEn: "he enters / is entering",
        exampleAr: "يَدْخُلُ الوَلَدُ البَيْتَ.",
        exampleEn: "The boy enters the house.",
      },
      {
        order: 3,
        key: "imperative",
        ...label("imperative"),
        arabic: "اُدْخُلْ",
        transliteration: "udkhul",
        meaningEn: "enter!",
        exampleAr: "اُدْخُلِ الغُرْفَةَ.",
        exampleEn: "Enter the room.",
      },
      {
        order: 4,
        key: "place_or_mim_masdar",
        ...label("place_or_mim_masdar"),
        arabic: "مَدْخَل",
        transliteration: "madkhal",
        meaningEn: "entrance",
        exampleAr: "وَقَفَ عِنْدَ المَدْخَلِ.",
        exampleEn: "He stood at the entrance.",
      },
      {
        order: 5,
        key: "active_participle",
        ...label("active_participle"),
        arabic: "دَاخِل",
        transliteration: "dākhil",
        meaningEn: "one entering; inside",
        exampleAr: "هُوَ دَاخِلُ البَيْتِ.",
        exampleEn: "He is inside the house.",
      },
      {
        order: 6,
        key: "passive_participle",
        ...label("passive_participle"),
        arabic: "مَدْخُول",
        transliteration: "madkhūl",
        meaningEn: "entered",
        exampleAr: "هٰذَا المَكَانُ مَدْخُولٌ.",
        exampleEn: "This place has been entered.",
        notes:
          "مدخول is rarely used as a standalone passive participle in this literal sense; more often encountered in idiomatic/colloquial usage. Needs review.",
      },
    ],
  },
  {
    root: "خرج",
    displayRoot: "خ ر ج",
    meaningEn: "exiting, going out",
    status: "reviewed",
    measure: "I",
    quranic: true,
    updatedAt: "2026-07-03",
    forms: [
      {
        order: 1,
        key: "past",
        ...label("past"),
        arabic: "خَرَجَ",
        transliteration: "kharaja",
        meaningEn: "he went out / to exit",
        exampleAr: "خَرَجَ الوَلَدُ مِنَ البَيْتِ.",
        exampleEn: "The boy went out of the house.",
      },
      {
        order: 2,
        key: "present",
        ...label("present"),
        arabic: "يَخْرُجُ",
        transliteration: "yakhruju",
        meaningEn: "he goes out / is exiting",
        exampleAr: "يَخْرُجُ الطُّلَّابُ مِنَ المَدْرَسَةِ.",
        exampleEn: "The students go out of the school.",
      },
      {
        order: 3,
        key: "imperative",
        ...label("imperative"),
        arabic: "اُخْرُجْ",
        transliteration: "ukhruj",
        meaningEn: "go out!",
        exampleAr: "اُخْرُجْ مِنَ الغُرْفَةِ.",
        exampleEn: "Go out of the room.",
      },
      {
        order: 4,
        key: "place_or_mim_masdar",
        ...label("place_or_mim_masdar"),
        arabic: "مَخْرَج",
        transliteration: "makhraj",
        meaningEn: "exit; place of articulation",
        exampleAr: "هٰذَا مَخْرَجُ الطَّوَارِئِ.",
        exampleEn: "This is the emergency exit.",
      },
      {
        order: 5,
        key: "active_participle",
        ...label("active_participle"),
        arabic: "خَارِج",
        transliteration: "khārij",
        meaningEn: "one going out; outside",
        exampleAr: "هُوَ خَارِجُ المَنْزِلِ.",
        exampleEn: "He is outside the house.",
      },
      {
        order: 6,
        key: "passive_participle",
        ...label("passive_participle"),
        arabic: "مَخْرُوج",
        transliteration: "makhrūj",
        meaningEn: "exited / made to exit",
        exampleAr: "الأَمْرُ مَخْرُوجٌ مِنْهُ.",
        exampleEn: "The matter has been exited / departed from it.",
        notes:
          "مخروج is rarely used as a standalone passive participle; the example sentence here is artificial and needs review.",
      },
    ],
  },
  ...aiDraftRoots,
  ...quranicExpansionRoots,
];

const importedArabicVerbBuild = attachImportedArabicVerbRows(
  baseRoots,
  parseImportedArabicVerbCsv(sarfmateArabicVerbsCsv),
);

/**
 * Additional senses of a root that already has its own primary RootEntry (from baseRoots or
 * the CSV import) — verified as distinct, genuinely Quranic senses by Fable. Attached as
 * variants after the CSV import runs, since the primary entry for a given root may itself be
 * CSV-generated.
 */
const EXTRA_VARIANTS: Record<string, RootVerbEntry[]> = {
  أمن: [
    draftVariant(
      { root: "أمن_believe", meaningEn: "believing", past: "آمَنَ", present: "يُؤْمِنُ", imperative: "آمِنْ", place: "إِيمَانٌ", active: "مُؤْمِنٌ", passive: "مُؤْمَنٌ", transliterationBase: "āmana", transliterations: { past: "āmana", present: "yuʾminu", imperative: "āmin", place_or_mim_masdar: "īmān", active_participle: "muʾmin", passive_participle: "muʾman" }, formNotes: { passive_participle: `${AI_DRAFT_NOTE} Rare, and only occurs prepositionally (مُؤْمَنٌ بِهِ, "believed in").` }, formMeanings: { past: "he believed", present: "he believes", imperative: "believe!", place: "faith, belief", active: "believer", passive: "believed in (with بِ)" }, rootNote: "Form IV verb; the Quranic primary sense of this root (آمَنَ, 'to believe') is distinct from the Form-I sense 'to be safe' already in this root's main entry.", measure: "IV" },
      "أمن-quranic-believe",
    ),
  ],
  حيي: [
    draftVariant(
      { root: "حيي_life", meaningEn: "life, living", past: "حَيِيَ", present: "يَحْيَا", imperative: "اِحْيَ", place: "حَيَاةٌ", active: "حَيٌّ", passive: "مَحْيِيٌّ", transliterationBase: "ḥayiya", transliterations: { past: "ḥayiya", present: "yaḥyā", imperative: "iḥya", place_or_mim_masdar: "ḥayāh", active_participle: "ḥayy", passive_participle: "maḥyiyy" }, formNotes: { active_participle: `${AI_DRAFT_NOTE} حَيٌّ (living, alive) functions as an adjective (ṣifa mushabbaha) rather than a literal فَاعِل-pattern participle.`, passive_participle: `${AI_DRAFT_NOTE} حَيِيَ is intransitive, so a standalone passive participle is essentially unused; مَحْيِيّ is grammatically regular but rare.` }, formMeanings: { past: "he lived", present: "he lives", imperative: "live!", place: "life", active: "living, alive", passive: "kept alive (rare, pattern-based)" }, rootNote: "Form I doubly weak (defective yāʾ, with yāʾ as the second radical) verb; the Quranic primary sense of this root ('life, living') is distinct from the Form-X sense 'to be shy' already in this root's main entry.", measure: "I" },
      "حيي-quranic-life",
    ),
  ],
  قدر: [
    draftVariant(
      { root: "قدر_decree", meaningEn: "decreeing, ordaining", past: "قَدَّرَ", present: "يُقَدِّرُ", imperative: "قَدِّرْ", place: "تَقْدِيرٌ", active: "مُقَدِّرٌ", passive: "مُقَدَّرٌ", transliterationBase: "qaddara", transliterations: { past: "qaddara", present: "yuqaddiru", imperative: "qaddir", place_or_mim_masdar: "taqdīr", active_participle: "muqaddir", passive_participle: "muqaddar" }, formMeanings: { past: "he decreed, ordained, measured out", present: "he decrees, ordains", imperative: "decree!, measure out!", place: "decree, determination", active: "one who decrees/determines", passive: "decreed, predestined, fixed" }, rootNote: "Form II verb, sound root; this root's Quranically central sense ('decree/ordain', qadar theology, Q41:10) is distinct from the 'honour, esteem' sense already in this root's main entry, though both are Form II.", measure: "II" },
      "قدر-quranic-decree",
    ),
  ],
  ولي: [
    draftVariant(
      { root: "ولي_turnaway", meaningEn: "turning away; taking as ally", past: "تَوَلَّى", present: "يَتَوَلَّى", imperative: "تَوَلَّ", place: "تَوَلٍّ", active: "مُتَوَلٍّ", passive: "مُتَوَلًّى", transliterationBase: "tawallā", transliterations: { past: "tawallā", present: "yatawallā", imperative: "tawalla", place_or_mim_masdar: "tawallin", active_participle: "mutawallin", passive_participle: "mutawallan" }, formNotes: { passive_participle: `${AI_DRAFT_NOTE} تَوَلَّى is largely intransitive/reflexive, so a standalone passive participle is pattern-based and rarely used.` }, formMeanings: { past: "he turned away (from); took as an ally/patron", present: "he turns away; takes as ally", imperative: "turn away!, take as ally!", place: "turning away; taking as ally", active: "one who turns away/takes charge", passive: "taken charge of (rare, pattern-based)" }, rootNote: "Form V verb, defective (final ي) root; distinct measure and sense from the Form II 'appoint as ruler' sense already in this root's main entry. تَوَلَّى has a notable double Quranic sense: 'turn away/reject' and 'take as protector/patron'.", measure: "V" },
      "ولي-quranic-turnaway",
    ),
  ],
  حقق: [
    draftVariant(
      { root: "حقق_stative", meaningEn: "being true, being realized", past: "حَقَّ", present: "يَحِقُّ", imperative: "حِقَّ", place: "حَقٌّ", active: "حَاقٌّ", passive: "مَحْقُوقٌ", transliterationBase: "ḥaqqa", transliterations: { past: "ḥaqqa", present: "yaḥiqqu", imperative: "ḥiqqa", place_or_mim_masdar: "ḥaqq", active_participle: "ḥāqq", passive_participle: "maḥqūq" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Largely stative/impersonal verb; the imperative is grammatically valid but almost never used in practice.` }, formMeanings: { past: "it became true, was realized, was due", present: "it becomes true, is due", imperative: "become true! (rare)", place: "truth, right, due", active: "that which is true/binding (rare)", passive: "deserving, entitled (to)" }, rootNote: "Form I verb, geminate root; this stative sense ('to be(come) true, be proven right', حَقَّتْ كَلِمَةُ رَبِّكَ Q10:33) is distinct measure and sense from the Form II 'accomplish/actualize' sense already in this root's main entry.", measure: "I" },
      "حقق-quranic-stative",
    ),
  ],
  أخر: [
    draftVariant(
      { root: "أخر_delay", meaningEn: "delaying, postponing", past: "أَخَّرَ", present: "يُؤَخِّرُ", imperative: "أَخِّرْ", place: "تَأْخِيرٌ", active: "مُؤَخِّرٌ", passive: "مُؤَخَّرٌ", transliterationBase: "akhkhara", transliterations: { past: "akhkhara", present: "yuʾakhkhiru", imperative: "akhkhir", place_or_mim_masdar: "taʾkhīr", active_participle: "muʾakhkhir", passive_participle: "muʾakhkhar" }, formMeanings: { past: "he delayed, postponed", present: "he delays, postpones", imperative: "delay!, postpone!", place: "delaying, postponement", active: "one who delays", passive: "delayed, postponed" }, rootNote: "Form II verb (transitive, causative 'delay X'), sound root; distinct measure and sense from the Form V 'تأخّر, fall behind' (intransitive) sense already in this root's main entry.", measure: "II" },
      "أخر-quranic-delay",
    ),
  ],
  شرك: [
    draftVariant(
      { root: "شرك_associate", meaningEn: "associating partners (with Allah)", past: "أَشْرَكَ", present: "يُشْرِكُ", imperative: "أَشْرِكْ", place: "إِشْرَاكٌ", active: "مُشْرِكٌ", passive: "مُشْرَكٌ", transliterationBase: "ashraka", transliterations: { past: "ashraka", present: "yushriku", imperative: "ashrik", place_or_mim_masdar: "ishrāk", active_participle: "mushrik", passive_participle: "mushrak" }, formNotes: { place_or_mim_masdar: `${AI_DRAFT_NOTE} The dominant Quranic noun is شِرْك, not this regular Form-IV masdar.` }, formMeanings: { past: "he associated partners (with Allah)", present: "he associates partners", imperative: "associate partners! (used almost only negated)", place: "associating partners", active: "polytheist, one who associates partners", passive: "associated as a partner" }, rootNote: "Form IV verb, sound root; this theologically central sense is distinct measure and sense from the Form III 'شارك, participate' sense already in this root's main entry.", measure: "IV" },
      "شرك-quranic-associate",
    ),
  ],
  سوأ: [
    draftVariant(
      { root: "سوأ_evil", meaningEn: "being evil, causing grief", past: "سَاءَ", present: "يَسُوءُ", imperative: "سُؤْ", place: "سُوءٌ", active: "سَيِّئٌ", passive: "مَسُوءٌ", transliterationBase: "sāʾa", transliterations: { past: "sāʾa", present: "yasūʾu", imperative: "suʾ", place_or_mim_masdar: "sūʾ", active_participle: "sayyiʾ", passive_participle: "masūʾ" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Hollow verb; imperative contracts to one consonant but is pragmatically almost never used as a real command.`, active_participle: `${AI_DRAFT_NOTE} The true فَاعِل-pattern participle (سَائِئ) is not idiomatic; the adjective سَيِّئ (a فَيْعِل pattern) fills this role in real usage.` }, formMeanings: { past: "it was/became evil, grieved (someone)", present: "it is/becomes evil, grieves", imperative: "be evil! (rare)", place: "evil, harm, ill", active: "bad, evil", passive: "grieved, distressed (rare)" }, rootNote: "Form I hollow (stative, 'to be/become evil') verb; distinct measure and sense from the Form IV 'أساء, do harm/act badly' sense already in this root's main entry. Roughly parallel to the بِئْسَ evaluative construction.", measure: "I" },
      "سوأ-quranic-evil",
    ),
  ],
  لقي: [
    draftVariant(
      { root: "لقي_meet", meaningEn: "meeting, encountering", past: "لَقِيَ", present: "يَلْقَى", imperative: "اِلْقَ", place: "لِقَاءٌ", active: "لَاقٍ", passive: "مَلْقِيٌّ", transliterationBase: "laqiya", transliterations: { past: "laqiya", present: "yalqā", imperative: "ilqa", place_or_mim_masdar: "liqāʾ", active_participle: "lāqin", passive_participle: "malqiyy" }, formMeanings: { past: "he met, encountered", present: "he meets", imperative: "meet!, encounter!", place: "meeting, encounter", active: "one who meets/encounters", passive: "met, encountered (uncommon)" }, rootNote: "Form I defective verb (فَعِلَ-يَفْعَلُ type, like رَضِيَ); this 'meeting/encountering' sense is distinct from the Form IV 'ألقى, throw/cast' sense already in this root's main entry.", measure: "I" },
      "لقي-quranic-meet",
    ),
  ],
  خلف: [
    draftVariant(
      { root: "خلف_succeed", meaningEn: "succeeding, coming after", past: "خَلَفَ", present: "يَخْلُفُ", imperative: "اُخْلُفْ", place: "خَلْفٌ", active: "خَالِفٌ", passive: "مَخْلُوفٌ", transliterationBase: "khalafa", transliterations: { past: "khalafa", present: "yakhlufu", imperative: "ukhluf", place_or_mim_masdar: "khalf", active_participle: "khālif", passive_participle: "makhlūf" }, formNotes: { place_or_mim_masdar: `${AI_DRAFT_NOTE} The dominant Quranic noun for succession/stewardship is خَلِيفَة, a separate ism, not this plain masdar.` }, formMeanings: { past: "he succeeded, came after, replaced", present: "he succeeds, comes after", imperative: "succeed!, come after!", place: "succession", active: "one who comes after/stays behind", passive: "succeeded, replaced (uncommon)" }, rootNote: "Form I verb, sound root; this 'succeed/come after' sense is distinct from the Form VIII 'اختلف, differ' sense already in this root's main entry.", measure: "I" },
      "خلف-quranic-succeed",
    ),
  ],
  أجر: [
    draftVariant(
      { root: "أجر_wage", meaningEn: "rewarding, paying wages", past: "أَجَرَ", present: "يَأْجُرُ", imperative: "اُؤْجُرْ", place: "أَجْرٌ", active: "آجِرٌ", passive: "مَأْجُورٌ", transliterationBase: "ajara", transliterations: { past: "ajara", present: "yaʾjuru", imperative: "uʾjur", place_or_mim_masdar: "ajr", active_participle: "ājir", passive_participle: "maʾjūr" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Hamza-initial root, not one of the lexicalized أخذ/أكل/أمر hamza-dropping exceptions (those are memorized irregulars, not a general rule — cf. أَتَى, which keeps its hamza: فَأْتُوا Q2:23). The u-type imperfect (confirmed by تَأْجُرَنِي Q28:27) seats the waṣl-hamza on a wāw (اُؤْجُرْ), the same environment as مُؤْمِن and يُؤْخَذُ. Uncommon-looking but grammatically regular and confirmed correct.` }, formMeanings: { past: "he rewarded, paid wages to; hired himself out", present: "he rewards, pays wages; hires himself out", imperative: "reward!, pay wages (to)!", place: "reward, wage", active: "one who pays wages/employs", passive: "rewarded, recompensed" }, rootNote: "Form I verb, hamza-initial root; distinct measure and sense from the Form X 'استأجر, rent/hire someone' sense already in this root's main entry. Attested in the Quran (تَأْجُرَنِي Q28:27).", measure: "I" },
      "أجر-quranic-wage",
    ),
  ],
  نجو: [
    draftVariant(
      { root: "نجو_save", meaningEn: "saving, rescuing (someone)", past: "نَجَّى", present: "يُنَجِّي", imperative: "نَجِّ", place: "تَنْجِيَةٌ", active: "مُنَجٍّ", passive: "مُنَجًّى", transliterationBase: "najjā", transliterations: { past: "najjā", present: "yunajjī", imperative: "najji", place_or_mim_masdar: "tanjiyah", active_participle: "munajjin", passive_participle: "munajjan" }, formMeanings: { past: "he saved, rescued (someone)", present: "he saves, rescues", imperative: "save!, rescue!", place: "saving, rescuing", active: "savior, rescuer", passive: "saved, rescued" }, rootNote: "Form II verb (transitive/causative), defective root; distinct measure and sense from the Form I 'نجا, be saved' (intransitive) sense already in this root's main entry. Extremely Quranic (وَنَجَّيْنَاهُ Q29:15 and elsewhere).", measure: "II" },
      "نجو-quranic-save",
    ),
  ],
  وجه: [
    draftVariant(
      { root: "وجه_towards", meaningEn: "turning oneself, heading (towards)", past: "تَوَجَّهَ", present: "يَتَوَجَّهُ", imperative: "تَوَجَّهْ", place: "تَوَجُّهٌ", active: "مُتَوَجِّهٌ", passive: "مُتَوَجَّهٌ", transliterationBase: "tawajjaha", transliterations: { past: "tawajjaha", present: "yatawajjahu", imperative: "tawajjah", place_or_mim_masdar: "tawajjuh", active_participle: "mutawajjih", passive_participle: "mutawajjah" }, formNotes: { passive_participle: `${AI_DRAFT_NOTE} تَوَجَّهَ is reflexive/intransitive, so a standalone passive participle is pattern-based and rarely used.` }, formMeanings: { past: "he turned himself (towards), headed (towards)", present: "he turns himself, heads (towards)", imperative: "turn yourself (towards)!, head (towards)!", place: "turning oneself, heading (towards)", active: "one heading/turning (towards)", passive: "headed to (rare, pattern-based)" }, rootNote: "Form V verb (reflexive), root-initial و retained; distinct measure and sense from the Form III 'واجه, face/encounter someone' sense already in this root's main entry. Directly Quranic (Q28:22).", measure: "V" },
      "وجه-quranic-towards",
    ),
  ],
  كلم: [
    draftVariant(
      { root: "كلم_address", meaningEn: "speaking to, addressing (someone)", past: "كَلَّمَ", present: "يُكَلِّمُ", imperative: "كَلِّمْ", place: "تَكْلِيمٌ", active: "مُكَلِّمٌ", passive: "مُكَلَّمٌ", transliterationBase: "kallama", transliterations: { past: "kallama", present: "yukallimu", imperative: "kallim", place_or_mim_masdar: "taklīm", active_participle: "mukallim", passive_participle: "mukallam" }, formMeanings: { past: "he spoke to, addressed (someone)", present: "he speaks to, addresses", imperative: "speak to!, address!", place: "speaking to, addressing", active: "one who speaks to/addresses", passive: "spoken to, addressed" }, rootNote: "Form II verb (transitive 'speak TO someone'), sound root; distinct measure and sense from the Form V 'تكلّم, speak/converse' (intransitive) sense already in this root's main entry. Extremely Quranically famous (وَكَلَّمَ اللَّهُ مُوسَىٰ تَكْلِيمًا Q4:164).", measure: "II" },
      "كلم-quranic-address",
    ),
  ],
  حسب: [
    draftVariant(
      { root: "حسب_suppose", meaningEn: "thinking, supposing", past: "حَسِبَ", present: "يَحْسَبُ", imperative: "اِحْسَبْ", place: "حُسْبَانٌ", active: "حَاسِبٌ", passive: "مَحْسُوبٌ", transliterationBase: "ḥasiba", transliterations: { past: "ḥasiba", present: "yaḥsabu", imperative: "iḥsab", place_or_mim_masdar: "ḥusbān", active_participle: "ḥāsib", passive_participle: "maḥsūb" }, formNotes: { imperative: `${AI_DRAFT_NOTE} Hamzat-waṣl vowel is kasra here (not ḍamma, unlike the calculating sense of this root) — both يَحْسَبُ and the variant يَحْسِبُ are classically valid; in real Quranic usage the imperative appears almost exclusively in the negated energetic construction لَا تَحْسَبَنَّ ("never think...!") rather than as a bare affirmative command.`, active_participle: `${AI_DRAFT_NOTE} حَاسِبٌ is grammatically regular for this sense but overwhelmingly means "accountant/calculator" in real usage (cf. حاسوب, computer) — read this card in context, not as an everyday word for "one who supposes."` }, formMeanings: { past: "he thought, supposed, reckoned (that)", present: "he thinks, supposes", imperative: "think!, suppose! (almost always used negated)", place: "thinking, supposing; reckoning", active: "one who thinks/supposes (rare in this sense; usually read as 'accountant')", passive: "considered, counted (as), reckoned to be" }, rootNote: "Form I verb, sound root; this stative 'think/suppose' sense (very Quranically frequent, أَحَسِبَ النَّاسُ Q29:2) is distinct from the 'calculate/count' sense already in this root's main entry, even though both are Form I. Confirmed distinct from حَسَبَ by its i/a-type imperfect (يَحْسَبُ) versus حَسَبَ's u-type (يَحْسُبُ).", measure: "I" },
      "حسب-quranic-suppose",
    ),
  ],
};

function attachExtraVariants(entries: RootEntry[]): RootEntry[] {
  return entries.map((entry) =>
    EXTRA_VARIANTS[entry.root]
      ? { ...entry, variants: [...(entry.variants ?? []), ...EXTRA_VARIANTS[entry.root]] }
      : entry,
  );
}

/**
 * Roots confirmed as Quranic vocabulary by Fable's Quranic-root-index review but whose entry
 * predates that verification (so it was never flagged `quranic: true`) — either because it's a
 * draft() call written with `{ includeQuranicMetadata: false }`, or because it's CSV-generated
 * (the CSV importer never sets `quranic` at all). Flagging them centrally here, rather than
 * editing each entry, works uniformly across both sources.
 */
const CONFIRMED_QURANIC_ROOTS = new Set<string>([
  "قول", "خوف", "قرأ", "هدي", "ضلل", "أمر", "وعد", "أخذ", "أكل", "سأل", "دعو", "وجد",
  "صبح", "روح", "نفق", "جعل", "أتي", "نهي", "رفع", "طوع", "قوم", "نفس", "كون", "رأي",
  "أمن", "حيي",
  // Section C (coverage-gap) additions confirmed as REUSE-EXISTING by Fable's review.
  "رسل", "بين", "صلو", "تبع", "كثر", "خير", "جزي", "شدد", "حبب", "صحب", "ولد", "حسب",
  // New Section C variant hosts (see EXTRA_VARIANTS) and new Section C roots.
  "قدر", "ولي", "حقق", "أخر", "شرك", "سوأ", "لقي", "خلف", "أجر", "نجو", "وجه", "كلم",
]);

function applyQuranicFlags(entries: RootEntry[]): RootEntry[] {
  return entries.map((entry) =>
    CONFIRMED_QURANIC_ROOTS.has(entry.root) && !entry.quranic
      ? { ...entry, quranic: true }
      : entry,
  );
}

function applyFormVerification(
  entries: RootEntry[],
  verification: Readonly<Record<string, Partial<Record<SarfFormKey, string>>>>,
): RootEntry[] {
  const verify = <T extends RootEntry | RootVerbEntry>(entry: T, entryId: string): T => {
    const verifiedForms = verification[entryId];
    if (!verifiedForms) return entry;
    return {
      ...entry,
      forms: entry.forms.map((form) => {
        const verifiedArabic = verifiedForms[form.key];
        return verifiedArabic
          ? { ...form, arabic: verifiedArabic, reviewState: "reviewed" }
          : form;
      }),
    };
  };

  return entries.map((entry) => {
    const verifiedEntry = verify(entry, `${entry.root}-main`);
    return entry.variants
      ? {
          ...verifiedEntry,
          variants: entry.variants.map((variant) => verify(variant, variant.id)),
        }
      : verifiedEntry;
  });
}

function applyGeneratedFormVerification(
  entries: RootEntry[],
  verification: typeof PARTICIPLE_VERIFIED_FORMS,
): RootEntry[] {
  const verify = <T extends RootEntry | RootVerbEntry>(entry: T, entryId: string): T => {
    const verifiedForms = verification[entryId];
    if (!verifiedForms) return entry;
    return {
      ...entry,
      forms: entry.forms.map((form) => {
        const verified = verifiedForms[form.key];
        return verified
          ? {
              ...form,
              ...verified,
              transliteration: transliterate(verified.arabic),
              reviewState: "reviewed" as const,
            }
          : form;
      }),
    };
  };

  return entries.map((entry) => {
    const verifiedEntry = verify(entry, `${entry.root}-main`);
    return entry.variants
      ? { ...verifiedEntry, variants: entry.variants.map((variant) => verify(variant, variant.id)) }
      : verifiedEntry;
  });
}

function applyEntryReviewStatuses(entries: RootEntry[]): RootEntry[] {
  const cleanNotes = (notes?: string) => {
    const cleaned = notes?.replace(AI_DRAFT_NOTE, "").trim();
    return cleaned || undefined;
  };
  const promote = <T extends RootEntry | RootVerbEntry>(entry: T): T => {
    if (entry.status !== "ai_draft") {
      return entry;
    }
    const reviewedFormCount = entry.forms.filter((form) => form.reviewState === "reviewed").length;
    if (reviewedFormCount === 0) return entry;
    if (reviewedFormCount < entry.forms.length) {
      return { ...entry, status: "partially_reviewed", updatedAt: "2026-07-13" };
    }
    return {
      ...entry,
      status: "reviewed",
      notes: cleanNotes(entry.notes),
      updatedAt: "2026-07-12",
      forms: entry.forms.map((form) => ({ ...form, notes: cleanNotes(form.notes) })),
    };
  };

  return entries.map((entry) => {
    const promotedEntry = promote(entry);
    return entry.variants
      ? { ...promotedEntry, variants: entry.variants.map(promote) }
      : promotedEntry;
  });
}

export const roots: RootEntry[] = applyQuranicFlags(
  applyEntryReviewStatuses(
    applyGeneratedFormVerification(
      applyGeneratedFormVerification(
        applyFormVerification(
          applyFormVerification(
            applyFormVerification(
              attachExtraVariants(importedArabicVerbBuild.roots),
              QUTRUB_VERIFIED_FORMS,
            ),
            QABAS_VERIFIED_FORMS,
          ),
          CALIMA_VERIFIED_FORMS,
        ),
        PARTICIPLE_VERIFIED_FORMS,
      ),
      ELIXIRFM_VERIFIED_FORMS,
    ),
  ),
);
export const importedArabicVerbReport = importedArabicVerbBuild.report;

const cleanedImportedEntries = roots.flatMap((entry) =>
  [
    ...(entry.source ? [{ root: entry.root, entry }] : []),
    ...(entry.variants ?? [])
      .filter((variant) => variant.source)
      .map((variant) => ({ root: entry.root, entry: variant })),
  ],
);

/** Internal audit summary for the 2026-07 placeholder-content cleanup. */
export const importedPlaceholderCleanupAudit = {
  affectedRoots: new Set(cleanedImportedEntries.map(({ root }) => root)).size,
  affectedEntries: cleanedImportedEntries.length,
  cleanedLearnerFields: cleanedImportedEntries.length * 20,
  items: cleanedImportedEntries.flatMap(({ root, entry }) =>
    entry.forms.map((form) => ({
      root,
      entryId: "id" in entry ? entry.id : `${root}-main`,
      formKey: form.key,
      affectedFields:
        form.reviewState === "pending"
          ? ["arabic", "meaningEn", "exampleAr", "exampleEn"]
          : ["meaningEn", "exampleAr", "exampleEn"],
      actionTaken:
        form.reviewState === "pending"
          ? "Removed unsupported generated content and marked the form pending."
          : "Kept source-backed Arabic and gloss; removed fabricated examples.",
      evidenceUsed: form.reviewState === "source_backed" ? ["original_source"] : [],
      humanReviewRequired: form.reviewState === "pending" || !form.exampleEn,
    })),
  ),
} as const;
