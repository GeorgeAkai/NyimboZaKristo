"""
Match Igbo Abu hymns to YouTube performances (up to 3 options, one per channel).

Uses english_hint when available (often the English hymn title), plus Igbo title.
"""
import json
import re
import sys
import time
import unicodedata
from pathlib import Path

from yt_dlp import YoutubeDL

DATA_PATH = Path("src/data/igbo-hymns.json")
MAX_SEARCH = 10
MAX_OPTIONS = 3
MIN_TITLE_MATCH = 0.45
SLEEP_SECONDS = 0.35

PREFERRED_CHANNEL_KEYWORDS = [
    "igbo",
    "abu",
    "sda",
    "adventist",
    "seventh day",
    "seventh-day",
    "nigeria",
    "choir",
    "hymn",
    "worship",
    "congregational",
]

NEGATIVE_VIDEO_KEYWORDS = [
    "sermon",
    "bible study",
    "devotional",
    "podcast",
    "commentary",
    "lesson",
    "conference",
    "tutorial",
    "piano lesson",
    "medley",
    "playlist",
    "full album",
    "hours of",
    "non stop",
    "nonstop",
    "worship session",
    "live worship",
    "midnight worship",
]


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def is_valid_video_id(value: str) -> bool:
    return bool(re.fullmatch(r"[a-zA-Z0-9_-]{11}", (value or "").strip()))


def channel_url(entry: dict) -> str:
    channel_id = (entry.get("channel_id") or "").strip()
    if channel_id:
        return f"https://www.youtube.com/channel/{channel_id}"
    uploader_url = (entry.get("uploader_url") or "").strip()
    if uploader_url.startswith("http"):
        return uploader_url
    return ""


def clean_english_hint(value: str) -> str:
    text = (value or "").strip()
    # Drop leading scripture refs: "Aisaia 6. 3. Holy, Holy..."
    text = re.sub(
        r"^[\d\s\w.-]+\s+\d+\.?\s*\d*\.?\s*",
        "",
        text,
        count=1,
        flags=re.IGNORECASE,
    )
    text = re.sub(r"^[\d\s\w.-]+\s+\d+\.?\s*", "", text, count=1, flags=re.IGNORECASE)
    return text.strip(" .")


def title_tokens(title: str) -> list[str]:
    tokens = [t for t in normalize(title).split() if len(t) > 2]
    if len(tokens) < 2:
        tokens = [t for t in normalize(title).split() if len(t) > 1]
    return tokens


def title_match_ratio(reference: str, video_title: str) -> float:
    tokens = title_tokens(reference)
    if not tokens:
        return 0.0
    video_norm = normalize(video_title)
    matched = sum(1 for token in tokens if token in video_norm)
    return matched / len(tokens)


IGBO_MARKERS = [
    "igbo",
    "sda",
    "adventist",
    "seventh day",
    "seventh-day",
    "nigeria",
    "nso",
    "chineke",
    "chuku",
    "jehova",
]


def has_igbo_marker(blob: str) -> bool:
    if any(marker in blob for marker in IGBO_MARKERS):
        return True
    return bool(re.search(r"\babu\b", blob))


COMMON_IGBO_TITLES = [
    "ato nim",
    "nso nso nso",
    "chineke nna",
]


def is_common_title(title: str) -> bool:
    norm = normalize(title)
    return any(fragment in norm for fragment in COMMON_IGBO_TITLES)


def is_igbo_relevant(hymn: dict, entry: dict) -> bool:
    blob = normalize(
        f"{entry.get('title', '')} {entry.get('uploader', '')} {entry.get('channel', '')}",
    )
    if not has_igbo_marker(blob):
        return False

    video_title = (entry.get("title") or "").strip()
    english = clean_english_hint(hymn.get("english_hint", ""))
    if english and title_match_ratio(english, video_title) >= 0.35:
        return True

    first_line = (hymn.get("first_line") or "").strip()
    if first_line and title_match_ratio(first_line[:100], video_title) >= 0.25:
        return True

    igbo_title = (hymn.get("title") or "").strip()
    if is_common_title(igbo_title):
        return False

    tokens = title_tokens(igbo_title)
    if not tokens:
        return False
    matched = sum(1 for token in tokens if token in blob)
    return matched >= min(2, len(tokens))


def score_candidate(hymn: dict, reference_titles: list[str], entry: dict) -> float:
    if not is_igbo_relevant(hymn, entry):
        return -1.0

    video_title = (entry.get("title") or "").strip()
    if not video_title:
        return -1.0

    video_norm = normalize(video_title)
    for keyword in NEGATIVE_VIDEO_KEYWORDS:
        if keyword in video_norm:
            return -1.0

    best_ratio = max(title_match_ratio(ref, video_title) for ref in reference_titles if ref)
    if best_ratio < MIN_TITLE_MATCH:
        return -1.0

    channel = normalize(entry.get("uploader", "") or entry.get("channel", ""))
    channel_bonus = 0.0
    for keyword in PREFERRED_CHANNEL_KEYWORDS:
        if keyword in channel or keyword in video_norm:
            channel_bonus = max(channel_bonus, 0.15)

    igbo_bonus = 0.15 if "igbo" in video_norm or "igbo" in channel else 0.0
    hymn_bonus = 0.08 if "hymn" in video_norm or "abu" in video_norm else 0.0
    return best_ratio + channel_bonus + igbo_bonus + hymn_bonus


