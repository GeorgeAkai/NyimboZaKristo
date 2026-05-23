"""Re-sort existing youtube_options so preferred hymn channels lead when present."""
import json
from pathlib import Path

DATA_PATH = Path("src/data/gccsatx-hymns.json")

PREFERRED_TERMS = [
    "daniel baptist",
    "classic hymns",
    "kaleb brasee",
    "caleb brasse",
    "brasee",
    "tabernacle choir",
]


def preference_score(option: dict) -> int:
    blob = f"{option.get('title', '')} {option.get('channel', '')}".lower()
    score = 0
    for idx, term in enumerate(PREFERRED_TERMS):
        if term in blob:
            score += 100 - idx
    return score


def main() -> None:
    if not DATA_PATH.exists():
        print(f"Missing {DATA_PATH}")
        return

    hymns = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    changed = 0

    for hymn in hymns:
        options = hymn.get("youtube_options")
        if not isinstance(options, list) or len(options) < 2:
            continue

        before = options[0].get("id", "")
        sorted_options = sorted(options, key=preference_score, reverse=True)
        hymn["youtube_options"] = sorted_options[:5]
        hymn["youtube_id"] = hymn["youtube_options"][0].get("id", hymn.get("youtube_id", ""))
        if before != hymn["youtube_options"][0].get("id", ""):
            changed += 1

    DATA_PATH.write_text(json.dumps(hymns, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Re-prioritized {changed} hymns in {DATA_PATH.name}")


if __name__ == "__main__":
    main()
