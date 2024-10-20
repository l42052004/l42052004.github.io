// 定義一個儲存所有倒數計時器的資料結構
let timers = JSON.parse(localStorage.getItem('timers')) || [];
let timerCount = timers.length; // 計算現有計時器數量

// 初始化計時器 UI
function renderTimers() {
  const container = document.getElementById('timersContainer');
  container.innerHTML = ''; // 清空容器

  timers.forEach((timer, index) => {
    const timerDiv = document.createElement('div');
    timerDiv.className = 'timer';

    timerDiv.innerHTML = `
      <h3 contenteditable="true" id="name-${index}" onblur="updateName(${index})">${timer.name}</h3>
      <p contenteditable="true" id="time-${index}" onblur="updateTime(${index})">${formatTime(timer.remainingTime)}</p>
      <button onclick="startTimer(${index})">開始</button>
      <button onclick="pauseTimer(${index})">暫停</button>
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
  const timeElement = document.getElementById(`time-${index}`);
  const timeParts = timeElement.textContent.split(':');
  let totalSeconds = 0;

  if (timeParts.length === 3) {
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const seconds = parseInt(timeParts[2], 10) || 0;
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
  }

  timers[index].remainingTime = totalSeconds;
  saveTimers();
}

// 新增倒數計時器，使用預設名稱和時間
document.getElementById('addTimerBtn').addEventListener('click', () => {
  timerCount++;
  timers.push({
    name: `Timer #${timerCount}`,
    initialTime: 0,
    remainingTime: 0,
    intervalId: null
  });
  saveTimers();
  renderTimers();
});

// 開始倒數計時
function startTimer(index) {
  if (timers[index].intervalId) return; // 如果計時器已經在倒數中，則不再啟動
  timers[index].intervalId = setInterval(() => {
    timers[index].remainingTime--;
    document.getElementById(`time-${index}`).textContent = formatTime(timers[index].remainingTime);
    
    if (timers[index].remainingTime <= 0) {
      clearInterval(timers[index].intervalId);
      timers[index].intervalId = null;
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
