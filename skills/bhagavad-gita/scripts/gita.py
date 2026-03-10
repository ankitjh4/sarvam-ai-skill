#!/usr/bin/env python3
"""Bhagavad Gita API wrapper"""
import requests
import sys
import json

BASE_URL = "https://bhagavadgitaapi.in"

def get_verse(chapter, verse, lang="en"):
    url = f"{BASE_URL}/slok/{chapter}/{verse}/"
    params = {"lan" if lang == "sa" else "l" if lang != "en" else "l": lang}
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    data = resp.json()
    print(f"Chapter {chapter}, Verse {verse}:")
    print(f"{data.get('Verse', '')}")
    if lang != "sa":
        print(f"\nTranslation: {data.get('et', data.get('meaning', ''))}")
    return data

def get_chapter(chapter, lang="en"):
    url = f"{BASE_URL}/chapter/{chapter}/"
    resp = requests.get(url)
    resp.raise_for_status()
    data = resp.json()
    print(f"Chapter {chapter}: {data.get('name', '')} ({data.get('name_translated', '')})")
    print(f"Verses: {data.get('verses_count', '')}")
    print(f"\n{data.get('chapter_summary', '')}")
    return data

def search_keyword(keyword):
    # Simple search - would need to fetch all and filter
    print(f"Searching for '{keyword}'...")
    print("Note: Full-text search not available via API. Try specific chapter/verse.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python gita.py [verse|chapter|search] [args]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    if cmd == "verse" and len(sys.argv) >= 3:
        parts = sys.argv[2].split('.')
        get_verse(int(parts[0]), int(parts[1]))
    elif cmd == "chapter" and len(sys.argv) >= 3:
        get_chapter(int(sys.argv[2]))
    elif cmd == "search" and len(sys.argv) >= 3:
        search_keyword(sys.argv[2])
    else:
        print("Invalid command")

if __name__ == "__main__":
    main()
