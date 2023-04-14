"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const url = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const result = await axios.get(
    `https://api.tvmaze.com/search/shows?q=${term}`
  );
  return result.data.map(function (element) {
    const show = element.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.original : url,
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div class="col-md-4 col-lg-4 Show" data-show-id="${show.id}">
      <div class="card" data-show-id="${show.id}">
           <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="card-name">${show.name}</h5>
             <p>${show.summary}</p>
             <button class="btn btn-primary get-episodes">Episodes</button> 
             </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const results = await axios.get(
    `https://api.tvmaze.com/shows/${id}/episodes`
  );
  return results.data.map(function (episode) {
    ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    });
  });
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();
  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`
    );
    $episodesList.append($episode);
  }
  $episodesArea.show();
}

$("#show-list").on(
  "click",
  ".get-episodes",
  async function handleEpisodeClick(evt) {
    const id = $(evt.target).closest(".Show").data("show-id");
    const episodes = await getEpisodesOfShow(id);
    populateEpisodes(episodes);
  }
);
