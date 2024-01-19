# GitHub Repositories Viewer

This web application enables users to fetch and explore GitHub repositories for a specific user. Users can input a GitHub username, set the number of repositories per page, and effortlessly navigate through paginated lists. Additionally, the application provides a search functionality, allowing users to refine their view by searching through repositories.


## Features

- **User Details Display:** Fetches and displays user details, including profile picture, username, and social links (if available).

- **Repository List:** Retrieves and displays a paginated list of public repositories for the specified GitHub user.

- **Pagination:** Allows users to navigate through the pages of repositories.

- **Loader:** Shows loaders during API calls to indicate that data is being fetched.

- **Filter:** Optionally, users can use the search bar to filter repositories based on the repository name.

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/prakash6855/git-repo-page-clone.git
   ```

2. Open `index.html` in a web browser or deploy it on a web server.

3. Enter a valid GitHub username, choose the number of repositories per page, and click "Fetch Repositories."

4. Explore the user details, repositories, and use pagination to navigate.

5. You can use the search bar to filter repositories based on the repository name.

## Usage

- Enter a GitHub username in the input field and click "Fetch Repositories."

- Optionally, adjust the number of repositories per page using the input field.

- Explore the user details, including profile picture, username, and social links.

- Navigate through the paginated list of repositories using the pagination controls.

- Use the search bar to filter repositories based on name or description.

## What Can Be Improved

### Language Information for Each Repository

Currently, when fetching the list of repositories, the GitHub API provides only one language for each repository. Consider implementing a mechanism to hit the specific repository API for more detailed language information, as some repositories may have multiple languages.

### Enhanced Color Schemes

To improve the overall visual experience, consider exploring and implementing enhanced color schemes. A visually appealing and intuitive design can contribute to a better user experience.

### Responsive Design

Enhance the web application's responsiveness by incorporating CSS media queries. This will ensure a consistent and user-friendly experience across various devices and screen sizes.

### Authentication for GitHub API

GitHub has API rate limits, and without authentication, there's a risk of hitting those limits. To address this, consider adding authentication at the backend and making authenticated API calls to GitHub. This will help prevent throttling and provide a more reliable service.

## Live Demo

Explore the GitHub Repositories Viewer in action by visiting the live demo:

[GitHub Repositories Viewer Demo](https://prakash6855.github.io/git-repo-page-clone/)

Feel free to interact with the application, fetch repositories, and try out the various features.

## Contributing

Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.

## Acknowledgments

- This project uses the GitHub API to fetch user details and repositories.

## Authors

- Prakash

Feel free to customize the content based on your project's specifics, and add additional sections as needed.