def entry_to_option(entry: dict) -> dict | None:
    video_id = (entry.get("id") or "").strip()
    if not is_valid_video_id(video_id):
        return None
    channel = (entry.get("uploader") or entry.get("channel") or "").strip()
    return {
        "id": video_id,
        "title": (entry.get("title") or "").strip(),
        "channel": channel,
        "channel_url": channel_url(entry),
        "video_url": f"https://www.youtube.com/watch?v={video_id}",
    }


def search_entries(ydl: YoutubeDL, target: str) -> list[dict]:
    try:
        info = ydl.extract_info(target, download=False)
    except Exception:
        return []
    entries = info.get("entries") if info else None
    if entries:
        return [entry for entry in entries if entry]
    return [info] if info else []


def reference_titles(hymn: dict) -> list[str]:
    titles = []
    english = clean_english_hint(hymn.get("english_hint", ""))
    igbo = (hymn.get("title") or "").strip()
    if english:
        titles.append(english)
        short = english.split(",")[0].strip()
        if short and short not in titles:
            titles.append(short)
    if igbo and igbo not in titles:
        titles.append(igbo)
    return titles


def search_queries(hymn: dict) -> list[str]:
    refs = reference_titles(hymn)
    queries: list[str] = []
    for ref in refs:
        queries.append(ref)
        queries.append(f"{ref} Igbo hymn")
        queries.append(f"SDA Igbo {ref}")
    subtitle = (hymn.get("subtitle") or "").strip()
    if subtitle:
        queries.append(f"Igbo hymn {subtitle[:60]}")
    return list(dict.fromkeys(q for q in queries if q.strip()))


def search_video_options(hymn: dict) -> list[dict]:
    refs = reference_titles(hymn)
    if not refs:
        return []

    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "extract_flat": "in_playlist",
        "ignoreerrors": True,
        "no_warnings": True,
    }

    ranked: list[tuple[float, dict]] = []
    seen_ids: set[str] = set()

    with YoutubeDL(ydl_opts) as ydl:
        for query in search_queries(hymn)[:4]:
            target = f"ytsearch{MAX_SEARCH}:{query}"
            for entry in search_entries(ydl, target):
                video_id = (entry.get("id") or "").strip()
                if not is_valid_video_id(video_id) or video_id in seen_ids:
                    continue
                seen_ids.add(video_id)
                score = score_candidate(hymn, refs, entry)
                if score >= 0:
                    ranked.append((score, entry))

    ranked.sort(key=lambda pair: pair[0], reverse=True)

    options: list[dict] = []
    used_channels: set[str] = set()
    for _, entry in ranked:
        option = entry_to_option(entry)
        if not option:
            continue
        channel_key = normalize(option["channel"])
        if option["id"] in {opt["id"] for opt in options}:
            continue
        if channel_key in used_channels:
            continue
        options.append(option)
        used_channels.add(channel_key)
        if len(options) >= MAX_OPTIONS:
            break

    return options


def main() -> None:
    if not DATA_PATH.exists():
        print(f"Missing {DATA_PATH}. Run: npm run import:igbo-abu")
        sys.exit(1)

    only_missing = "--only-missing" in sys.argv
    force = "--force" in sys.argv
    limit = None
    for arg in sys.argv[1:]:
        if arg.startswith("--limit="):
            limit = int(arg.split("=", 1)[1])

    hymns = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    if limit is not None:
        hymns = hymns[:limit]

    matched = 0
    skipped = 0
    total = len(hymns)

    for index, hymn in enumerate(hymns):
        if only_missing and not force and hymn.get("youtube_id") and hymn.get("youtube_options"):
            skipped += 1
            continue

        options = search_video_options(hymn)
        if options:
            hymn["youtube_options"] = options
            hymn["youtube_id"] = options[0]["id"]
            matched += 1
            channels = " | ".join(opt.get("channel", "?") for opt in options)
            print(f"[{index + 1}/{total}] #{hymn.get('id')}: {hymn.get('title')} -> {channels}", flush=True)
        else:
            hymn["youtube_options"] = []
            hymn["youtube_id"] = ""
            print(f"[{index + 1}/{total}] No match: #{hymn.get('id')}: {hymn.get('title')}", flush=True)

        hymn.setdefault("instrumental_url", "")

        if (index + 1) % 5 == 0:
            all_hymns = json.loads(Path(DATA_PATH).read_text(encoding="utf-8"))
            by_id = {h["id"]: h for h in all_hymns}
            for h in hymns:
                by_id[h["id"]] = h
            DATA_PATH.write_text(
                json.dumps(list(by_id.values()), ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

        time.sleep(SLEEP_SECONDS)

    all_hymns = json.loads(Path(DATA_PATH).read_text(encoding="utf-8"))
    by_id = {h["id"]: h for h in all_hymns}
    for h in hymns:
        by_id[h["id"]] = h
    merged = sorted(by_id.values(), key=lambda h: h["id"])
    DATA_PATH.write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nMatched {matched}/{total} hymns ({skipped} skipped)", flush=True)


if __name__ == "__main__":
    main()
