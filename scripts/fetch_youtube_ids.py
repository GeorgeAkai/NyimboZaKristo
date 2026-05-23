import json
import re
import time
import unicodedata
from pathlib import Path

from yt_dlp import YoutubeDL

DATA_PATH = Path("src/data/hymns.json")
MAX_RESULTS = 12
MAX_OPTIONS = 5
SLEEP_SECONDS = 0.4

PREFERRED_CHANNEL_KEYWORDS = [
    "kirumba",
    "echoes of joy",
    "msanii records",
    "nyimbo za kristo",
    "gideon kasozi",
    "ambassadors of christ",
    "sda",
    "adventist",
]


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def title_tokens(title: str) -> set[str]:
    return {t for t in normalize(title).split() if len(t) > 2}


def score_candidate(hymn_title: str, entry: dict) -> float:
    video_title = normalize(entry.get("title", ""))
    channel = normalize(entry.get("uploader", "") or entry.get("channel", ""))
    query_tokens = title_tokens(hymn_title)
    video_tokens = set(video_title.split())

    overlap = len(query_tokens & video_tokens)
    title_score = overlap / max(len(query_tokens), 1)

    channel_bonus = 0.0
    for keyword in PREFERRED_CHANNEL_KEYWORDS:
        if normalize(keyword) in channel:
            channel_bonus += 0.25

    lyric_bonus = 0.15 if "nyimbo" in video_title or "hymn" in video_title else 0.0
    return title_score + channel_bonus + lyric_bonus


def search_video_options(hymn_title: str) -> list[dict]:
    query = f"{hymn_title} nyimbo za kristo"
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "extract_flat": "in_playlist",
        "default_search": f"ytsearch{MAX_RESULTS}",
        "no_warnings": True,
    }

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(query, download=False)

    entries = info.get("entries", []) if info else []
    if not entries:
        return []

    ranked_entries = sorted(entries, key=lambda entry: score_candidate(hymn_title, entry), reverse=True)
    options = []
    used_ids = set()
    for entry in ranked_entries:
        video_id = (entry.get("id") or "").strip()
        if not video_id or video_id in used_ids:
            continue
        used_ids.add(video_id)
        options.append(
            {
                "id": video_id,
                "title": (entry.get("title") or "").strip(),
                "channel": (entry.get("uploader") or entry.get("channel") or "").strip(),
            }
        )
        if len(options) >= MAX_OPTIONS:
            break

    return options


def main() -> None:
    hymns = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    matched = 0
    options_matched = 0

    for hymn in hymns:
        hymn_title = hymn.get("title", "").strip()
        if not hymn_title:
            continue

        options = search_video_options(hymn_title)
        if options:
            hymn["youtube_options"] = options
            hymn["youtube_id"] = options[0]["id"]
            matched += 1
            options_matched += len(options)
            print(f"Matched {hymn['id']}: {hymn_title} -> {options[0]['id']} ({len(options)} options)")
        else:
            hymn["youtube_options"] = []
            print(f"No match for {hymn['id']}: {hymn_title}")

        time.sleep(SLEEP_SECONDS)

    DATA_PATH.write_text(json.dumps(hymns, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"\nUpdated hymns with youtube ids: {matched}/{len(hymns)}; "
        f"total options captured: {options_matched}"
    )


if __name__ == "__main__":
    main()
