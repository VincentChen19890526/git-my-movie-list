const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const movies = [];
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const MOVIES_PER_PAGE = 12;
const paginator = document.querySelector("#paginator");
let filteredMovies = [];
let currentPage = 1



axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    console.log(movies);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1)); //修改這裡
  })
  .catch((err) => console.log(err));

function renderMovieList(data) {
  let rawHTML = "";
  if (dataPanel.dataset.mode === 'card-mode') {
    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
        }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id
        }">+</button>
        </div>
      </div>
    </div>
  </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === 'list-mode') {
    data.forEach((item) => {
      // title, image, id 隨著每個 item 改變
      rawHTML += `<div class="col-sm-12">
  <div class="mb-2">
    <div class="card" style="border-top: 1px solid rgba(0, 0, 0, 0.125); border-bottom: 1px solid rgba(0, 0, 0, 0.125); border-left: none; border-right: none;">
      <div class="card-body row align-items-center">
        <div class="col">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="col-lg-auto ms-auto"> 
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>
</div>`;
    });
    dataPanel.innerHTML = rawHTML;
  }
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id); // 修改這裡
  } else if (event.target.matches(".btn-add-favorite")) {
    //添加收藏清單到  local storage
    addToFavorite(Number(event.target.dataset.id));
  }
});

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []; //取出localStorage key:'favoriteMovies' 的內容 轉成javaScript 沒內容則得到空陣列
  const movie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    // some 回報「陣列裡有沒有 item 通過檢查條件」，有回傳 true ，沒有回傳 false。
    return alert("此電影已經在收藏清單中！");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list)); //把變數 const list 放進 localStorage 並轉換成 string
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    console.log("生成modal");
    //生成內容
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}
//下面的 function function getMoviesByPage(page) { } 參數來源有兩個
//一：axios 的 renderMovieList(getMoviesByPage(1))
//二：searchForm.addEventListener(){} 的 renderMovieList(getMoviesByPage(1))
function getMoviesByPage(page) {
  //如果搜尋結果有東西，條件判斷為 true ，會回傳 全域的 filteredMovies，然後用 data 保存回傳值，沒東西則 data = movies
  //下面 data 取用的都是全域變數跟參數無關別被搞混
  const data = filteredMovies.length ? filteredMovies : movies;
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//下面這函式會依照情況收到兩種不同參數
//參數一：movies.length 來自 axios 的 renderPaginator(movies.length)
//參數二：filteredMovies.length  來自 searchForm.addEventListener((){})
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  //製作 template
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page);
  //更新畫面，這裡會回傳 getMoviesByPage(data.slice)處理完的結果 給 renderMovieList
  currentPage = page
  renderMovieList(getMoviesByPage(currentPage));
});

//版本一 不接受空字串  78~80 配置的
// searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
//   //取消預設事件
//   event.preventDefault()
//   //取得搜尋關鍵字
//   const keyword = searchInput.value.trim().toLowerCase()
//   //儲存符合篩選條件的項目
//   let filteredMovies = []
//   //錯誤處理：輸入無效字串
//   if (!keyword.length) {
//     return alert('請輸入有效字串！')
//   }
//   //條件篩選
//   filteredMovies = movies.filter((movie) =>
//     movie.title.toLowerCase().includes(keyword)
//   )
//   //重新輸出至畫面
//   renderMovieList(filteredMovies)
// })

//版本二 空字串返回所有電影
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  // if (!keyword.length) {  //這裡本來是阻擋空字串，現在把它取消，空字串就會通過成為篩選條件
  //   return alert('請輸入有效字串！')
  // }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(currentPage));
});



function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return
  dataPanel.dataset.mode = displayMode
}


searchForm.addEventListener('click', function onSwitchClicked(event) {
  if (event.target.matches('.fa-th')) {
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('.fa-bars')) {
    changeDisplayMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})



