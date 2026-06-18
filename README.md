# Morse Code Practice App

欧文モールス信号のリスニング練習用の静的アプリです。

## 実装済み

- 1文字、短い単語、複数語の短文、長めの文章の4レベル
- Web Audio API によるモールス音再生
- 入力した内容の正誤判定
- 速さ、ピッチ、文字間、語間の調整
- 後続のマイページ機能が読める形式での記録保存

## 保存データ

練習結果は `localStorage` の `morseListeningPractice.records.v1` に配列で保存します。

```json
{
  "id": "uuid",
  "type": "listening",
  "level": "character",
  "promptText": "A",
  "userAnswer": "A",
  "isCorrect": true,
  "settings": {
    "speedWpm": 18,
    "pitchHz": 650,
    "letterGapMultiplier": 1,
    "wordGapMultiplier": 1
  },
  "createdAt": "2026-06-06T00:00:00.000Z"
}
```

マイページ・設定画面は次のキーも使います。

- `morsePractice.settings.v1`: 音の速さ、ピッチ、音量、出題レベル、練習対象、表示テーマ
- `morsePractice.progress.v1`: 打鍵練習など、共通APIから登録された成績
- `morseListeningPractice.records.v1`: リスニング練習側の既存記録。マイページではこの記録も読み込んで集計します。

他機能から共通形式で記録する場合は、ブラウザ上で次のAPIを呼びます。

```js
window.MorsePracticeStore.recordAttempt({
  mode: "listening",
  level: "single",
  promptType: "morse-audio",
  prompt: ".-",
  expected: "A",
  answer: "A",
  correct: true
});
```

## 根拠

欧文モールスの符号表とタイミング比は ITU-R Recommendation M.1677-1, International Morse code を参照しています。

- https://www.itu.int/rec/R-REC-M.1677-1-200910-I/
