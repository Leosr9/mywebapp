const app = document.getElementById("app");
let currentUser = null;
let lostItems = [];
let foundItems = [];

function showHome() {
  app.innerHTML = `
    <div class="header">
      <div class="title"><strong>PICT</strong><br/>Lost and Found</div>
      <button class="button" onclick="showLogin()">Get Started</button>
    </div>
  `;
}

function showLogin() {
  app.innerHTML = `
    <div class="container center">
      <h2>Login / Signup</h2>
      <input type="text" id="collegeId" placeholder="College ID" class="input" /><br/><br/>
      <input type="text" id="phoneNumber" placeholder="Phone Number" class="input" /><br/><br/>
      <input type="password" id="password" placeholder="Password" class="input" /><br/><br/>
      <button class="button" onclick="loginUser()">Login</button>
    </div>
  `;
}

function loginUser() {
  const collegeId = document.getElementById("collegeId").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const password = document.getElementById("password").value;

  if (collegeId && password && phoneNumber) {
    currentUser = { collegeId, phoneNumber };
    showOptions();
  } else {
    alert("Please enter your College ID, Phone Number and Password.");
  }
}

function showOptions() {
  app.innerHTML = `
    <div class="container center">
      <div class="profile-bar">Welcome, ${currentUser.collegeId}</div>
      <h2>Select Option</h2>
      <button class="button" onclick="showLost()">Lost</button>
      <button class="button" onclick="showFound()">Found</button><br/><br/>
      <button class="button" onclick="showChat()">General Chat</button><br/><br/>
      <button class="button" onclick="showLogin()">Logout</button>
    </div>
  `;
}

function showLost() {
  app.innerHTML = `
    <div class="container center">
      <div class="profile-bar">Logged in as ${currentUser.collegeId}</div>
      <h2>Lost Items</h2>
      <div id="lostList">
        ${[...lostItems].reverse().map((item, i) => renderItemCard(item, i, 'lost')).join('')}
      </div>
      <button class="button" onclick="showUpload('lost')">+ Add Lost Item</button><br/>
      <button class="button" onclick="showOptions()">Back</button>
    </div>
  `;
}

function showFound() {
  app.innerHTML = `
    <div class="container center">
      <div class="profile-bar">Logged in as ${currentUser.collegeId}</div>
      <h2>Found Items</h2>
      <div id="foundList">
        ${[...foundItems].reverse().map((item, i) => renderItemCard(item, i, 'found')).join('')}
      </div>
      <button class="button" onclick="showUpload('found')">+ Add Found Item</button><br/>
      <button class="button" onclick="showOptions()">Back</button>
    </div>
  `;
}

function renderItemCard(item, i, type) {
  const daysAgo = Math.floor((Date.now() - item.date) / (1000 * 60 * 60 * 24));
  const newBadge = daysAgo <= 1 ? `<span class="new-label">NEW</span>` : '';
  const phoneInfo = item.postedBy ? `<p>Posted by: ${item.postedBy.collegeId} (${item.postedBy.phoneNumber})</p>` : '';

  return `
    <div class="card">
      ${newBadge}<strong>${item.name}</strong><br/>
      ${item.description}<br/>
      <img src="${item.image}" width="100" onclick="openImagePopup(this)" /><br/>
      <p>Posted ${daysAgo} day(s) ago</p>
      ${phoneInfo}
      ${item.claimedBy ? 
        `<p class="claimed">Claimed by ${item.claimedBy.collegeId} (${item.claimedBy.phoneNumber})</p>
        <button class="button" onclick="removeClaim('${type}', ${i})">Remove Claim</button>` : 
        `<button class="button" onclick="claimItem('${type}', ${i})">Claim</button>`}
      <button class="button delete" onclick="delete${type.charAt(0).toUpperCase() + type.slice(1)}(${i})">Delete</button>
    </div>
  `;
}

function showUpload(type) {
  app.innerHTML = `
    <div class="container center">
      <div class="profile-bar">Logged in as ${currentUser.collegeId}</div>
      <h2>Upload ${type.charAt(0).toUpperCase() + type.slice(1)} Item</h2>
      <input type="text" id="itemName" placeholder="Item Name" class="input" /><br/><br/>
      <textarea id="itemDesc" placeholder="Description" class="input"></textarea><br/><br/>
      <input type="file" id="itemImage" accept="image/*" /><br/><br/>
      <button class="button" onclick="submitItem('${type}')">Submit</button><br/><br/>
      <button class="button" onclick="show${type.charAt(0).toUpperCase() + type.slice(1)}()">Back</button>
    </div>
  `;
}

