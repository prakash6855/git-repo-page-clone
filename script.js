const ITEMS_PER_PAGE = 5;

function fetchRepositories() {
  const usernameInput = document.getElementById("usernameInput");
  const username = usernameInput.value.trim();

  if (username === "") {
    alert("Please enter a valid GitHub username.");
    return;
  }

  const apiUrl = `https://api.github.com/users/${username}`;
  const reposUrl = `https://api.github.com/users/${username}/repos`;

  // Reset the content in case there was a previous search
  const repoList = document.getElementById("repo-list");
  const userDetails = document.getElementById("user-details");
  const userDetailsContainer = document.getElementById(
    "user-details-container"
  );
  const profilePicture = document.getElementById("profile-picture");
  const usernameElement = document.getElementById("username");
  const repoCountElement = document.getElementById("repo-count");
  const socialLinks = document.getElementById("social-links");

  repoList.innerHTML = "";
  userDetailsContainer.classList.add("hidden");

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
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
      usernameElement.textContent = `GitHub Username: ${user.login}`;
      repoCountElement.textContent = `Public Repositories: ${user.public_repos}`;

      // Display social links if available
      if (user.blog || user.twitter || user.linkedin) {
        socialLinks.innerHTML = `
                    <p>Social Links:</p>
                    <ul>
                        ${
                          user.blog
                            ? `<li><a href="${user.blog}" target="_blank">Blog</a></li>`
                            : ""
                        }
                        ${
                          user.twitter
                            ? `<li><a href="https://twitter.com/${user.twitter}" target="_blank">Twitter</a></li>`
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
      const totalPages = Math.ceil(repositories.length / ITEMS_PER_PAGE);
      const currentPage = 1;

      displayRepositories(repositories, currentPage, totalPages);

      // Display pagination
      displayPagination(currentPage, totalPages);
    })
    .catch((error) => {
      const errorMessage = `<p style="color: red;">${error.message}</p>`;
      userDetails.innerHTML = errorMessage;
      userDetailsContainer.classList.remove("hidden");
    });
}

function displayRepositories(repositories, currentPage, totalPages) {
  const repoList = document.getElementById("repo-list");
  const reposContainer = document.getElementById("repos-container");
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  repoList.innerHTML = "";

  const reposToShow = repositories.slice(startIndex, endIndex);
  const repoListHtml = reposToShow
    .map((repo) => {
      const techStackLabels = repo.language
        ? `<span class="label">${repo.language}</span>`
        : "";
      return `
            <li>
                <div class="repo-item">
                    <h3>${repo.name}</h3>
                    <p>${repo.description || "No description available"}</p>
                    <p class="tech_stack">${techStackLabels}</p>
                    <a href="${
                      repo.html_url
                    }" target="_blank">View on GitHub</a>
                </div>
            </li>
        `;
    })
    .join("");

  repoList.innerHTML = `<ul>${repoListHtml}</ul>`;
  reposContainer.classList.remove("hidden");
}

function displayPagination(currentPage, totalPages) {
  const pagination = document.getElementById("pagination");

  // Previous button
  const prevButton = `<button onclick="changePage(${currentPage - 1})" ${
    currentPage === 1 ? "disabled" : ""
  }>Previous</button>`;

  // Page numbers
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => {
    const pageNumber = i + 1;
    return `<button onclick="changePage(${pageNumber})" class="${
      currentPage === pageNumber ? "current-page" : ""
    }">${pageNumber}</button>`;
  }).join("");

  // Next button
  const nextButton = `<button onclick="changePage(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }>Next</button>`;

  pagination.innerHTML = `${prevButton}${pageNumbers}${nextButton}`;
}

function changePage(newPage) {
  const usernameInput = document.getElementById("usernameInput");
  const username = usernameInput.value.trim();

  const reposUrl = `https://api.github.com/users/${username}/repos`;

  fetch(reposUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Error fetching GitHub repositories. Status: ${response.status}`
        );
      }
      return response.json();
    })
    .then((repositories) => {
      const totalPages = Math.ceil(repositories.length / ITEMS_PER_PAGE);

      // Validate the newPage value
      newPage = Math.max(1, Math.min(newPage, totalPages));

      // Display repositories for the new page
      displayRepositories(repositories, newPage, totalPages);

      // Display pagination for the new page
      displayPagination(newPage, totalPages);
    })
    .catch((error) => {
      const errorMessage = `<p style="color: red;">${error.message}</p>`;
      const userDetails = document.getElementById("user-details");
      const userDetailsContainer = document.getElementById(
        "user-details-container"
      );
      userDetails.innerHTML = errorMessage;
      userDetailsContainer.classList.remove("hidden");
    });
}
