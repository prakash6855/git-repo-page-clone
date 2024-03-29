import { truncateString } from "./stringHelper.js";

const DEFAULT_ITEMS_PER_PAGE = 10;
const MAXIMUM_WORDS_SIZE_PER_DESCRIPTION = 5;
let user = null;
let repositories = null;
let errorContainer = document.getElementById("error-container");
let userDetailsContainer = document.getElementById("user-details-container");
let reposContainer = document.getElementById("repos-container");
let userDetailsLoader = document.getElementById("user-details-loader");
let userRepoLoader = document.getElementById("user-repo-loader");
let pagination = document.getElementById("pagination");
const repoList = document.getElementById("repo-list");
const reposPerPageInput = document.getElementById("reposPerPageInput");
let ITEMS_PER_PAGE = reposPerPageInput.value;
let searchInput = document.getElementById("repoSearchInput");
const socialLinks = document.getElementById("social-links");

function fetchUserDetails(username) {
  const apiUrl = `https://api.github.com/users/${username}`;

  return fetch(apiUrl).then((response) => {
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`User '${username}' not found.`);
      } else {
        throw new Error(
          `Error fetching GitHub user. Status: ${response.status}`
        );
      }
    }
    return response.json();
  });
}

async function fetchRepositories(username, pageNumber = 1) {
  const reposUrl = `https://api.github.com/users/${username}/repos?page=${pageNumber}&per_page=${ITEMS_PER_PAGE}`;

  try {
    const response = await fetch(reposUrl);

    if (!response.ok) {
      // If you want to set user to null in case of an error,
      // handle this logic outside of the fetchRepositories function
      user = null;
      repositories = null;

      // Assuming errorContainer is defined elsewhere
      if (errorContainer) {
        errorContainer.classList.remove("hidden");
        errorContainer.innerHTML = await response.text();
      }

      throw new Error(
        `Error fetching GitHub repositories. Status: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    console.error(error);
    throw error; // rethrow the error if needed in the calling context
  }
}

function fetchUserAndRepositories(username, pageNumber = 1) {
  return Promise.all([
    fetchUserDetails(username),
    fetchRepositories(username, pageNumber),
  ]);
}
function fetchRepositoriesHelper(username, pageNumber = 1) {
  return Promise.all([fetchRepositories(username, pageNumber)]);
}

function displayUserDetails(user) {
  const profilePicture = document.getElementById("profile-picture");
  const usernameElement = document.getElementById("username");
  const repoCountElement = document.getElementById("repo-count");

  profilePicture.src = user.avatar_url;
  usernameElement.textContent = `${user.login}`;
  repoCountElement.textContent = `Public Repositories: ${user.public_repos}`;

  // Display social links if available
  if (user.blog || user.twitter_username || user.linkedin || user.login) {
    socialLinks.innerHTML = `
      <ul>
        ${
          user.blog
            ? `<li><a href="${user.blog}" target="_blank">Blog</a></li>`
            : ""
        }
        ${
          user.twitter_username
            ? `<li><a href="https://twitter.com/${user.twitter_username}" target="_blank">${user.twitter_username}</a></li>`
            : ""
        }
        ${
          user.linkedin
            ? `<li><a href="${user.linkedin}" target="_blank">LinkedIn</a></li>`
            : ""
        }
        ${
          user.login
            ? `<li><a href="https://github.com/${user.login}" target="_blank">https://github.com/${user.login}</a></li>`
            : ""
        }
      </ul>
    `;
  }
  errorContainer.classList.add("hidden");
}

window.searchRepositories = function () {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filteredRepositories = repositories?.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm)
  );

  displayRepositories(filteredRepositories);
};

function displayRepositories(repositories) {
  const startIndex = 0;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  repoList.innerHTML = "";

  const reposToShow = repositories.slice(startIndex, endIndex);
  const repoListHtml = reposToShow
    .map((repo) => {
      const techStackLabels = repo.language
        ? `<span class="label">${repo.language}</span>`
        : "";

      const truncatedDescription = truncateString(
        repo.description,
        MAXIMUM_WORDS_SIZE_PER_DESCRIPTION
      );

      return `
        <li>
          <div class="repo-item">
            <h3>${repo.name}</h3>
            <p>${truncatedDescription}</p>
            <p class="tech_stack">${techStackLabels}</p>
            <a href="${repo.html_url}" target="_blank">View on GitHub</a>
          </div>
        </li>
      `;
    })
    .join("");

  repoList.innerHTML = `<ul class="container">${repoListHtml}</ul>`;
  reposContainer.classList.remove("hidden");
  userDetailsContainer.classList.remove("hidden");
}

function displayPagination(currentPage, totalPages) {
  const pagination = document.getElementById("pagination");

  // Define the maximum number of page buttons to show
  const maxPageButtons = 5;

  // Calculate the start and end of the range based on the current page
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  // Adjust the range if it exceeds the total pages
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  // Previous button
  const prevButton = `<button onclick="changePage(${currentPage - 1})" ${
    currentPage === 1 ? "disabled" : ""
  }>Previous</button>`;

  // First page button
  const firstPageButton = `<button onclick="changePage(1)" ${
    currentPage === 1 ? "disabled" : ""
  }>First</button>`;

  // Page numbers with ellipsis
  let pageNumbers = "";
  // if (startPage > 1) {
  //   pageNumbers += `<span class="ellipsis">...</span>`;
  // }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers += `<button onclick="changePage(${i})" class="${
      currentPage === i ? "current-page" : ""
    }">${i}</button>`;
  }

  // if (endPage < totalPages) {
  //   pageNumbers += `<span class="ellipsis">...</span>`;
  // }

  // Last page button
  const lastPageButton = `<button onclick="changePage(${totalPages})" ${
    currentPage === totalPages ? "disabled" : ""
  }>Last</button>`;

  // Next button
  const nextButton = `<button onclick="changePage(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }>Next</button>`;

  pagination.innerHTML = `${firstPageButton}${prevButton}${pageNumbers}${nextButton}${lastPageButton}`;
}

window.getDetails = function (newPage = 1) {
  const usernameInput = document.getElementById("usernameInput");
  const username = usernameInput.value.trim();
  ITEMS_PER_PAGE = reposPerPageInput.value;
  if (ITEMS_PER_PAGE <= 0 || ITEMS_PER_PAGE > 100) {
    ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE;
  }
  socialLinks.innerHTML = "";

  if (username === "") {
    alert("Please enter a valid GitHub username.");
    return;
  }
  user = null;
  repositories = null;
  userDetailsContainer.classList.add("hidden");
  reposContainer.classList.add("hidden");
  userDetailsLoader.classList.remove("hidden");
  userRepoLoader.classList.remove("hidden");

  fetchUserAndRepositories(username, newPage)
    .then(([userDetail, repositoriesFound]) => {
      user = userDetail;
      repositories = repositoriesFound;

      // Display repositories
      displayRepositories(repositoriesFound);
      displayUserDetails(userDetail);

      // Update pagination
      const totalPages = Math.ceil(user.public_repos / ITEMS_PER_PAGE);
      displayPagination(newPage, totalPages);
      userDetailsContainer.classList.remove("hidden");
      reposContainer.classList.remove("hidden");
      userDetailsLoader.classList.add("hidden");
      userRepoLoader.classList.add("hidden");
    })
    .catch((error) => {
      // Handle error
      console.error(error);
      user = null;
      repositories = null;
      userDetailsLoader.classList.add("hidden");
      userRepoLoader.classList.add("hidden");
    });
};

window.changePage = function (newPage = 1) {
  repoList.innerHTML = "";
  pagination.innerHTML = "";
  userRepoLoader.classList.remove("hidden");

  fetchRepositoriesHelper(user.login, newPage)
    .then(([repositories]) => {
      // Display repositories and user details
      displayRepositories(repositories);
      // Update pagination
      const totalPages = Math.ceil(user.public_repos / ITEMS_PER_PAGE);
      displayPagination(newPage, totalPages);
      userRepoLoader.classList.add("hidden");
    })
    .catch((error) => {
      // Handle error
      console.error(error);
      userRepoLoader.classList.add("hidden");
    });
};
