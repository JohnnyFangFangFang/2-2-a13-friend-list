// 變數區 ///////////////////////////////////////////////////////////////////////////////////////////////
// 網址變數區
const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";
// 分頁變數
const FRIENDS_PER_PAGE = 12;
// 把收藏好友資料放入這個陣列
const friends = JSON.parse(localStorage.getItem("favoriteFriends")) || [];
console.log(friends);
// 存放搜尋後的結果
let filteredFriends = [];
// 選取人物卡片區的DOM
const dataPanel = document.querySelector("#data-panel");
// 選取搜尋欄、輸入值
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
// 選取分頁器
const paginator = document.querySelector("#paginator");

// function區 ////////////////////////////////////////////////////////////////////////////////////////////
function renderFriendList(data) {
  let rawHTML = "";
  // 把人物資料用Template Literals渲染出來
  // 要在img標籤新增data-id='${item.id}'，事件監聽器裡的event.target.dataset.id才抓得到
  data.forEach((item) => {
    rawHTML += `
    <div class="col-2 m-2 p-2 card shadow rounded" style="width: 300px;">
      <img src="${item.avatar}"
        class="card-img-top btn btn-outline-light btn-show-friend" data-bs-toggle="modal" data-bs-target="#friend-modal"
        data-id="${item.id}" alt="Friend Image" >
      <div class="card-body">
        <h5 class="card-title text-center fw-bold">${item.name} ${item.surname}</h5>
      </div>
      <div class="card-footer text-end">
        <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
      </div>
    </div>
    `;
  });

  dataPanel.innerHTML = rawHTML;
}

// 分頁器渲染，產生分頁的數量
function renderPaginator(amount) {
  let rawHTML = "";
  let pageNum = Math.ceil(amount / FRIENDS_PER_PAGE);

  for (let page = 1; page <= pageNum; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
  paginator.firstElementChild.classList.add("active");
}

// 分頁內容擷取函式，把每頁要呈現的人物擷取出來
function getFriendsByPage(page) {
  const data = filteredFriends.length ? filteredFriends : friends;
  const startIndex = (page - 1) * FRIENDS_PER_PAGE;
  return data.slice(startIndex, startIndex + FRIENDS_PER_PAGE);
}

// 做個函式讓圖像按下去後出現的視窗能讀到該人物卡片資料
function showFriendModal(id) {
  const modalName = document.querySelector("#friend-modal-name");
  const modalImage = document.querySelector("#friend-modal-image");
  const modalGender = document.querySelector("#friend-modal-gender");
  const modalAge = document.querySelector("#friend-modal-age");
  const modalRegion = document.querySelector("#friend-modal-region");
  const modalBirthday = document.querySelector("#friend-modal-birthday");
  const modalEmail = document.querySelector("#friend-modal-email");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    modalName.innerText = data.name + " " + data.surname;
    modalGender.innerText = "Gender: " + data.gender;
    modalAge.innerText = "Age: " + data.age;
    modalRegion.innerText = "Region: " + data.region;
    modalBirthday.innerText = "Birthday: " + data.birthday;
    modalEmail.innerText = "Email: " + data.email;
    modalImage.innerHTML = `<img src="${data.avatar}" alt="friend-image" class="'img-fluid justify-content-center" style="height: 417px">`;
  });
}

// 收藏好友刪除功能，並且重新render收藏好友資料
function removeFromFavorite(id) {
  let indexOfRemoveFriend = friends.findIndex((friend) => friend.id === id);
  if (indexOfRemoveFriend === -1) return;
  friends.splice(indexOfRemoveFriend, 1);
  localStorage.setItem("favoriteFriends", JSON.stringify(friends));
  renderFriendList(friends);
}

// 事件監聽器區 ///////////////////////////////////////////////////////////////////////////////////////////////
// 只要使用者用關鍵字搜尋，就把關鍵字用filter去篩選
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(keyword)
  );

  // 只要過濾後沒東西或輸入空值，就跳出警告視窗
  if (filteredFriends.length === 0 || keyword.length === 0) {
    return alert("Cannot find friends with keyword: " + keyword);
  }

  renderPaginator(filteredFriends.length);
  renderFriendList(getFriendsByPage(1));
});

// 只要使用者點擊圖像，就啟動函式功能讓視窗能讀到該人物卡片資料
// 點擊刪除就啟動刪除功能函式
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-friend")) {
    showFriendModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id));
  }
});

// 點擊下方分頁就渲染出對應的人物資料
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.classList.contains("page-link")) {
    renderFriendList(getFriendsByPage(event.target.dataset.page));
  }
});

// 渲染資料 ///////////////////////////////////////////////////////////////////////////////////////////////
// 雖然不用串API，但要記得把資料渲染出來
renderFriendList(getFriendsByPage(1));
renderPaginator(friends.length);
