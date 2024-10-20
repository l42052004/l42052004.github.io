// 定義一個儲存所有倒數計時器的資料結構
let timers = JSON.parse(localStorage.getItem('timers')) || [];

// 初始化計時器 UI
function renderTimers() {
  const container = document.getElementById('timersContainer');
  container.innerHTML = ''; // 清空容器

  timers.forEach((timer, index) => {
    const timerDiv = document.createElement('div');
    timerDiv.className = 'timer';

    timerDiv.innerHTML = `
      <h3>${timer.name}</h3>
      <p id="time-${index}">${formatTime(timer.remainingTime)}</p>
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

// 新增倒數計時器
document.getElementById('addTimerBtn').addEventListener('click', () => {
  const name = prompt('請輸入計時器名稱:');
  const time = parseInt(prompt('請輸入倒數時間 (以秒為單位):'), 10);

  if (name && !isNaN(time)) {
    timers.push({ name: name, initialTime: time, remainingTime: time, intervalId: null });
    saveTimers();
    renderTimers();
  }
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
