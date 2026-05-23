import json
import re
import unicodedata
from pathlib import Path

DATA_PATH = Path("src/data/hymns.json")

PREFERRED_TERMS = [
    "jesca mshani",
    "irene michael",
    "nyimbozakristosdaofficial",
    "nyimbo za kristo sda",
    "mjmusicclassics",
    "rjhopetv",
    "kirumbaadventistchoirkac6823",
    "kirumba adventist choir",
]


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9\\s]", " ", text)
    text = re.sub(r"\\s+", " ", text).strip()
    return text


def preference_score(option: dict) -> int:
    blob = normalize(f"{option.get('title', '')} {option.get('channel', '')}")
    score = 0
    for idx, term in enumerate(PREFERRED_TERMS):
        if normalize(term) in blob:
            score += 100 - idx
    return score


def main() -> None:
    hymns = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    reprioritized = 0

    for hymn in hymns:
        options = hymn.get("youtube_options")
        if not isinstance(options, list) or not options:
            continue

        before_top = options[0].get("id", "")
        sorted_options = sorted(
            options,
            key=lambda opt: (preference_score(opt), bool(opt.get("channel"))),
            reverse=True,
        )

        hymn["youtube_options"] = sorted_options[:5]
        hymn["youtube_id"] = hymn["youtube_options"][0].get("id", hymn.get("youtube_id", ""))

        after_top = hymn["youtube_options"][0].get("id", "")
        if before_top != after_top:
            reprioritized += 1

    DATA_PATH.write_text(json.dumps(hymns, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Re-prioritized top picks for {reprioritized} hymns.")


if __name__ == "__main__":
    main()