function submitItem(type) {
  const name = document.getElementById("itemName").value;
  const description = document.getElementById("itemDesc").value;
  const file = document.getElementById("itemImage").files[0];
  const reader = new FileReader();

  reader.onloadend = function () {
    const item = {
      name,
      description,
      image: reader.result,
      claimedBy: null,
      postedBy: currentUser,
      date: Date.now()
    };
    if (type === 'lost') lostItems.push(item);
    else foundItems.push(item);
    showOptions();
  };

  if (file) reader.readAsDataURL(file);
  else alert("Please upload an image.");
}

function deleteLost(index) {
  lostItems.splice(index, 1);
  showLost();
}

function deleteFound(index) {
  foundItems.splice(index, 1);
  showFound();
}

function claimItem(type, index) {
  const list = type === 'lost' ? lostItems : foundItems;
  list[index].claimedBy = currentUser;
  type === 'lost' ? showLost() : showFound();
}

function removeClaim(type, index) {
  const list = type === 'lost' ? lostItems : foundItems;
  list[index].claimedBy = null;
  type === 'lost' ? showLost() : showFound();
}

// Auto-remove claimed items after 7 days
setInterval(() => {
  const now = Date.now();
  const filterItems = list => list.filter(item => !(item.claimedBy && now - item.date > 7 * 24 * 60 * 60 * 1000));
  lostItems = filterItems(lostItems);
  foundItems = filterItems(foundItems);
}, 60 * 60 * 1000); // Every hour

function showChat() {
  app.innerHTML = `
    <div class="container center">
      <div class="profile-bar">General Chat - ${currentUser.collegeId}</div>
      <div id="chatBox" class="chat-box"></div>
      <div class="chat-input-bar">
        <input type="text" id="chatInput" placeholder="Type a message..." class="input" />
        <select id="emojiPicker" class="emoji-picker" title="Insert Emoji">
          <option value="">😊</option>
          <option value="😀">😀</option>
          <option value="😂">😂</option>
          <option value="😍">😍</option>
          <option value="👍">👍</option>
          <option value="🎉">🎉</option>
          <option value="🙌">🙌</option>
          <option value="🤔">🤔</option>
          <option value="😢">😢</option>
        </select>
        <button class="send-arrow" onclick="sendMessage()" title="Send Message">➡️</button>
      </div><br/><br/>
      <button class="button" onclick="showOptions()">Back</button>
    </div>
  `;
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const chatBox = document.getElementById("chatBox");
  if (input.value.trim()) {
    const msg = document.createElement("div");
    msg.className = "chat-message";
    msg.textContent = `${currentUser.collegeId}: ${input.value}`;
    chatBox.appendChild(msg);
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'emojiPicker') {
    const input = document.getElementById('chatInput');
    input.value += e.target.value;
    e.target.value = ""; // reset picker
    input.focus();
  }
});

// Particle Background
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let hue = 0;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = Math.random() * 1 - 0.5;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
    ctx.fill();
  }
}

for (let i = 0; i < 100; i++) particles.push(new Particle());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hue += 0.5;
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}

animate();

// Image Popup
function openImagePopup(img) {
  const popup = document.getElementById("image-popup");
  const popupImg = document.getElementById("popup-img");
  popupImg.src = img.src;
  popup.style.display = "flex";
}

function closeImagePopup() {
  document.getElementById("image-popup").style.display = "none";
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("chat-user")) {
    const userId = e.target.dataset.userid;
    const user = users.find(u => u.id === userId);
    if (user) showUserProfile(user);
  }
});

function showUserProfile(user) {
  const popup = document.createElement("div");
  popup.className = "user-popup";
  popup.innerHTML = `
    <h3>${user.name}</h3>
    <p><strong>ID:</strong> ${user.id}</p>
    <p><strong>Phone:</strong> ${user.phone}</p>
    <button onclick="this.parentElement.remove()">Close</button>
  `;
  document.body.appendChild(popup);
}

// Start app
showHome();