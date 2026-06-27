# Frontend Mentor - Shortly URL短縮サービス（実装済コード）

これは [Frontend Mentor の Shortly URL shortening API Challenge](https://www.frontendmentor.io/challenges/url-shortening-api-landing-page-27be0c4660) に対する解決策（実装コード）です。Vercel Serverless Functionsを用いた軽量なバックエンド・プロキシモックを自作し、フロントエンド側での厳格な例外処理、URLコンストラクタによる高精度なバリデーション、クリップボードAPIによる高度なUIインタラクション、そしてGitHub Actionsを用いたCI/CD自動ビルド検証を融合させた、堅牢な疑似データ駆動型シングルページWebアプリケーションです。

- **公開デモURL**: [ここにVercelの公開URLを貼り付けてください]

## 目次

- [概要](#概要)
  - [要件・機能](#要件機能)
  - [スクリーンショット](#スクリーンショット)
  - [リンク](#リンク)
- [開発プロセス](#開発プロセス)
  - [ディレクトリ構造](#ディレクトリ構造)
  - [使用技術・環境](#使用技術環境)
  - [こだわった技術的アプローチ](#こだわった技術的アプローチ)
    - [1. Vercel Serverless Functionsを用いたAPIモックの構築](#1-vercel-serverless-functionsを用いたapiモックの構築)
    - [2. URLコンストラクタを活用した高精度なフロントエンド・バリデーション](#2-urlコンストラクタを活用した高精度なフロントエンドバリデーション)
    - [3. Fetch API と async/await による堅牢な非同期通信・例外処理](#3-fetch-api-と-asyncawait-による堅牢な非同期通信例外処理)
    - [4. イベントデリゲーションと Clipboard API による動的UI制御](#4-イベントデリゲーションと-clipboard-api-による動的ui制御)
    - [5. 流体レスポンシブ（Fluid Design）とSassによる一元管理](#5-流体レスポンシブfluid-designとsassによる一元管理)
- [制作者](#制作者)

## 概要

### 要件・機能

ユーザーは以下の操作・表示確認が可能です：

- **ハンバーガーメニュー:** モバイル環境におけるナビゲーションの開閉制御。
- **リアルタイムURL短縮（疑似API連携）:** フォームに入力された長大なURLを、自作したサーバーレス関数（`/api/shorten`）へ非同期リクエストし、ランダム文字列からなる短縮URLを即座に動的レンダリング。
- **厳格な例外処理 & エラーハンドリング:** ネットワーク切断やサーバーエラーを検知し、ブラウザのクラッシュを防ぐ動的なエラーUI表示（「Network error. Please try again.」など）。
- **直感的なクリップボードコピー（動的要素対応）:** 後から動的に追加された生成リストの「Copy」ボタンを検知し、ワンタップでクリップボードにデータを書き込み。ボタンのテキストが「Copied!」に変色し、2秒後に元の状態へと滑らかに戻るタイマー制御の状態遷移UXを実装。
- **フルレスポンシブ・流体レイアウト:** モバイルから高解像度デスクトップ（1440px〜）にいたるまで、画面幅に応じて破綻なく滑らかに縮尺が可変（Fluid）するレイアウト。

### スクリーンショット

![](./preview.jpg)

### リンク

- ライブサイト（公開ページ）: [ここにVercelの公開URLを貼り付けてください]

---

## 開発プロセス

### ディレクトリ構造

Viteのバンドル仕様およびSassコンパイラ環境に準拠し、開発中に出た不要なテンプレートファイルを一掃（クリーンアップ）。関心の分離（Separation of Concerns）を意識した、スケールしやすくクリーンなディレクトリ設計を行っています。ビルド成果物（`dist/`）やパッケージ依存（`node_modules/`）は `.gitignore` を用いて厳密にGit管理から除外しています。

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions設定（Push/Merge時の自動ビルドテスト）
├── .gitignore               # Git管理除外設定（node_modulesやdist等の除外）
├── README.md                # 本ドキュメント
├── index.html               # メインHTML（エントリーポイントからJSを呼び出し）
├── package.json             # プロジェクト依存関係・各種スクリプト定義
├── package-lock.json        # 依存ライブラリのバージョンロック
├── preview.jpg              # README表示用のプレビュー画像
├── vite.config.js           # Vite設定ファイル
├── api/
│   └── shorten.js           # Vercel Serverless Functions（疑似APIエンドポイント）
├── public/                  # 成果物にそのままコピーされる静的アセット
│   └── images/              # ロゴ、アイコン、背景用SVG等
└── src/                     # ソースコードを集約する開発用ディレクトリ
    ├── main.js              # 全体統合用のメインJS（エントリーポイント）
    ├── js/
    │   └── script.js        # DOM操作、バリデーション、API通信、コピー制御を担うVanilla JS
    └── scss/
        └── style.scss       # 各種状態定義、流体デザイン、コンポーネントを包括するSCSS
```

### 使用技術・環境
- 言語・マークアップ: HTML5 / SCSS (Sass) / Vanilla JS (ES6+)
- リセットCSS: destyle.css (npm管理・SCSS側でのインポート)
- ビルドツール: Vite
- インフラ・環境自動化: Vercel (サーバーレス関数・ホスティング) / GitHub Actionsによる自動CI/CDパイプライン（品質チェック）構築

### こだわった技術的アプローチ
**1. Vercel Serverless Functionsを用いたAPIモックの構築**

フロントエンドから安全にリクエストを受け付けるため、api/shorten.js にNode.js環境のサーバーレス関数を構築しました。非POSTメソッドのブロック（415 Method Not Allowed）や、空データ受信時のバリデーション（400 Bad Request）といったバックエンドのセキュリティ作法を考慮。Math.random().toString(36) を利用したBase36のランダムコード生成ロジックを自作し、堅牢なAPIモック環境を実現しました。

**2. URLコンストラクタを活用した高精度なフロントエンド・バリデーション**

文字列が入力された際、無駄な通信コスト（APIリクエスト）を発生させないためにクライアント側で厳格な判定を行っています。
従来の不完全な正規表現チェックではなく、モダンなブラウザAPIである new URL(string) コンストラクタ を利用した例外判定（try...catch）によるチェックをカプセル化。スキーム（http/https）の有無を含めた高精度な「正しいURL形式か否か」の判定を高速に行う実務的なフォーム制御を徹底しました。

**3. Fetch API と async/await による堅牢な非同期通信・例外処理**

APIとの通信には async/await 構文を用いた Fetch API を採用し、application/x-www-form-urlencoded 形式でのデータ送信を安全に制御しています。APIサーバーのダウンやネットワーク切断といったフロントエンド側で予期できない通信失敗リスクに対し、全体の通信を try...catch ブロックで包括。異常発生時には即座にユーザーへ「Network error」等のフィードバック UI を返す例外処理を実装しました。

**4. イベントデリゲーションと Clipboard API による動的UI制御**

APIから返却されたデータは、insertAdjacentHTML によって動的にリスト追加されます。この時、増え続ける各コピーボタンに個別にイベントリスナーを設定するとメモリリークの原因になるため、親要素である .result で一括検知する 「イベントデリゲーション（Event Delegation）」 を採用しました。
コピー処理には navigator.clipboard.writeText() を用い、成功時にはボタンを「Copied!」へ状態遷移（クラス付与）させ、setTimeout を用いて2秒後に自動復帰させる直感的で無駄のないUX制御を実装しています。

**5. 流体レスポンシブ（Fluid Design）とSassによる一元管理**

メディアクエリによる唐突なレイアウト崩れを防ぐため、フォントサイズや余白にいたるまで vw（Viewport Width）単位ベースから最終的に px（固定値）へ滑らかに遷移させる緻密なフルードデザインを実装。あらゆる画面サイズで黄金比を維持します。また、JavaScriptはクラスや属性の状態変化のみに徹し、実際のスタイリング変化はSCSS側が一元管理する設計を徹底しています。

## 制作者
GitHub - @yama5504