# 軽量版英単語学習アプリ

GitHub Pages で公開できる軽量版の英単語学習アプリです。

## 🌐 デモサイト

[GitHub Pages で表示](https://yourusername.github.io/NGSL/)

## 📁 ファイル構成

```
├── index.html          # メインアプリケーション
├── gee.csv            # 英単語データ（自動読み込み）
├── gemin.csv          # 追加データ（オプション）
├── start_server.bat   # ローカル開発用サーバー起動
└── README.md          # このファイル
```

## 🚀 GitHub Pages での公開手順

1. **リポジトリの作成**

   ```bash
   git init
   git add .
   git commit -m "初回コミット"
   git branch -M main
   git remote add origin https://github.com/yourusername/NGSL.git
   git push -u origin main
   ```

2. **GitHub Pages の有効化**

   - GitHub のリポジトリページで「Settings」→「Pages」
   - Source: 「Deploy from a branch」
   - Branch: 「main」を選択
   - Save

3. **公開 URL**
   - `https://yourusername.github.io/NGSL/`

## 💡 特徴

- **自動 CSV 読み込み**: gee.csv ファイルを自動で読み込み
- **フラッシュカード機能**: 単語の意味を暗記
- **クイズ機能**: 4 択問題で理解度をテスト
- **進捗管理**: 学習進捗をローカルストレージに保存
- **フィルター機能**: 未解答・正解・不正解で絞り込み
- **レスポンシブデザイン**: モバイル対応

## 📝 CSV ファイル形式

```csv
Lemma,SFI Rank,SFI,Adjusted Frequency per Million (U),意味,例文,,
the,1,87.85,60910,(定冠詞) 特定のものを指す時に使う。,The sun rises in the east.,,
be,2,86.86,48575,(動詞) ～である、存在する、～になる。,She wants to be a doctor.,,
```

## 🔧 ローカル開発

1. **ローカルサーバー起動**

   ```bash
   # Pythonを使用
   python -m http.server 8000

   # または付属のバッチファイル
   start_server.bat
   ```

2. **ブラウザでアクセス**
   - `http://localhost:8000`

## 📱 使用方法

1. **フラッシュカードモード**

   - 単語を見て意味を思い出す
   - 「答えを表示」で確認
   - 「次の単語」で進む

2. **クイズモード**

   - 4 択から正しい意味を選択
   - 「回答する」で採点
   - 「次の問題」で進む

3. **進捗管理**
   - 解答状況は自動保存
   - フィルターで未解答・正解・不正解を表示
   - 「進捗リセット」で初期化

## 🎯 対応ブラウザ

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 📄 ライセンス

MIT License
