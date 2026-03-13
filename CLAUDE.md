# ギター基礎トレくん — CLAUDE.md

## プロジェクト概要

ギタリスト向けの基礎練習Webアプリスイート。
指板の音名暗記・ソルフェージュ・リズムトレーニングなど、
ギター上達に必要な基礎力を楽しく鍛えることを目的とする。

- **アプリ名**: ギター基礎トレくん
- **ターゲット**: ギター初心者〜中級者
- **デプロイ先**: レンタルサーバー（静的ファイル配信）

---

## 技術スタック

| 項目 | 採用技術 |
|------|----------|
| フレームワーク | React 18 + Vite |
| スタイリング | Tailwind CSS |
| ルーティング | React Router v6 |
| 音声 | Web Audio API（ライブラリなし） |
| 言語 | JavaScript（JSX） |
| パッケージ管理 | npm |

---

## ディレクトリ構成

```
guitar-suite/
├── CLAUDE.md
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx           # ルーティング定義
    ├── components/       # 共通UIコンポーネント
    │   ├── Layout.jsx    # 共通ヘッダー・ナビ
    │   └── MetronomeEngine.js  # Web Audio APIラッパー
    └── pages/            # 各トレーニング画面
        ├── Home.jsx      # トップ・メニュー画面
        ├── FretboardTrainer.jsx  # 指板音名トレーナー（実装済み）
        ├── Solfege.jsx           # ソルフェージュ（未実装）
        └── RhythmTrainer.jsx     # リズムトレーニング（未実装）
```

---

## 実装済み機能

### FretboardTrainer（指板音名トレーナー）
- A〜G#（12音）をランダム表示
- 8拍ごとに音名切り替え
- 7拍目に次の音名をプレビュー表示（オレンジ色・小さめ）
- BPM 40〜200、スライダーと±5ボタンで調整
- Web Audio APIでメトロノーム音（1拍目アクセント）
- ビートドット8個で現在拍を視覚表示

---

## コーディング規約

- コンポーネントは**関数コンポーネント + hooks**のみ使用
- ファイル名はPascalCase（例: `FretboardTrainer.jsx`）
- ユーティリティ・エンジン系はcamelCase（例: `metronomeEngine.js`）
- Tailwindクラスは長くなる場合 `clsx` でまとめる
- Web Audio APIの処理は必ずコンポーネント外に切り出す
- コメントは日本語でOK

---

## やってはいけないこと

- `useEffect` 内で直接 `setTimeout` を乱用しない（メトロノームは専用エンジンで管理）
- 音声処理をコンポーネントに直書きしない（`MetronomeEngine.js` に集約）
- `any` 型や未定義の変数を放置しない
- レンタルサーバーへの配信を想定するため、**サーバーサイド処理は持ち込まない**（完全静的）
- `npm run build` で生成した `dist/` フォルダをそのままサーバーにアップする想定

---

## ビルド・開発コマンド

```bash
npm install        # 初回セットアップ
npm run dev        # 開発サーバー起動
npm run build      # 本番ビルド（dist/に出力）
npm run preview    # ビルド結果をローカルで確認
```

---

## 今後追加予定の機能（バックログ）

- [ ] ソルフェージュ自動生成（音程・音階の聴音）
- [ ] スケール練習モード（指定スケールを全ポジションで表示）
- [ ] コード進行トレーナー
- [ ] リズム読み取り練習
- [ ] 練習ログ・進捗記録

---

## 参考・経緯

元々はHTMLシングルファイルで試作したものをReact化。
試作HTMLは `_legacy/fretboard-trainer.html` に保管しておく。
