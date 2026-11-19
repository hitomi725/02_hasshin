import { test} from "node:test";
import assert from "node:assert/strict";
import { createRequire} from "node:module";
const require = createRequire(import.meta.url);
const Hasshin = require("./logic.js");

const SAMPLE = `曜日｜場所｜本文｜タグ｜写真案
水｜Instagram｜お客様の声をご紹介します。「においが消えて、子どもの咳が減りました」とのこと。うれしいです。｜#エアコンクリーニング #お客様の声｜作業後のエアコンの正面
月｜Instagram｜今週もよろしくお願いします。月曜は道具の手入れの日。きれいな道具で、きれいな仕上がりを。｜#エアコンクリーニング #道具｜並べた道具
火｜X｜エアコンの中、のぞいたことありますか？ 見えない奥にカビやホコリがたまると、風がにおったり電気代が上がったりします。年に1回の分解洗浄で、送風ファンまでまるごとキレイに。今週は平日の午前中にまだ空きがあります。ご予約はプロフィールのリンクから、お気軽にどうぞ。いつも見てくださってありがとうございます！！｜｜分解した送風ファン
木｜LINE｜11月のご予約、残り5枠です。ご希望の日をこのLINEに送ってください。｜｜カレンダーの画像
金｜Instagram｜洗う前と洗った後をくらべてみました。水の色を見てください。｜#エアコンクリーニング #掃除 #お掃除 #夏支度 #暮らし #住まい #カビ対策 #節電 #子育て #家事 #ハウスクリーニング｜バケツの水の前後
土｜X｜週末はご家族そろってお出かけですか？ エアコンも一休み。お出かけ前に「切」を確かめてくださいね。｜#節電｜リモコン
日｜お知らせ｜年末は混み合います。12月のご予約は11月中がおすすめです。｜｜
祝｜Instagram｜祝日の営業のお知らせ｜｜`;

test("取り込めるのは7本、はじくのは1本（9行目・曜日がおかしい）", () => {
const { items, errors} = Hasshin.parse(SAMPLE);
assert.equal(items.length, 7);
assert.equal(errors.length, 1);
assert.equal(errors[0].line, 9);
assert.match(errors[0].reason, /曜日/);
});

test("並びは 月火水木金土日", () => {
const { items} = Hasshin.parse(SAMPLE);
assert.equal(items.map((i) => i.weekday).join(""), "月火水木金土日");
});

test("火曜のXは152字で12字オーバー", () => {
const { items} = Hasshin.parse(SAMPLE);
const tue = items.find((i) => i.weekday === "火");
const { count, warnings} = Hasshin.check(tue);
assert.equal(count, 152);
assert.deepEqual(warnings, ["Xは140字まで。12字オーバー"]);
});

test("金曜はタグが11個で多すぎ", () => {
const { items} = Hasshin.parse(SAMPLE);
const fri = items.find((i) => i.weekday === "金");
assert.deepEqual(Hasshin.check(fri).warnings, ["タグが11個。多すぎ（目安10個）"]);
});

test("ほかの5本は注意なし", () => {
const { items} = Hasshin.parse(SAMPLE);
for (const d of ["月", "水", "木", "土", "日"]) {
const item = items.find((i) => i.weekday === d);
assert.deepEqual(Hasshin.check(item).warnings, [], d);
}
});

test("月曜のコピー用の文", () => {
const { items} = Hasshin.parse(SAMPLE);
const mon = items.find((i) => i.weekday === "月");
assert.equal(
Hasshin.copyText(mon),
"今週もよろしくお願いします。月曜は道具の手入れの日。きれいな道具で、きれいな仕上がりを。\n\n#エアコンクリーニング #道具"
);
});
