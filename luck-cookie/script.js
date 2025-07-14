let cookies = 0;
let timeLeft = 60; // 制限時間（秒）
let timerInterval;
let gameStarted = false;

// ゲーム定数
let luckPoints = 0;
const MAX_LUCK_POINTS = 70;
const LUCK_POINT_GAIN_INTERVAL_MS = 3000; // 3秒 = 3000ミリ秒
let luckPointTimer;

const BASE_GAMBLE_SUCCESS_RATE = 50; // 基本成功確率 (%)
const LUCK_POINT_BONUS_PER_POINT = 3; // 運ポイント1消費あたりの成功確率ボーナス (%)
const MAX_LUCK_POINT_BONUS = 30; // 運ポイントボーナスの最大値 (%)
const GAMBLE_MULTIPLIER = 2; // ギャンブル成功時のクッキー倍率


const MAX_HIGH_SCORES = 5; // ランキングに表示する最大件数
const HIGH_SCORES_KEY = 'cookieRouletteHighScores'; // LocalStorageのキー
// DOM要素の取得
const cookieCountElement = document.getElementById('cookie-count');
const timerElement = document.getElementById('timer');
const clickButton = document.getElementById('click-button');
const gambleButton = document.getElementById('gamble-button');
const gambleResultElement = document.getElementById('gamble-result');
const gameOverScreen = document.getElementById('game-over-screen');
const finalCookieCountElement = document.getElementById('final-cookie-count');
const restartButton = document.getElementById('restart-button');
const bodyElement = document.body;

const luckPointCountElement = document.getElementById('luck-point-count');
const gambleAmountSlider = document.getElementById('gamble-amount-slider');
const gambleAmountDisplay = document.getElementById('gamble-amount-display');
const gamblePercentageDisplay = document.getElementById('gamble-percentage-display');
const luckPointConsumptionSlider = document.getElementById('luck-point-consumption-slider');
const luckPointConsumptionDisplay = document.getElementById('luck-point-consumption-display');
const predictedSuccessRateElement = document.getElementById('predicted-success-rate');

const highScoresList = document.getElementById('high-scores-list'); // ランキングリストのUL要素
// 効果音ファイルのパス
const successSoundPath = 'sounds/harakiridrive.mp3'; // 成功時の効果音
const failureSoundPath = 'sounds/failure.mp3'; // 失敗時の効果音 (任意で追加)

// Audioオブジェクトの作成 (ゲーム開始時に一度だけ作成するのが効率的)
const successAudio = new Audio(successSoundPath);
const failureAudio = new Audio(failureSoundPath);

// 音量の調整（0.0から1.0の範囲で設定）
successAudio.volume = 0.5;
failureAudio.volume = 0.7;


// --- ゲーム初期化 ---
function initializeGame() {
    cookies = 0;
    timeLeft = 60;
    gameStarted = false;
    luckPoints = 0; // 運ポイントも初期化

    // 既存のタイマーと運ポイントタイマーをクリア
    clearInterval(timerInterval);
    clearInterval(luckPointTimer);

    cookieCountElement.textContent = cookies;
    timerElement.textContent = timeLeft;
    luckPointCountElement.textContent = luckPoints; // 運ポイント表示を初期化
    gambleResultElement.textContent = '';
    gameOverScreen.style.display = 'none';
    clickButton.disabled = false;
    gambleButton.disabled = false;
    clickButton.style.display = 'block';
    gambleButton.style.display = 'block';
    timerElement.parentElement.style.display = 'block';

    // スライダーの初期化
    gambleAmountSlider.value = 0; // 投入クッキースライダーを0に
    luckPointConsumptionSlider.value = 0; // 消費運ポイントスライダーを0に
    
    // UIを更新して初期状態を表示
    updateGambleUI(); 
}

// --- クッキーを焼く（クリック） ---
clickButton.addEventListener('click', () => {
    if (!gameStarted) {
        startGame();
    }
    cookies++;
    cookieCountElement.textContent = cookies;
    updateGambleUI(); // クッキー数変動でUI更新
});

