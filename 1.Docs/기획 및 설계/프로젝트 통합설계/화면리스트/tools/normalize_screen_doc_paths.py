#!/usr/bin/env python3
"""Normalize screen document file references to the current BrandPosApp/PosUi TypeScript layout.

This script rewrites legacy `.js` references inside the screen documentation set
under `화면설계,구조,요소/` so the document paths match the current source tree:

- React screens/components -> `.tsx`
- hooks, store, bridge, utils, adapters, commands -> `.ts`

It is intentionally conservative and only rewrites path-like tokens that end in
`.js`. Markdown prose that does not look like a path is left untouched.
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


PATH_TOKEN_RE = re.compile(r"(?P<path>[A-Za-z0-9_.\-\[\]/]+\.js)\b")


@dataclass(frozen=True)
class RewriteRule:
    needle: str
    ext: str


TS_RULES: tuple[RewriteRule, ...] = (
    RewriteRule("/hooks/", ".ts"),
    RewriteRule("/store/", ".ts"),
    RewriteRule("/bridge/", ".ts"),
    RewriteRule("/utils/", ".ts"),
    RewriteRule("/commands/", ".ts"),
    RewriteRule("/mocks/", ".ts"),
    RewriteRule("/adapters/", ".ts"),
    RewriteRule("/services/", ".ts"),
    RewriteRule("/slices/", ".ts"),
    RewriteRule("/types/", ".ts"),
    RewriteRule("/constants.js", ".ts"),
    RewriteRule("/rootReducer.js", ".ts"),
)

TSX_RULES: tuple[RewriteRule, ...] = (
    RewriteRule("/screens/", ".tsx"),
    RewriteRule("/shared/ui/", ".tsx"),
    RewriteRule("/app/", ".tsx"),
    RewriteRule("/providers/", ".tsx"),
    RewriteRule("/components/", ".tsx"),
    RewriteRule("/visualizations/", ".tsx"),
    RewriteRule("/concepts/", ".tsx"),
    RewriteRule("/specialized/", ".tsx"),
    RewriteRule("/molecules/", ".tsx"),
    RewriteRule("/organisms/", ".tsx"),
    RewriteRule("/atoms/", ".tsx"),
    RewriteRule("/templates/", ".tsx"),
)


def guess_extension(path: str) -> str:
    lowered = path.lower()

    for rule in TS_RULES:
        if rule.needle in lowered:
            return rule.ext

    if "/app/" in lowered:
        return ".tsx"

    for rule in TSX_RULES:
        if rule.needle in lowered:
            return rule.ext

    if lowered.endswith("/index.js"):
        return ".tsx"
    if lowered.endswith("/page.js") or lowered.endswith("/layout.js"):
        return ".tsx"

    return ".tsx"


def rewrite_text(text: str) -> tuple[str, int]:
    count = 0

    def _replace(match: re.Match[str]) -> str:
        nonlocal count
        original = match.group("path")
        replacement = original[:-3] + guess_extension(original)
        if replacement != original:
            count += 1
        return replacement

    new_text = PATH_TOKEN_RE.sub(_replace, text)
    return new_text, count


def iter_markdown_files(root: Path) -> Iterable[Path]:
    yield from sorted(root.glob("*.md"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(
            "/Users/hyojae/projects/Platform/1.Docs/기획 및 설계/프로젝트 통합설계/화면리스트/화면설계,구조,요소"
        ),
        help="Markdown root to normalize",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print changes without writing files",
    )
    args = parser.parse_args()

    total_files = 0
    changed_files = 0
    total_rewrites = 0

    for file_path in iter_markdown_files(args.root):
        total_files += 1
        original = file_path.read_text(encoding="utf-8")
        rewritten, rewrites = rewrite_text(original)
        if rewrites:
            changed_files += 1
            total_rewrites += rewrites
            if not args.dry_run:
                file_path.write_text(rewritten, encoding="utf-8")
        if args.dry_run and rewrites:
            print(f"{file_path.name}: {rewrites} replacements")

    print(
        f"processed={total_files} changed={changed_files} replacements={total_rewrites} dry_run={args.dry_run}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
