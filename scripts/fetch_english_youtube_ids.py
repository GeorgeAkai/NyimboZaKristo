"""
Match GCCSATX hymns to YouTube performances of the SAME song.

Up to 5 options per hymn:
  - Daniel Baptist, Classic Hymns, and/or Kaleb Brasee when a title-matched video exists
  - Remaining slots: other choirs/channels, one video per channel, strict title match
"""
import json
import re
import sys
import time
import unicodedata
from pathlib import Path
from urllib.parse import quote_plus

from yt_dlp import YoutubeDL

DATA_PATH = Path("src/data/gccsatx-hymns.json")
MAX_SEARCH = 12
MAX_OPTIONS = 5
MIN_TITLE_MATCH = 0.55
SLEEP_SECONDS = 0.4

PREFERRED_CHANNELS = [
    {
        "name": "Daniel Baptist",
        "keywords": ["daniel baptist", "danielbaptist"],
        "search_urls": ["https://www.youtube.com/@danielbaptist1611/search?query={query}"],
        "tier": 0,
    },
    {
        "name": "Classic Hymns",
        "keywords": ["classic hymns", "classichymns"],
        "search_urls": ["https://www.youtube.com/@classichymns8110/search?query={query}"],
        "tier": 1,
    },
    {
        "name": "Kaleb Brasee",
        "keywords": ["kaleb brasee", "caleb brasse", "kbrasee", "brasee"],
        "search_urls": ["https://www.youtube.com/@kbrasee/search?query={query}"],
        "tier": 2,
    },
]

CHOIR_CHANNEL_KEYWORDS = [
    "tabernacle choir",
    "the tabernacle choir",
    "mormon tabernacle choir",
    "choir",
    "chorale",
    "hymn",
    "hymnal",
    "congregational",
    "worship",
    "acapella",
    "acappella",
]

NEGATIVE_VIDEO_KEYWORDS = [
    "sermon",
    "bible study",
    "devotional",
    "podcast",
    "explained",
    "commentary",
    "lesson",
    "conference",
    "youth group",
    "vbs",
    "tutorial",
    "how to play",
    "piano lesson",
    "worship service",
    "traditional worship",
    "pastor",
    "preaching",
    "medley",
    "playlist",
    "hour of",
    "hours of",
    "treasured hymns",
    "popular hymns",
    "hymns collection",
    "hymn collection",
    "full album",
]

YTSEARCH_QUERIES = [
    "Daniel Baptist",
    "Classic Hymns",
    "Kaleb Brasee",
    "Tabernacle Choir at Temple Square",
    "hymn choir",
]


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def title_tokens(title: str) -> list[str]:
    tokens = [t for t in normalize(title).split() if len(t) > 2]
    if len(tokens) < 2:
        tokens = [t for t in normalize(title).split() if len(t) > 1]
    return tokens


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


def preferred_channel_tier(channel: str) -> int:
    blob = normalize(channel)
    for preferred in PREFERRED_CHANNELS:
        for keyword in preferred["keywords"]:
            if normalize(keyword) in blob:
                return preferred["tier"]
    return 9


def normalize_channel_key(channel: str) -> str:
    return normalize(channel)


def title_match_ratio(hymn_title: str, video_title: str) -> float:
    tokens = title_tokens(hymn_title)
    if not tokens:
        return 0.0
    video_norm = normalize(video_title)
    matched = sum(1 for token in tokens if token in video_norm)
    return matched / len(tokens)


def is_same_song(hymn_title: str, entry: dict) -> bool:
    video_title = (entry.get("title") or "").strip()
    if not video_title:
        return False

    video_norm = normalize(video_title)
    for keyword in NEGATIVE_VIDEO_KEYWORDS:
        if keyword in video_norm:
            return False

    ratio = title_match_ratio(hymn_title, video_title)
    if ratio < MIN_TITLE_MATCH:
        return False

    hymn_norm = normalize(hymn_title.split(",")[0])
    if len(hymn_norm) >= 10 and hymn_norm not in video_norm:
        significant = [t for t in title_tokens(hymn_title) if len(t) > 4]
        if significant and not any(word in video_norm for word in significant):
            return False

    # Reject compilations where the hymn name is only part of a long title
    if len(video_norm) > len(hymn_norm) * 2.5 and ratio < 0.85:
        return False

    if re.search(r"\b\d+\s+(popular|treasured|gospel|best|great|all time)\s+hymns\b", video_norm):
        return False

    if re.search(r"\b(and|&)\s+(just|how|amazing|holy|it is well|blessed)\b", video_norm):
        if ratio < 0.92:
            return False

    # Scripture/chapter titles: require stronger signal
    if re.search(r"\b\d+\s+\w+\s+\d", hymn_norm) and ratio < 0.75:
        if "hymn" not in video_norm and "congregational" not in video_norm:
            return False

    return True


