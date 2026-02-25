# 英日翻訳 - Browser Translation

https://ilolio.github.io/enja-minimal-html/

ブラウザ上で完結する英語⇔日本語の翻訳アプリです。サーバーへの送信は一切なく、すべてローカルで処理されます。

## 特徴

- **完全ブラウザ動作** — サーバー不要、プライバシー安心
- **英語⇔日本語** の双方向翻訳
- **自動翻訳モード** — 入力と同時にリアルタイム翻訳
- **WebGPU / WASM 対応** — GPU があれば高速に動作
- **モデルキャッシュ** — 初回ダウンロード後はオフラインでも利用可能

## 使用技術

- [Transformers.js](https://huggingface.co/docs/transformers.js) v4
- [LFM2-350M-ENJP-MT-ONNX](https://huggingface.co/onnx-community/LFM2-350M-ENJP-MT-ONNX) (量子化 q4)

## 使い方

1. ページを開くとモデルが自動でダウンロードされます（約 500MB、初回のみ）
2. テキストを入力すると自動で翻訳されます
3. 矢印ボタンで翻訳方向を切り替えられます
