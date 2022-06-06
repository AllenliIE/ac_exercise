const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12 //分頁顯示數量

const movies = []
let filteredMovies = [] //儲存符合篩選條件的項目
let modeLayout = "card" //預設卡片畫面

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const clickAndChangeMode = document.querySelector('#change-mode')

function renderMovieList(data) {
  if (modeLayout === 'card') {
    let rawHTML = ''
    data.forEach((item) => {
      //title, image
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
      `
    })
    //processing
    dataPanel.innerHTML = rawHTML
  } else if (modeLayout === 'list') { //新增list頁面
    let rawHTML = `<ul class="list-group col-sm-12 mb-2">`
    data.forEach((item) => {
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div class="list-group-btn">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
            More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
      `
    })
    rawHTML += `</ul>`
    dataPanel.innerHTML = rawHTML
  }
}

function renderPaginator(amount) {
  // 80 / 12 = 6.8 => 7
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}


function getMoviesByPage(page) {
  //page 1 -> movies 0~11
  //page 2 -> movies 12~13
  //movies? "movies" "filteredMovies"
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  //set elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  //get request to shoe api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results

    //insert data
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date : ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" 
    alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//clicked and change mode
clickAndChangeMode.addEventListener('click', function onModeClicked(event) {
  if (event.target.matches('#card-mode-button')) {
    modeLayout = "card"
  } else if (event.target.matches('#list-mode-button')) {
    modeLayout = "list"
  }
  renderMovieList(getMoviesByPage(1))
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    //新增以下
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  //'A' === <a></a>
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //取消預設事件
  const keyword = searchInput.value.trim().toLowerCase() //取得搜尋關鍵字
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  ) //條件篩選
  if (filteredMovies.length === 0) {
    return alert('Please enter valid string!')
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1)) //重新輸出至畫面
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))
