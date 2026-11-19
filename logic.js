// 発信の1週間まとめ書き - 計算の部品
// ブラウザでは window.Hasshin、Node では module.exports で使う
(function () {
  const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];
  const PLACES = ["Instagram", "X", "LINE", "お知らせ"];
  const LIMITS = { Instagram: 2200, X: 140, LINE: 500, "お知らせ": null };

  function countChars(str) {
    return [...String(str || "")].length;
  }

  function parseTags(tagField) {
    if (!tagField) return [];
    return String(tagField).trim().split(/\s+/).filter(Boolean);
  }

  function parse(text) {
    const items = [];
    const errors = [];
    const lines = String(text || "").split(/\r?\n/);
    lines.forEach((raw, idx) => {
      const lineNo = idx + 1; // 見出しも1行と数える
      const line = raw.trim();
      if (lineNo === 1 && line.startsWith("曜日")) return; // 見出しは飛ばす
      if (line === "") return;
      const parts = line.split(/[｜|]/).map((s) => (s == null ? "" : s.trim()));
      const weekday = parts[0] || "";
      const place = parts[1] || "";
      const body = parts[2] || "";
      const tags = parseTags(parts[3] || "");
      const photo = parts[4] || "";
      if (!WEEKDAYS.includes(weekday)) {
        errors.push({ line: lineNo, reason: "曜日がおかしい" });
        return;
      }
      if (!PLACES.includes(place)) {
        errors.push({ line: lineNo, reason: "場所がおかしい" });
        return;
      }
      if (!body) {
        errors.push({ line: lineNo, reason: "本文がおかしい" });
        return;
      }
      items.push({ weekday, place, body, tags, photo, line: lineNo });
    });
    items.sort((a, b) => WEEKDAYS.indexOf(a.weekday) - WEEKDAYS.indexOf(b.weekday));
    return { items, errors };
  }

  function check(item) {
    const warnings = [];
    let textForCount = item.body || "";
    if (item.place === "X") {
      const tags = Array.isArray(item.tags) ? item.tags : parseTags(item.tags);
      if (tags.length > 0) textForCount = textForCount + " " + tags.join(" ");
    }
    const count = countChars(textForCount);
    const limit = LIMITS[item.place];
    if (limit != null && count > limit) {
      warnings.push(`${item.place}は${limit}字まで。${count - limit}字オーバー`);
    }
    const tagCount = Array.isArray(item.tags) ? item.tags.length : parseTags(item.tags).length;
    if (tagCount > 10) {
      warnings.push(`タグが${tagCount}個。多すぎ（目安10個）`);
    }
    return { count, warnings };
  }

  function copyText(item) {
    const tags = Array.isArray(item.tags) ? item.tags : parseTags(item.tags);
    if (tags && tags.length > 0) return `${item.body}\n\n${tags.join(" ")}`;
    return item.body || "";
  }

  const Hasshin = { parse, check, copyText };
  if (typeof module !== "undefined" && module.exports) module.exports = Hasshin;
  if (typeof window !== "undefined") window.Hasshin = Hasshin;
})();
