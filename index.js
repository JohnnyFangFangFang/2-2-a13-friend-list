// 變數區 ///////////////////////////////////////////////////////////////////////////////////////////////
// 網址變數區
const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";
// 分頁變數
const FRIENDS_PER_PAGE = 12;
// 把下方API串到的人物資料放入這個陣列
const friends = [];
// console.log(friends.length); =>印出0
// console.log(friends); =>印出[]，內含200個物件；後來發現這不叫內含200個物件，而是資料若被更新會有200個物件

// 收藏名單
const list = JSON.parse(localStorage.getItem("favoriteFriends")) || [];

// 存放搜尋後的結果
let filteredFriends = [];
// 選取人物卡片區的DOM
const dataPanel = document.querySelector("#data-panel");
// 選取搜尋欄、輸入值
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
// 選取分頁器
const paginator = document.querySelector("#paginator");
// 紀錄目前頁面
let pageCurrent = 1;

// function區 ////////////////////////////////////////////////////////////////////////////////////////////
function renderFriendList(data) {
  let rawHTML = "";
  // 把人物資料用Template Literals渲染出來
  // 要在img標籤新增data-id='${item.id}'，事件監聽器裡的event.target.dataset.id才抓得到
  // 直接在Template Literals裡用三元運算子判斷是否已加入收藏，並回傳對應的class，達到收藏鈕變色效果
  data.forEach((item) => {
    rawHTML += `
    <div class="col-2 m-2 p-2 card shadow rounded" style="width: 300px;">
      <img src="${item.avatar}"
        class="card-img-top btn btn-outline-light btn-show-friend" data-bs-toggle="modal" data-bs-target="#friend-modal"
        data-id="${item.id}" alt="Friend Image" >
      <div class="card-body">
        <h5 class="card-title text-center fw-bold">${item.name} ${
      item.surname
    }</h5>
      </div>
      <div class="card-footer text-end">
        <i class="${
          list.some((friend) => friend.id === item.id)
            ? "fa-solid text-danger"
            : "fa-regular"
        } fa-heart fa-2x btn btn-add-favorite" data-id="${item.id}"></i>
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

// 收藏功能，若已收藏則移除收藏
function addToFavorite(id) {
  const friend = friends.find((friend) => friend.id === id);

  if (list[0]) {
    if (list.some((friend) => friend.id === id)) {
      let index = list.findIndex((friend) => friend.id === id);
      list.splice(index, 1);
      localStorage.setItem("favoriteFriends", JSON.stringify(list));
      renderFriendList(getFriendsByPage(pageCurrent));
      // alert("Just removed it successfully.") //可加提醒視窗
      return;
    }
  }

  list.push(friend);
  localStorage.setItem("favoriteFriends", JSON.stringify(list));
  renderFriendList(getFriendsByPage(pageCurrent));
  // alert("Just added it successfully :)"); //可加提醒視窗
}

// 事件監聽器區 ///////////////////////////////////////////////////////////////////////////////////////////////
// 只要使用者用關鍵字搜尋，就把關鍵字用filter去篩選
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(keyword) ||
      friend.surname.toLowerCase().includes(keyword)
  );

  // 只要過濾後沒東西或輸入空值，就跳出警告視窗
  if (filteredFriends.length === 0 || keyword.length === 0) {
    return alert("Cannot find friends with keyword: " + keyword);
  }

  renderPaginator(filteredFriends.length);
  renderFriendList(getFriendsByPage(1));
});

// 只要使用者點擊圖像，就啟動函式功能讓視窗能讀到該人物卡片資料
// 點擊收藏就啟動收藏功能函式
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-friend")) {
    showFriendModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// 點擊下方分頁就渲染出對應的人物資料
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.classList.contains("page-link")) {
    renderFriendList(getFriendsByPage(event.target.dataset.page));
    pageCurrent = event.target.textContent;

    // 反白過的頁碼要恢復原狀
    // 原本下方第一行是寫 paginator.childNodes.forEach()，但感覺不太妥
    // 因為childNodes有可能撈到元素節點以外的節點，故改用此法
    Array.from(paginator.children).forEach((e) => {
      if (e.classList.contains("active")) {
        e.classList.remove("active");
      }
    });

    // 讓這次點擊的頁碼反白
    event.target.parentElement.classList.add("active");
  }
});

// 串API資料 ///////////////////////////////////////////////////////////////////////////////////////////////
axios
  .get(INDEX_URL)
  .then((response) => {
    friends.push(...response.data.results);
    renderFriendList(getFriendsByPage(1));
    renderPaginator(friends.length);
    // console.log(friends.length); =>印出200
    // console.log(friends); =>印出200個物件
  })
  .catch((err) => console.log(err));
// console.log(friends.length); =>印出0
// console.log(friends); => 印出[]，內含200個物件；後來發現這不叫內含200個物件，而是資料若被更新會有200個物件