// クッキーを焼くボタンにキーボードからのクリック発火を禁止
clickButton.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
    }
});

// --- ギャンブルUIの更新ロジック ---
// 投入クッキースライダーのイベントリスナー
gambleAmountSlider.addEventListener('input', updateGambleUI);

// 運ポイント消費スライダーのイベントリスナー
luckPointConsumptionSlider.addEventListener('input', updateGambleUI);

// ギャンブルUIの表示を更新する関数
function updateGambleUI() {
    // 投入クッキー量の表示更新
    const gamblePercentage = parseInt(gambleAmountSlider.value);
    const calculatedGambleAmount = Math.floor(cookies * (gamblePercentage / 100));
    gambleAmountDisplay.textContent = calculatedGambleAmount;
    gamblePercentageDisplay.textContent = gamblePercentage;
    
    // 現在のクッキー数に応じて、賭ける割合スライダーの最大値を調整
    // これにより、クッキーが0の時にスライダーを動かしても0%のままになる
    gambleAmountSlider.max = cookies > 0 ? 100 : 0; 
    if (gamblePercentage > 0 && cookies === 0) { // クッキー0なのにスライダーが0%でない場合
        gambleAmountSlider.value = 0; // スライダーを0に強制
        gambleAmountDisplay.textContent = 0;
        gamblePercentageDisplay.textContent = 0;
    }

    // 消費運ポイントの表示更新
    const consumedLuckPoints = parseInt(luckPointConsumptionSlider.value);
    luckPointConsumptionDisplay.textContent = consumedLuckPoints;
    
    // 消費運ポイントスライダーのmax値を現在の運ポイント数に合わせて調整
    luckPointConsumptionSlider.max = luckPoints;
    if (consumedLuckPoints > luckPoints) { // 所持運ポイントを超えていたら補正
        luckPointConsumptionSlider.value = luckPoints;
        luckPointConsumptionDisplay.textContent = luckPoints;
    }

    // 予想成功確率の計算と表示更新
    let bonusRate = Math.min(consumedLuckPoints * LUCK_POINT_BONUS_PER_POINT, MAX_LUCK_POINT_BONUS);
    let predictedRate = BASE_GAMBLE_SUCCESS_RATE + bonusRate;
    predictedSuccessRateElement.textContent = predictedRate;
}

// --- 運ポイントを増やす関数 ---
function gainLuckPoint() {
    if (luckPoints < MAX_LUCK_POINTS) {
        luckPoints++;
        luckPointCountElement.textContent = luckPoints;
        updateGambleUI(); // 運ポイント増加でUI更新
    }
}

