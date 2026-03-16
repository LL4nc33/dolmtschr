"""Language registry for Whisper-supported languages.

Provides a frozen dataclass per language with metadata for UI grouping
(continent, native name, country flag derivation).
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


CONTINENTS: dict[str, str] = {
    "EU": "Europa",
    "AS": "Asien",
    "ME": "Naher Osten",
    "AF": "Afrika",
    "AM": "Amerika",
    "OC": "Ozeanien",
}


def _lang(code: str, name: str, native_name: str, continent: str, country_code: str) -> Language:
    return Language(code=code, name=name, native_name=native_name, continent=continent, country_code=country_code)


LANGUAGES: dict[str, Language] = {
    # -- Europa (EU) --
    "de": _lang("de", "German", "Deutsch", "EU", "at"),
    "en": _lang("en", "English", "English", "EU", "gb"),
    "fr": _lang("fr", "French", "Fran\u00e7ais", "EU", "fr"),
    "es": _lang("es", "Spanish", "Espa\u00f1ol", "EU", "es"),
    "it": _lang("it", "Italian", "Italiano", "EU", "it"),
    "pt": _lang("pt", "Portuguese", "Portugu\u00eas", "EU", "pt"),
    "nl": _lang("nl", "Dutch", "Nederlands", "EU", "nl"),
    "pl": _lang("pl", "Polish", "Polski", "EU", "pl"),
    "ru": _lang("ru", "Russian", "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", "EU", "ru"),
    "uk": _lang("uk", "Ukrainian", "\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430", "EU", "ua"),
    "cs": _lang("cs", "Czech", "\u010ce\u0161tina", "EU", "cz"),
    "sk": _lang("sk", "Slovak", "Sloven\u010dina", "EU", "sk"),
    "ro": _lang("ro", "Romanian", "Rom\u00e2n\u0103", "EU", "ro"),
    "hu": _lang("hu", "Hungarian", "Magyar", "EU", "hu"),
    "sr": _lang("sr", "Serbian", "Srpski", "EU", "rs"),
    "hr": _lang("hr", "Croatian", "Hrvatski", "EU", "hr"),
    "bs": _lang("bs", "Bosnian", "Bosanski", "EU", "ba"),
    "bg": _lang("bg", "Bulgarian", "\u0411\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0438", "EU", "bg"),
    "el": _lang("el", "Greek", "\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac", "EU", "gr"),
    "da": _lang("da", "Danish", "Dansk", "EU", "dk"),
    "sv": _lang("sv", "Swedish", "Svenska", "EU", "se"),
    "no": _lang("no", "Norwegian", "Norsk", "EU", "no"),
    "fi": _lang("fi", "Finnish", "Suomi", "EU", "fi"),
    "et": _lang("et", "Estonian", "Eesti", "EU", "ee"),
    "lv": _lang("lv", "Latvian", "Latvie\u0161u", "EU", "lv"),
    "lt": _lang("lt", "Lithuanian", "Lietuvi\u0173", "EU", "lt"),
    "sl": _lang("sl", "Slovenian", "Sloven\u0161\u010dina", "EU", "si"),
    "mk": _lang("mk", "Macedonian", "\u041c\u0430\u043a\u0435\u0434\u043e\u043d\u0441\u043a\u0438", "EU", "mk"),
    "sq": _lang("sq", "Albanian", "Shqip", "EU", "al"),
    "is": _lang("is", "Icelandic", "\u00cdslenska", "EU", "is"),
    "ga": _lang("ga", "Irish", "Gaeilge", "EU", "ie"),
    "cy": _lang("cy", "Welsh", "Cymraeg", "EU", "gb"),
    "ca": _lang("ca", "Catalan", "Catal\u00e0", "EU", "es"),
    "eu": _lang("eu", "Basque", "Euskara", "EU", "es"),
    "gl": _lang("gl", "Galician", "Galego", "EU", "es"),
    "lb": _lang("lb", "Luxembourgish", "L\u00ebtzebuergesch", "EU", "lu"),
    "mt": _lang("mt", "Maltese", "Malti", "EU", "mt"),
    "be": _lang("be", "Belarusian", "\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f", "EU", "by"),
    "hy": _lang("hy", "Armenian", "\u0540\u0561\u0575\u0565\u0580\u0565\u0576", "EU", "am"),
    "ka": _lang("ka", "Georgian", "\u10e5\u10d0\u10e0\u10d7\u10e3\u10da\u10d8", "EU", "ge"),
    "nn": _lang("nn", "Nynorsk", "Nynorsk", "EU", "no"),
    "oc": _lang("oc", "Occitan", "Occitan", "EU", "fr"),
    "br": _lang("br", "Breton", "Brezhoneg", "EU", "fr"),
    "fo": _lang("fo", "Faroese", "F\u00f8royskt", "EU", "fo"),
    "yi": _lang("yi", "Yiddish", "\u05d9\u05d9\u05b4\u05d3\u05d9\u05e9", "EU", "il"),
    # -- Asien (AS) --
    "zh": _lang("zh", "Chinese", "\u4e2d\u6587", "AS", "cn"),
    "ja": _lang("ja", "Japanese", "\u65e5\u672c\u8a9e", "AS", "jp"),
    "ko": _lang("ko", "Korean", "\ud55c\uad6d\uc5b4", "AS", "kr"),
    "hi": _lang("hi", "Hindi", "\u0939\u093f\u0928\u094d\u0926\u0940", "AS", "in"),
    "bn": _lang("bn", "Bengali", "\u09ac\u09be\u0982\u09b2\u09be", "AS", "bd"),
    "th": _lang("th", "Thai", "\u0e44\u0e17\u0e22", "AS", "th"),
    "vi": _lang("vi", "Vietnamese", "Ti\u1ebfng Vi\u1ec7t", "AS", "vn"),
    "id": _lang("id", "Indonesian", "Bahasa Indonesia", "AS", "id"),
    "ms": _lang("ms", "Malay", "Bahasa Melayu", "AS", "my"),
    "tl": _lang("tl", "Tagalog", "Tagalog", "AS", "ph"),
    "ta": _lang("ta", "Tamil", "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd", "AS", "in"),
    "te": _lang("te", "Telugu", "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41", "AS", "in"),
    "kn": _lang("kn", "Kannada", "\u0c95\u0ca8\u0ccd\u0ca8\u0ca1", "AS", "in"),
    "ml": _lang("ml", "Malayalam", "\u0d2e\u0d32\u0d2f\u0d3e\u0d33\u0d02", "AS", "in"),
    "gu": _lang("gu", "Gujarati", "\u0a97\u0ac1\u0a9c\u0ab0\u0abe\u0aa4\u0ac0", "AS", "in"),
    "mr": _lang("mr", "Marathi", "\u092e\u0930\u093e\u0920\u0940", "AS", "in"),
    "pa": _lang("pa", "Punjabi", "\u0a2a\u0a70\u0a1c\u0a3e\u0a2c\u0a40", "AS", "in"),
    "ne": _lang("ne", "Nepali", "\u0928\u0947\u092a\u093e\u0932\u0940", "AS", "np"),
    "si": _lang("si", "Sinhala", "\u0dc3\u0dd2\u0d82\u0dc4\u0dbd", "AS", "lk"),
    "km": _lang("km", "Khmer", "\u1781\u17d2\u1798\u17c2\u179a", "AS", "kh"),
    "lo": _lang("lo", "Lao", "\u0ea5\u0eb2\u0ea7", "AS", "la"),
    "my": _lang("my", "Myanmar", "\u1019\u103c\u1014\u103a\u1019\u102c", "AS", "mm"),
    "mn": _lang("mn", "Mongolian", "\u041c\u043e\u043d\u0433\u043e\u043b", "AS", "mn"),
    "kk": _lang("kk", "Kazakh", "\u049a\u0430\u0437\u0430\u049b", "AS", "kz"),
    "ky": _lang("ky", "Kyrgyz", "\u041a\u044b\u0440\u0433\u044b\u0437", "AS", "kg"),
    "uz": _lang("uz", "Uzbek", "O\u02bbzbek", "AS", "uz"),
    "tg": _lang("tg", "Tajik", "\u0422\u043e\u04b7\u0438\u043a\u04e3", "AS", "tj"),
    "tk": _lang("tk", "Turkmen", "T\u00fcrkmen", "AS", "tm"),
    "az": _lang("az", "Azerbaijani", "Az\u0259rbaycan", "AS", "az"),
    "jv": _lang("jv", "Javanese", "Basa Jawa", "AS", "id"),
    "su": _lang("su", "Sundanese", "Basa Sunda", "AS", "id"),
    "bo": _lang("bo", "Tibetan", "\u0f56\u0f7c\u0f51\u0f0b\u0f66\u0f90\u0f51", "AS", "cn"),
    "as": _lang("as", "Assamese", "\u0985\u09b8\u09ae\u09c0\u09af\u09bc\u09be", "AS", "in"),
    "sd": _lang("sd", "Sindhi", "\u0633\u0646\u068c\u064a", "AS", "pk"),
    "sa": _lang("sa", "Sanskrit", "\u0938\u0902\u0938\u094d\u0915\u0943\u0924\u092e\u094d", "AS", "in"),
    "ceb": _lang("ceb", "Cebuano", "Cebuano", "AS", "ph"),
    "fil": _lang("fil", "Filipino", "Filipino", "AS", "ph"),
    # -- Naher Osten (ME) --
    "ar": _lang("ar", "Arabic", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", "ME", "sa"),
    "fa": _lang("fa", "Persian", "\u0641\u0627\u0631\u0633\u06cc", "ME", "ir"),
    "tr": _lang("tr", "Turkish", "T\u00fcrk\u00e7e", "ME", "tr"),
    "he": _lang("he", "Hebrew", "\u05e2\u05d1\u05e8\u05d9\u05ea", "ME", "il"),
    "ur": _lang("ur", "Urdu", "\u0627\u0631\u062f\u0648", "ME", "pk"),
    "ps": _lang("ps", "Pashto", "\u067e\u069a\u062a\u0648", "ME", "af"),
    "ba": _lang("ba", "Bashkir", "\u0411\u0430\u0448\u04a1\u043e\u0440\u0442", "ME", "ru"),
    "tt": _lang("tt", "Tatar", "\u0422\u0430\u0442\u0430\u0440", "ME", "ru"),
    # -- Afrika (AF) --
    "af": _lang("af", "Afrikaans", "Afrikaans", "AF", "za"),
    "sw": _lang("sw", "Swahili", "Kiswahili", "AF", "tz"),
    "am": _lang("am", "Amharic", "\u12a0\u121b\u122d\u129b", "AF", "et"),
    "ha": _lang("ha", "Hausa", "Hausa", "AF", "ng"),
    "yo": _lang("yo", "Yoruba", "Yor\u00f9b\u00e1", "AF", "ng"),
    "sn": _lang("sn", "Shona", "chiShona", "AF", "zw"),
    "so": _lang("so", "Somali", "Soomaali", "AF", "so"),
    "mg": _lang("mg", "Malagasy", "Malagasy", "AF", "mg"),
    "ny": _lang("ny", "Chichewa", "Chichewa", "AF", "mw"),
    "tn": _lang("tn", "Tswana", "Setswana", "AF", "bw"),
    "ln": _lang("ln", "Lingala", "Ling\u00e1la", "AF", "cd"),
    "zu": _lang("zu", "Zulu", "isiZulu", "AF", "za"),
    "tw": _lang("tw", "Twi", "Twi", "AF", "gh"),
    # -- Ozeanien (OC) --
    "haw": _lang("haw", "Hawaiian", "\u02bb\u014clelo Hawai\u02bbi", "OC", "us"),
    "mi": _lang("mi", "Maori", "Te Reo M\u0101ori", "OC", "nz"),
    "sm": _lang("sm", "Samoan", "Gagana S\u0101moa", "OC", "ws"),
    "ty": _lang("ty", "Tahitian", "Reo Tahiti", "OC", "pf"),
    # -- Amerika (AM) --
    "la": _lang("la", "Latin", "Latina", "AM", "va"),
}


def get_all_language_codes() -> set[str]:
    """Return all registered language codes."""
    return set(LANGUAGES.keys())
