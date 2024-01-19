const ITEMS_PER_PAGE = 10;
const MAXIMUM_WORDS_SIZE_PER_DESCRIPTION = 20;
const DEFAULT_DESCRIPTION = "No Description provided";

function fetchRepositories(pageNumber = 1) {
  const usernameInput = document.getElementById("usernameInput");
  const username = usernameInput.value.trim();

  if (username === "") {
    alert("Please enter a valid GitHub username.");
    return;
  }

  const apiUrl = `https://api.github.com/users/${username}`;
  const reposUrl = `https://api.github.com/users/${username}/repos?page=${pageNumber}&per_page=${ITEMS_PER_PAGE}`;

  // Reset the content in case there was a previous search
  const repoList = document.getElementById("repo-list");
  const userDetailsContainer = document.getElementById(
    "user-details-container"
  );
  const profilePicture = document.getElementById("profile-picture");
  const usernameElement = document.getElementById("username");
  const repoCountElement = document.getElementById("repo-count");
  const socialLinks = document.getElementById("social-links");

  if (!userDetailsContainer) {
    console.error("Element with ID 'user-details-container' not found.");
    return;
  }
  const errorContainer = document.getElementById("error-container");
  if (errorContainer) {
    errorContainer.classList.add("hidden");
  }

  repoList.innerHTML = "";
  userDetailsContainer.classList.add("hidden");
  let repoCount = 0;

  fetch(apiUrl)
    .then((response) => {
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
    })
    .then((user) => {
      profilePicture.src = user.avatar_url;
      usernameElement.textContent = `${user.login}`;
      repoCountElement.textContent = `Public Repositories: ${user.public_repos}`;
      repoCount = user.public_repos;

      // Display social links if available
      if (user.blog || user.twitter_username || user.linkedin) {
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
            </ul>
          `;
      }

      userDetailsContainer.classList.remove("hidden");

      // Fetch and display repositories
      return fetch(reposUrl);
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error fetching GitHub repositories. Status: ${response.status}`
        );
      }
      return response.json();
    })
    .then((repositories) => {
      if (repositories.length === 0) {
        throw new Error(`User '${username}' has no public repositories.`);
      }

      // Paginate repositories
      const totalPages = Math.ceil(repoCount / ITEMS_PER_PAGE);

      displayRepositories(repositories);

      // Display pagination
      displayPagination(pageNumber, totalPages);
    })
    .catch((error) => {
      const errorMessage =
        error.message === `User '${username}' not found.`
          ? `<p style="color: red;">User not found. Please enter a valid GitHub username.</p>`
          : `<p style="color: red;">${error.message}</p>`;

      const errorContainer = document.getElementById("error-container");
      if (errorContainer) {
        errorContainer.innerHTML = errorMessage;
        errorContainer.classList.remove("hidden");
      } else {
        console.error("Element with ID 'error-container' not found.");
      }
    });
}

function displayRepositories(repositories) {
  const repoList = document.getElementById("repo-list");
  const reposContainer = document.getElementById("repos-container");
  const startIndex = 0;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  repoList.innerHTML = "";

  const reposToShow = repositories.slice(startIndex, endIndex);
  const repoListHtml = reposToShow
    .map((repo) => {
      const techStackLabels = repo.language
        ? `<span class="label">${repo.language}</span>`
        : "";

      // Limit description to 20 words and append "..."
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
}

function truncateString(str, limit) {
  const words = str?.split(" ");
  if (words?.length > limit) {
    return words.slice(0, limit).join(" ") + "...";
  }
  if (str == "" || str == null) {
    return DEFAULT_DESCRIPTION;
  }
  return str;
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

  // Page numbers with ellipsis
  let pageNumbers = "";
  if (startPage > 1) {
    pageNumbers += `<button onclick="changePage(1)">1</button>`;
    if (startPage > 2) {
      pageNumbers += `<span class="ellipsis">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers += `<button onclick="changePage(${i})" class="${
      currentPage === i ? "current-page" : ""
    }">${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageNumbers += `<span class="ellipsis">...</span>`;
    }
    pageNumbers += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
  }

  // Next button
  const nextButton = `<button onclick="changePage(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }>Next</button>`;

  pagination.innerHTML = `${prevButton}${pageNumbers}${nextButton}`;
}

function changePage(newPage) {
  fetchRepositories(newPage);
}
