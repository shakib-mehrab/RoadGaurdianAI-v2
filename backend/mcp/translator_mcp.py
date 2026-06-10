from fastmcp import FastMCP

mcp = FastMCP("emergency-translator-tools")

# Pre-cached phrase library — works 100% offline
EMERGENCY_PHRASES = {
    "help": {
        "bn": "সাহায্য করুন",
        "hi": "मदद करो",
        "th": "ช่วยด้วย",
        "my": "ကူညီပါ",
        "ne": "मद्दत गर्नुहोस्",
        "si": "උදව් කරන්න"
    },
    "call ambulance": {
        "bn": "অ্যাম্বুলেন্স ডাকুন",
        "hi": "एम्बुलेंस बुलाओ",
        "th": "เรียกรถพยาบาล",
        "my": "ဆေးရုံကားခေါ်ပေးပါ",
        "ne": "एम्बुलेन्स बोलाउनुहोस्",
        "si": "ගිලන් රථය කැඳවන්න"
    },
    "do not move": {
        "bn": "সরাবেন না",
        "hi": "मत हिलाओ",
        "th": "อย่าขยับ",
        "my": "မရွှေ့ပါနဲ့",
        "ne": "नसार्नुहोस्",
        "si": "නොනොවන්න"
    },
    "i am injured": {
        "bn": "আমি আহত",
        "hi": "मैं घायल हूं",
        "th": "ฉันบาดเจ็บ",
        "my": "ကျွန်တော်ထိခိုက်သည်",
        "ne": "म घाइते भएँ",
        "si": "මම তුවාල ලබා ඇත"
    },
}

LANG_MAP = {
    "bangla": "bn", "bengali": "bn", "hindi": "hi",
    "thai": "th",   "burmese": "my", "myanmar": "my",
    "nepali": "ne", "sinhala": "si",
}


@mcp.tool()
def translate_emergency_phrase(phrase: str, target_language: str) -> dict:
    """
    Translates a key emergency phrase into a BIMSTEC language.
    Works fully offline from the pre-cached phrase library.
    Supported: Bangla, Hindi, Thai, Burmese, Nepali, Sinhala.
    """
    phrase_key = phrase.lower().strip()
    lang_code = LANG_MAP.get(target_language.lower(), target_language.lower())

    if phrase_key in EMERGENCY_PHRASES and lang_code in EMERGENCY_PHRASES[phrase_key]:
        return {
            "original": phrase,
            "translated": EMERGENCY_PHRASES[phrase_key][lang_code],
            "language": target_language,
            "success": True,
        }
    return {
        "original": phrase,
        "translated": phrase,
        "language": target_language,
        "success": False,
    }


@mcp.tool()
def get_available_languages() -> dict:
    """Lists all supported BIMSTEC emergency languages."""
    return {
        "languages": ["Bangla","Hindi","Thai","Burmese","Nepali","Sinhala"],
        "language_codes": ["bn","hi","th","my","ne","si"],
        "phrase_count": len(EMERGENCY_PHRASES),
        "offline": True,
    }


@mcp.tool()
def get_bystander_card(victim_condition: str, language: str) -> dict:
    """
    Generates a bystander-readable emergency card in the target language.
    Designed to be shown on the victim's phone to nearby bystanders.
    """
    lang_code = LANG_MAP.get(language.lower(), "bn")
    templates = {
        "bn": f"এই ব্যক্তি আহত। অ্যাম্বুলেন্স ডাকা হয়েছে। তাকে সরাবেন না। অবস্থা: {victim_condition}",
        "hi": f"यह व्यक्ति घायल है। एम्बुलेंस बुलाई है। हिलाएं मत। स्थिति: {victim_condition}",
        "th": f"บุคคลนี้บาดเจ็บ เรียกรถพยาบาลแล้ว อย่าขยับ สภาพ: {victim_condition}",
    }
    return {
        "card_text": templates.get(lang_code, templates["bn"]),
        "language": language,
        "show_fullscreen": True,
    }


if __name__ == "__main__":
    mcp.run(transport="stdio")
