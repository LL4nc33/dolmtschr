"""Language registry for Whisper-supported languages.

Provides a frozen dataclass per language with metadata for UI grouping
(continent, native name, country flag derivation) and quality scores
for STT/translation capabilities.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Language:
    code: str
    name: str
    native_name: str
    continent: str
    country_code: str
    stt_quality: int       # 0-100, inverted Whisper WER (100 = perfect)
    translate_tier: str    # "excellent" / "good" / "fair" / "poor" / "experimental"
    resource_level: str    # "high" / "mid" / "low" / "very-low"


CONTINENTS: dict[str, str] = {
    "EU": "Europa",
    "AS": "Asien",
    "ME": "Naher Osten",
    "AF": "Afrika",
    "AM": "Amerika",
    "OC": "Ozeanien",
}


def _lang(
    code: str,
    name: str,
    native_name: str,
    continent: str,
    country_code: str,
    stt_quality: int = 50,
    translate_tier: str = "experimental",
    resource_level: str = "very-low",
) -> Language:
    return Language(
        code=code,
        name=name,
        native_name=native_name,
        continent=continent,
        country_code=country_code,
        stt_quality=stt_quality,
        translate_tier=translate_tier,
        resource_level=resource_level,
    )


LANGUAGES: dict[str, Language] = {
    # -- Europa (EU) --
    "de": _lang("de", "German", "Deutsch", "EU", "at", 94, "excellent", "high"),
    "en": _lang("en", "English", "English", "EU", "gb", 95, "excellent", "high"),
    "fr": _lang("fr", "French", "Français", "EU", "fr", 88, "excellent", "high"),
    "es": _lang("es", "Spanish", "Español", "EU", "es", 96, "excellent", "high"),
    "it": _lang("it", "Italian", "Italiano", "EU", "it", 95, "excellent", "high"),
    "pt": _lang("pt", "Portuguese", "Português", "EU", "pt", 92, "excellent", "high"),
    "nl": _lang("nl", "Dutch", "Nederlands", "EU", "nl", 96, "excellent", "high"),
    "pl": _lang("pl", "Polish", "Polski", "EU", "pl", 92, "excellent", "high"),
    "ru": _lang("ru", "Russian", "Русский", "EU", "ru", 93, "excellent", "high"),
    "uk": _lang("uk", "Ukrainian", "Українська", "EU", "ua", 85, "good", "mid"),
    "cs": _lang("cs", "Czech", "Čeština", "EU", "cz", 90, "good", "mid"),
    "sk": _lang("sk", "Slovak", "Slovenčina", "EU", "sk", 78, "good", "mid"),
    "ro": _lang("ro", "Romanian", "Română", "EU", "ro", 88, "good", "mid"),
    "hu": _lang("hu", "Hungarian", "Magyar", "EU", "hu", 86, "good", "mid"),
    "sr": _lang("sr", "Serbian", "Srpski", "EU", "rs", 83, "good", "mid"),
    "hr": _lang("hr", "Croatian", "Hrvatski", "EU", "hr", 83, "good", "mid"),
    "bs": _lang("bs", "Bosnian", "Bosanski", "EU", "ba", 80, "fair", "low"),
    "bg": _lang("bg", "Bulgarian", "Български", "EU", "bg", 84, "good", "mid"),
    "el": _lang("el", "Greek", "Ελληνικά", "EU", "gr", 85, "good", "mid"),
    "da": _lang("da", "Danish", "Dansk", "EU", "dk", 79, "good", "mid"),
    "sv": _lang("sv", "Swedish", "Svenska", "EU", "se", 91, "good", "mid"),
    "no": _lang("no", "Norwegian", "Norsk", "EU", "no", 88, "good", "mid"),
    "fi": _lang("fi", "Finnish", "Suomi", "EU", "fi", 77, "good", "mid"),
    "et": _lang("et", "Estonian", "Eesti", "EU", "ee", 76, "fair", "low"),
    "lv": _lang("lv", "Latvian", "Latviešu", "EU", "lv", 81, "fair", "low"),
    "lt": _lang("lt", "Lithuanian", "Lietuvių", "EU", "lt", 76, "fair", "low"),
    "sl": _lang("sl", "Slovenian", "Slovenščina", "EU", "si", 80, "good", "mid"),
    "mk": _lang("mk", "Macedonian", "Македонски", "EU", "mk", 82, "fair", "mid"),
    "sq": _lang("sq", "Albanian", "Shqip", "EU", "al", 68, "fair", "low"),
    "is": _lang("is", "Icelandic", "Íslenska", "EU", "is", 78, "fair", "low"),
    "ga": _lang("ga", "Irish", "Gaeilge", "EU", "ie", 60, "fair", "low"),
    "cy": _lang("cy", "Welsh", "Cymraeg", "EU", "gb", 75, "fair", "low"),
    "ca": _lang("ca", "Catalan", "Català", "EU", "es", 86, "good", "mid"),
    "eu": _lang("eu", "Basque", "Euskara", "EU", "es", 72, "fair", "low"),
    "gl": _lang("gl", "Galician", "Galego", "EU", "es", 80, "fair", "low"),
    "lb": _lang("lb", "Luxembourgish", "Lëtzebuergesch", "EU", "lu", 60, "fair", "low"),
    "mt": _lang("mt", "Maltese", "Malti", "EU", "mt", 65, "fair", "low"),
    "be": _lang("be", "Belarusian", "Беларуская", "EU", "by", 70, "fair", "low"),
    "hy": _lang("hy", "Armenian", "Հայերեն", "EU", "am", 65, "fair", "low"),
    "ka": _lang("ka", "Georgian", "ქართული", "EU", "ge", 60, "fair", "low"),
    "nn": _lang("nn", "Nynorsk", "Nynorsk", "EU", "no", 75, "fair", "mid"),
    "oc": _lang("oc", "Occitan", "Occitan", "EU", "fr", 55, "experimental", "very-low"),
    "br": _lang("br", "Breton", "Brezhoneg", "EU", "fr", 50, "experimental", "very-low"),
    "fo": _lang("fo", "Faroese", "Føroyskt", "EU", "fo", 55, "experimental", "very-low"),
    "yi": _lang("yi", "Yiddish", "ייִדיש", "EU", "il", 45, "experimental", "very-low"),
    # -- Asien (AS) --
    "zh": _lang("zh", "Chinese", "中文", "AS", "cn", 88, "excellent", "high"),
    "ja": _lang("ja", "Japanese", "日本語", "AS", "jp", 89, "excellent", "high"),
    "ko": _lang("ko", "Korean", "한국어", "AS", "kr", 95, "excellent", "high"),
    "hi": _lang("hi", "Hindi", "हिन्दी", "AS", "in", 80, "good", "mid"),
    "bn": _lang("bn", "Bengali", "বাংলা", "AS", "bd", 72, "fair", "low"),
    "th": _lang("th", "Thai", "ไทย", "AS", "th", 94, "good", "mid"),
    "vi": _lang("vi", "Vietnamese", "Tiếng Việt", "AS", "vn", 73, "good", "mid"),
    "id": _lang("id", "Indonesian", "Bahasa Indonesia", "AS", "id", 92, "good", "mid"),
    "ms": _lang("ms", "Malay", "Bahasa Melayu", "AS", "my", 85, "good", "mid"),
    "tl": _lang("tl", "Tagalog", "Tagalog", "AS", "ph", 65, "fair", "low"),
    "ta": _lang("ta", "Tamil", "தமிழ்", "AS", "in", 69, "fair", "low"),
    "te": _lang("te", "Telugu", "తెలుగు", "AS", "in", 70, "fair", "low"),
    "kn": _lang("kn", "Kannada", "ಕನ್ನಡ", "AS", "in", 60, "poor", "low"),
    "ml": _lang("ml", "Malayalam", "മലയാളം", "AS", "in", 58, "poor", "low"),
    "gu": _lang("gu", "Gujarati", "ગુજરાતી", "AS", "in", 68, "fair", "low"),
    "mr": _lang("mr", "Marathi", "मराठी", "AS", "in", 70, "fair", "low"),
    "pa": _lang("pa", "Punjabi", "ਪੰਜਾਬੀ", "AS", "in", 74, "fair", "low"),
    "ne": _lang("ne", "Nepali", "नेपाली", "AS", "np", 72, "fair", "low"),
    "si": _lang("si", "Sinhala", "සිංහල", "AS", "lk", 55, "experimental", "very-low"),
    "km": _lang("km", "Khmer", "ខ្មែរ", "AS", "kh", 55, "experimental", "very-low"),
    "lo": _lang("lo", "Lao", "ລາວ", "AS", "la", 50, "experimental", "very-low"),
    "my": _lang("my", "Myanmar", "မြန်မာ", "AS", "mm", 45, "experimental", "very-low"),
    "mn": _lang("mn", "Mongolian", "Монгол", "AS", "mn", 55, "experimental", "very-low"),
    "kk": _lang("kk", "Kazakh", "Қазақ", "AS", "kz", 60, "experimental", "very-low"),
    "ky": _lang("ky", "Kyrgyz", "Кыргыз", "AS", "kg", 55, "experimental", "very-low"),
    "uz": _lang("uz", "Uzbek", "Oʻzbek", "AS", "uz", 58, "experimental", "very-low"),
    "tg": _lang("tg", "Tajik", "Тоҷикӣ", "AS", "tj", 55, "experimental", "very-low"),
    "tk": _lang("tk", "Turkmen", "Türkmen", "AS", "tm", 50, "experimental", "very-low"),
    "az": _lang("az", "Azerbaijani", "Azərbaycan", "AS", "az", 76, "fair", "low"),
    "jv": _lang("jv", "Javanese", "Basa Jawa", "AS", "id", 50, "experimental", "very-low"),
    "su": _lang("su", "Sundanese", "Basa Sunda", "AS", "id", 45, "experimental", "very-low"),
    "bo": _lang("bo", "Tibetan", "བོད་སྐད", "AS", "cn", 25, "experimental", "very-low"),
    "as": _lang("as", "Assamese", "অসমীয়া", "AS", "in", 50, "experimental", "very-low"),
    "sd": _lang("sd", "Sindhi", "سنڌي", "AS", "pk", 50, "experimental", "very-low"),
    "sa": _lang("sa", "Sanskrit", "संस्कृतम्", "AS", "in", 35, "experimental", "very-low"),
    "ceb": _lang("ceb", "Cebuano", "Cebuano", "AS", "ph", 45, "experimental", "very-low"),
    "fil": _lang("fil", "Filipino", "Filipino", "AS", "ph", 65, "fair", "low"),
    # -- Naher Osten (ME) --
    "ar": _lang("ar", "Arabic", "العربية", "ME", "sa", 83, "excellent", "high"),
    "fa": _lang("fa", "Persian", "فارسی", "ME", "ir", 74, "fair", "low"),
    "tr": _lang("tr", "Turkish", "Türkçe", "ME", "tr", 87, "good", "mid"),
    "he": _lang("he", "Hebrew", "עברית", "ME", "il", 77, "good", "mid"),
    "ur": _lang("ur", "Urdu", "اردو", "ME", "pk", 78, "fair", "low"),
    "ps": _lang("ps", "Pashto", "پښتو", "ME", "af", 65, "fair", "low"),
    "ba": _lang("ba", "Bashkir", "Башҡорт", "ME", "ru", 50, "experimental", "very-low"),
    "tt": _lang("tt", "Tatar", "Татар", "ME", "ru", 55, "experimental", "very-low"),
    # -- Afrika (AF) --
    "af": _lang("af", "Afrikaans", "Afrikaans", "AF", "za", 74, "fair", "low"),
    "sw": _lang("sw", "Swahili", "Kiswahili", "AF", "tz", 69, "fair", "low"),
    "am": _lang("am", "Amharic", "አማርኛ", "AF", "et", 50, "experimental", "very-low"),
    "ha": _lang("ha", "Hausa", "Hausa", "AF", "ng", 45, "experimental", "very-low"),
    "yo": _lang("yo", "Yoruba", "Yorùbá", "AF", "ng", 40, "experimental", "very-low"),
    "sn": _lang("sn", "Shona", "chiShona", "AF", "zw", 40, "experimental", "very-low"),
    "so": _lang("so", "Somali", "Soomaali", "AF", "so", 45, "experimental", "very-low"),
    "mg": _lang("mg", "Malagasy", "Malagasy", "AF", "mg", 40, "experimental", "very-low"),
    "ny": _lang("ny", "Chichewa", "Chichewa", "AF", "mw", 35, "experimental", "very-low"),
    "tn": _lang("tn", "Tswana", "Setswana", "AF", "bw", 35, "experimental", "very-low"),
    "ln": _lang("ln", "Lingala", "Lingála", "AF", "cd", 40, "experimental", "very-low"),
    "zu": _lang("zu", "Zulu", "isiZulu", "AF", "za", 40, "experimental", "very-low"),
    "tw": _lang("tw", "Twi", "Twi", "AF", "gh", 35, "experimental", "very-low"),
    # -- Ozeanien (OC) --
    "haw": _lang("haw", "Hawaiian", "ʻŌlelo Hawaiʻi", "OC", "us", 30, "experimental", "very-low"),
    "mi": _lang("mi", "Maori", "Te Reo Māori", "OC", "nz", 35, "experimental", "very-low"),
    "sm": _lang("sm", "Samoan", "Gagana Sāmoa", "OC", "ws", 35, "experimental", "very-low"),
    "ty": _lang("ty", "Tahitian", "Reo Tahiti", "OC", "pf", 30, "experimental", "very-low"),
    # -- Amerika (AM) --
    "la": _lang("la", "Latin", "Latina", "AM", "va", 45, "experimental", "very-low"),
}


def get_all_language_codes() -> set[str]:
    """Return all registered language codes."""
    return set(LANGUAGES.keys())