def score_candidate(hymn_title: str, entry: dict) -> float:
    if not is_same_song(hymn_title, entry):
        return -1.0

    video_title = normalize(entry.get("title", ""))
    channel = normalize(entry.get("uploader", "") or entry.get("channel", ""))
    match_ratio = title_match_ratio(hymn_title, video_title)

    tier = preferred_channel_tier(channel)
    tier_bonus = {0: 0.35, 1: 0.3, 2: 0.28}.get(tier, 0.0)
    if tier == 9:
        for keyword in CHOIR_CHANNEL_KEYWORDS:
            if keyword in channel or keyword in video_title:
                tier_bonus = max(tier_bonus, 0.12)
                break

    hymn_bonus = 0.08 if "hymn" in video_title else 0.0
    short_hymn = normalize(hymn_title.split(",")[0])
    start_bonus = 0.15 if video_title.startswith(short_hymn[: min(len(short_hymn), 20)]) else 0.0
    congregational_bonus = 0.1 if "congregational" in video_title else 0.0
    return match_ratio + tier_bonus + hymn_bonus + start_bonus + congregational_bonus


def flatten_entries(info) -> list[dict]:
    if not info:
        return []
    entries = info.get("entries")
    if entries:
        return [entry for entry in entries if entry]
    return [info]


def search_entries(ydl: YoutubeDL, target: str) -> list[dict]:
    try:
        info = ydl.extract_info(target, download=False)
    except Exception:
        return []
    return flatten_entries(info)


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


def collect_candidates(hymn_title: str) -> list[tuple[float, dict]]:
    short_title = hymn_title.split(",")[0].strip()
    queries = list(dict.fromkeys([hymn_title, short_title, f"{short_title} hymn"]))

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
        for query in queries[:2]:
            for preferred in PREFERRED_CHANNELS:
                for template in preferred["search_urls"]:
                    url = template.format(query=quote_plus(query))
                    for entry in search_entries(ydl, url):
                        video_id = (entry.get("id") or "").strip()
                        if not is_valid_video_id(video_id) or video_id in seen_ids:
                            continue
                        seen_ids.add(video_id)
                        score = score_candidate(hymn_title, entry)
                        if score >= 0:
                            ranked.append((score, entry))

            for channel_name in YTSEARCH_QUERIES:
                yt_query = f"ytsearch{MAX_SEARCH}:{query} {channel_name}"
                for entry in search_entries(ydl, yt_query):
                    video_id = (entry.get("id") or "").strip()
                    if not is_valid_video_id(video_id) or video_id in seen_ids:
                        continue
                    seen_ids.add(video_id)
                    score = score_candidate(hymn_title, entry)
                    if score >= 0:
                        ranked.append((score, entry))

    ranked.sort(key=lambda pair: pair[0], reverse=True)
    return ranked


def build_matched_options(hymn_title: str, ranked: list[tuple[float, dict]]) -> list[dict]:
    """
    Slots 1–3: best title match on Daniel Baptist / Classic Hymns / Kaleb Brasee (if available).
    Slots 4–5: best title matches on other channels (one per channel).
    """
    options: list[dict] = []
    used_ids: set[str] = set()
    used_channels: set[str] = set()

    def try_add(entry: dict) -> bool:
        option = entry_to_option(entry)
        if not option:
            return False
        channel_key = normalize_channel_key(option["channel"])
        if option["id"] in used_ids:
            return False
        if channel_key in used_channels:
            return False
        options.append(option)
        used_ids.add(option["id"])
        used_channels.add(channel_key)
        return True

    for tier in (0, 1, 2):
        tier_entries = [
            entry
            for score, entry in ranked
            if preferred_channel_tier(entry.get("uploader") or entry.get("channel") or "") == tier
        ]
        for entry in tier_entries:
            if len(options) >= MAX_OPTIONS:
                break
            try_add(entry)
            break

    for _, entry in ranked:
        if len(options) >= MAX_OPTIONS:
            break
        tier = preferred_channel_tier(entry.get("uploader") or entry.get("channel") or "")
        if tier in (0, 1, 2):
            continue
        try_add(entry)

    return options[:MAX_OPTIONS]


def search_video_options(hymn_title: str) -> list[dict]:
    ranked = collect_candidates(hymn_title)
    return build_matched_options(hymn_title, ranked)


def main() -> None:
    if not DATA_PATH.exists():
        print(f"Missing {DATA_PATH}. Run: npm run import:gccsatx")
        sys.exit(1)

    only_missing = "--only-missing" in sys.argv
    force = "--force" in sys.argv

    hymns = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    matched = 0
    skipped = 0
    total = len(hymns)

    for index, hymn in enumerate(hymns):
        hymn_title = hymn.get("title", "").strip() or hymn.get("first_line", "").strip()
        if not hymn_title:
            continue

        if only_missing and not force and hymn.get("youtube_id") and hymn.get("youtube_options"):
            skipped += 1
            continue

        options = search_video_options(hymn_title)
        if options:
            hymn["youtube_options"] = options
            hymn["youtube_id"] = options[0]["id"]
            matched += 1
            channels = " | ".join(opt.get("channel", "?") for opt in options)
            print(f"[{index + 1}/{total}] {hymn.get('id')}: {hymn_title} -> {channels}", flush=True)
        else:
            hymn["youtube_options"] = []
            hymn["youtube_id"] = ""
            print(f"[{index + 1}/{total}] No match: {hymn.get('id')}: {hymn_title}", flush=True)

        if (index + 1) % 5 == 0:
            DATA_PATH.write_text(json.dumps(hymns, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        time.sleep(SLEEP_SECONDS)

    DATA_PATH.write_text(json.dumps(hymns, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nMatched {matched}/{total} hymns ({skipped} skipped)", flush=True)


if __name__ == "__main__":
    main()