// --- ギャンブルに挑戦 ---
gambleButton.addEventListener('click', () => {
    if (!gameStarted) {
        startGame();
    }

    const gambleAmount = parseInt(gambleAmountDisplay.textContent); // 表示されている投入クッキー量を取得
    const consumedLuckPoints = parseInt(luckPointConsumptionDisplay.textContent); // 表示されている消費運ポイント量を取得

    if (gambleAmount === 0) { 
        gambleResultElement.textContent = '賭けるクッキーの量を設定してください！';
        gambleResultElement.className = '';
        return;
    }
    if (cookies < gambleAmount) { // クッキーが足りない場合はエラー
        gambleResultElement.textContent = 'クッキーが足りません！';
        gambleResultElement.className = '';
        return;
    }
    if (luckPoints < consumedLuckPoints) { // 消費運ポイントが足りない場合（スライダーで制御されるはずだが念のため）
        gambleResultElement.textContent = '運ポイントが不足しています！';
        gambleResultElement.className = '';
        return;
    }
    
    // ギャンブル実行前のクッキーと運ポイントを消費
    cookies -= gambleAmount;
    luckPoints -= consumedLuckPoints; // ここで運ポイントが減ります
    cookieCountElement.textContent = cookies; // 消費後のクッキー数を更新
    luckPointCountElement.textContent = luckPoints; // 消費後の運ポイント数を更新
    updateGambleUI(); // UIを更新してスライダーの範囲などを再計算

    // 成功確率の計算
    let currentSuccessRate = BASE_GAMBLE_SUCCESS_RATE + Math.min(consumedLuckPoints * LUCK_POINT_BONUS_PER_POINT, MAX_LUCK_POINT_BONUS);

    // 結果の判定
    if (Math.random() * 100 < currentSuccessRate) { // 確率計算は0-100の範囲で行う
        // 成功（倍増）
        cookies += gambleAmount * GAMBLE_MULTIPLIER; // 消費した量に対して倍率をかける
        gambleResultElement.textContent = `大当たり！${gambleAmount}個が${gambleAmount * GAMBLE_MULTIPLIER}個に爆増！🎉🎉🎉`;
        gambleResultElement.className = 'success'; // 成功時のクラスを追加

        // 射幸心を煽る演出
        bodyElement.classList.add('gamble-success-flash'); // 背景フラッシュ
        cookieCountElement.classList.add('pop'); // クッキーカウントのポップアニメーション

        successAudio.currentTime = 0; // 再生位置を先頭に戻す (連続で鳴らすため)
        successAudio.play(); // 成功時の効果音を再生
		const playDurationMs = 5000; // 5秒間再生 (ミリ秒指定)

		setTimeout(() => {
			successAudio.pause(); // 1秒後に再生を停止
			// 必要であれば successAudio.currentTime = 0; も追加
		}, playDurationMs);
        setTimeout(() => {
            bodyElement.classList.remove('gamble-success-flash');
            cookieCountElement.classList.remove('pop');
            gambleResultElement.className = ''; // メッセージのクラスもリセット
        }, 800); // アニメーション時間に合わせて調整
    } else {
        // 失敗（全損）
        // cookiesはすでに消費されているため、ここで追加の減算は不要（賭けた分は失われている）
        gambleResultElement.textContent = `ギャンブル失敗... ${gambleAmount}個のクッキーが全て溶けました...😭`;
        gambleResultElement.className = '';

        failureAudio.currentTime = 0; // 再生位置を先頭に戻す
        failureAudio.play(); // 失敗時の効果音を再生
    }
    cookieCountElement.textContent = cookies; // 結果後の最終クッキー数を更新
    updateGambleUI(); // 結果後のUIを更新（特にスライダーの表示など）
});

// --- ゲーム開始 ---
function startGame() {
    gameStarted = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000); // 1秒ごとに更新

    // 運ポイントの自動増加タイマーを開始
    luckPointTimer = setInterval(gainLuckPoint, LUCK_POINT_GAIN_INTERVAL_MS);
}

function endGame() {
    clearInterval(timerInterval);
    clearInterval(luckPointTimer);
    clickButton.disabled = true;
    gambleButton.disabled = true;
    gameOverScreen.style.display = 'flex';
    finalCookieCountElement.textContent = cookies;
    
    saveHighScore(cookies); // ★追加: ゲーム終了時にスコアを保存
    displayHighScores(); // ★追加: ゲーム終了時にランキングを再表示

    clickButton.style.display = 'none';
    gambleButton.style.display = 'none';
    timerElement.parentElement.style.display = 'none';
}

// --- ランキング関連関数 ---
function getHighScores() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '[]');
    return highScores.sort((a, b) => b - a); // 降順にソート
}

function saveHighScore(score) {
    const highScores = getHighScores();
    if (score > 0) { // 0より大きいスコアのみ保存
        highScores.push(score);
        highScores.sort((a, b) => b - a); // 降順にソート
        highScores.splice(MAX_HIGH_SCORES); // 上位N件のみ保持
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
    }
}

function displayHighScores() {
    const highScores = getHighScores();
    highScoresList.innerHTML = ''; // リストをクリア

    if (highScores.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'まだスコアがありません。';
        highScoresList.appendChild(li);
        return;
    }

    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}.</span> <span>${score} 個</span>`;
        highScoresList.appendChild(li);
    });
}

// --- リスタートボタン ---
restartButton.addEventListener('click', () => {
    initializeGame();
});

// ページロード時に初期化
initializeGame();
document.addEventListener('DOMContentLoaded', () => {
    displayHighScores(); // ページの初回ロード時にランキングを表示
});