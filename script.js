// 定義一個儲存所有倒數計時器的資料結構
let timers = JSON.parse(localStorage.getItem('timers')) || [];
let timerCount = timers.length; // 計算現有計時器數量

// 音效控制元素
const enableSoundCheckbox = document.getElementById('enableSound');
const volumeControl = document.getElementById('volumeControl');
const alarmSound = document.getElementById('alarmSound');

// 初始化音效
alarmSound.volume = volumeControl.value; // 設定初始音量

// 監聽音量控制滑動條的變動
volumeControl.addEventListener('input', () => {
  alarmSound.volume = volumeControl.value; // 動態調整音量
});

// 初始化計時器 UI
function renderTimers() {
  const container = document.getElementById('timersContainer');
  container.innerHTML = '';  // 清空容器

  timers.forEach((timer, index) => {
    const timerDiv = document.createElement('div');
    timerDiv.className = 'timer';

    // 將初始時間轉換為 HH:MM:SS 格式
    const hours = Math.floor(timer.initialTime / 3600);
    const minutes = Math.floor((timer.initialTime % 3600) / 60);
    const seconds = timer.initialTime % 60;

    timerDiv.innerHTML = `
      <h3 contenteditable="true" id="name-${index}" onblur="updateName(${index})">${timer.name}</h3>
      <p>設定時間: 
        <input type="number" id="hours-${index}" min="0" max="99" value="${hours}" onchange="updateTime(${index})" style="width: 40px;">
        :
        <input type="number" id="minutes-${index}" min="0" max="59" value="${minutes.toString().padStart(2, '0')}" onchange="updateTime(${index})" style="width: 40px;">
        :
        <input type="number" id="seconds-${index}" min="0" max="59" value="${seconds.toString().padStart(2, '0')}" onchange="updateTime(${index})" style="width: 40px;">
      </p>
      <p>倒數時間: <span id="remainingTime-${index}">${formatTime(timer.remainingTime)}</span></p>
      <button onclick="startTimer(${index})">開始</button>
      <button onclick="pauseTimer(${index})">暫停</button>
      <button onclick="resetTimer(${index})">重新開始</button>
      <button onclick="deleteTimer(${index})">刪除</button>
    `;

    container.appendChild(timerDiv);
  });
}


// 格式化時間為 HH:MM:SS
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 更新名稱
function updateName(index) {
  const nameElement = document.getElementById(`name-${index}`);
  timers[index].name = nameElement.textContent || `Timer #${index + 1}`; // 若名稱留空則設置為預設值
  saveTimers();
}

// 更新時間
function updateTime(index) {
  const hoursInput = document.getElementById(`hours-${index}`);
  const minutesInput = document.getElementById(`minutes-${index}`);
  const secondsInput = document.getElementById(`seconds-${index}`);

  let hours = parseInt(hoursInput.value, 10) || 0;
  let minutes = parseInt(minutesInput.value, 10) || 0;
  let seconds = parseInt(secondsInput.value, 10) || 0;

  // 處理進位邏輯
  if (seconds >= 60) {
    minutes += Math.floor(seconds / 60);
    seconds = seconds % 60;
  }

  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
  }

  // 更新輸入框以顯示正確的時間
  hoursInput.value = hours;
  minutesInput.value = minutes.toString().padStart(2, '0');
  secondsInput.value = seconds.toString().padStart(2, '0');

  // 計算總秒數並更新計時器
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  timers[index].initialTime = totalSeconds;
  timers[index].remainingTime = totalSeconds;

  saveTimers();
  renderTimers();
}


// 更新時間輸入框中的值，並進位
function updateTimeWithFields() {
  const hoursInput = document.getElementById('hours');
  const minutesInput = document.getElementById('minutes');
  const secondsInput = document.getElementById('seconds');

  let hours = parseInt(hoursInput.value, 10) || 0;
  let minutes = parseInt(minutesInput.value, 10) || 0;
  let seconds = parseInt(secondsInput.value, 10) || 0;

  // 處理進位邏輯
  if (seconds >= 60) {
    minutes += Math.floor(seconds / 60);
    seconds = seconds % 60;  // 取餘數作為秒數
  }

  if (minutes >= 60) {
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;  // 取餘數作為分鐘數
  }

  // 更新輸入框的值以顯示進位後的結果
  hoursInput.value = hours;
  minutesInput.value = minutes.toString().padStart(2, '0'); // 格式化
  secondsInput.value = seconds.toString().padStart(2, '0'); // 格式化

  // 將時間轉換為總秒數，並更新計時器數據
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  timers[0].initialTime = totalSeconds;  // 假設是修改第一個計時器
  timers[0].remainingTime = totalSeconds;
  
  saveTimers();  // 保存至 LocalStorage
  renderTimers();  // 重新渲染計時器
}

// 新增倒數計時器，使用預設名稱和時間
document.getElementById('addTimerBtn').addEventListener('click', () => {
  timerCount++;
  timers.push({
    name: `Timer #${timerCount}`,
    initialTime: 0,   // 初始化時間為 0 秒
    remainingTime: 0, // 同步倒數時間為 0 秒
    intervalId: null  // 初始化時不進行倒數
  });
  saveTimers();
  renderTimers(); // 更新 UI 顯示新的計時器
});

// 開始倒數計時
function startTimer(index) {
  if (timers[index].intervalId) return; // 如果計時器已經在倒數中，則不再啟動

  const startTime = Date.now(); // 記錄開始時間戳
  const initialRemainingTime = timers[index].remainingTime; // 記錄倒數剩餘時間

  timers[index].intervalId = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // 計算經過的秒數
    const updatedRemainingTime = initialRemainingTime - elapsedTime; // 根據經過的時間計算剩餘時間

    timers[index].remainingTime = Math.max(updatedRemainingTime, 0); // 保證時間不為負數
    document.getElementById(`remainingTime-${index}`).textContent = formatTime(timers[index].remainingTime);

    if (timers[index].remainingTime <= 0) {
      clearInterval(timers[index].intervalId);
      timers[index].intervalId = null;
      // 檢查是否開啟音效提醒
      if (enableSoundCheckbox.checked) {
        alarmSound.play(); // 播放音效
      }
      alert(`${timers[index].name} 完成倒數`);
    }
  }, 1000);
  saveTimers();
}

// 暫停倒數計時
function pauseTimer(index) {
  clearInterval(timers[index].intervalId);
  timers[index].intervalId = null;
  saveTimers();
}

// 重新開始計時器
function resetTimer(index) {
  clearInterval(timers[index].intervalId);
  timers[index].remainingTime = timers[index].initialTime; // 重置為初始時間
  document.getElementById(`remainingTime-${index}`).textContent = formatTime(timers[index].remainingTime);
  startTimer(index); // 重新開始倒數
}

// 刪除倒數計時器
function deleteTimer(index) {
  clearInterval(timers[index].intervalId);
  timers.splice(index, 1);
  saveTimers();
  renderTimers();
}

// 保存計時器至 LocalStorage
function saveTimers() {
  localStorage.setItem('timers', JSON.stringify(timers));
}

// 初始化網頁時渲染計時器
renderTimers();
