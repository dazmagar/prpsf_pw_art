# Testing Project

## Setup

1. Clone the repository:

   ```bash
   git clone ...
   ```

2. Navigate to the project directory:

   ```bash
   cd <test_project>
   ```

3. Install the dependencies:

   ```bash
   yarn install
   ```

4. Install Playwright browsers:

   ```bash
   yarn playwright install
   ```

## Test Users Configuration: Local Environment and GitHub Secrets

Before running the tests, you need to create a `users.csv` file in the `resources` folder.

### 1) Manually Create Users File (Local Setup)

- If you want to manually create the `users.csv` file, it should contain test users in the following format:

  ```csv
  email,pass
  user1@email.com,pass1
  user2@email.com,pass2
  user3@email.com,pass3
  ```

or see example in `resources\example.users.csv`

### 2) Dynamically Generate Users File (Local Setup)

To dynamically generate the `users.csv` file from environment variables, you can set up `email` and `password` variables as follows:

You can define test user credentials as environment variables in your terminal session.

- If you want to set the same password for all users, you can set `TEST_USER_PASSWORD`:

  ```bash
  export TEST_USER_EMAIL_1=user1@email.com
  export TEST_USER_EMAIL_2=user2@email.com
  export TEST_USER_PASSWORD=common_password
  ```

- If you want to use different passwords for each user, set `TEST_USER_PASSWORD_X` for each user:

  ```bash
  export TEST_USER_EMAIL_1=user1@email.com
  export TEST_USER_PASSWORD_1=password1
  export TEST_USER_EMAIL_2=user2@email.com
  export TEST_USER_PASSWORD_2=password2
  ```

- To generate the users.csv file, run:

  ```js
  node -e "require('./utils/helpers').generateUsersCSV()"
  ```

The `users.csv` file will be created in the `resources` folder, using the path specified in `config.json`.

### 3) GitHub Actions Setup

When running tests in GitHub Actions, you can store the test user credentials securely in GitHub Secrets. Here's how to set it up:

1. Go to your repository on GitHub.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Add the following secrets for test users:

   - `TEST_USER_EMAIL_1`
   - `TEST_USER_PASSWORD_1`
   - `TEST_USER_EMAIL_2`
   - `TEST_USER_PASSWORD_2`
   - Or add `TEST_USER_PASSWORD` for a global password for all users.

4. In your GitHub Actions workflow, you need to explicitly pass the secrets as environment variables in the `env` section.
   This will ensure that the secrets are available in your Node.js script via process.env. Here's an example workflow that generates the `users.csv` file using the secrets:

```yaml
jobs:
  load-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Generate users.csv
        env:
          TEST_USER_EMAIL_1: ${{ secrets.TEST_USER_EMAIL_1 }}
          TEST_USER_EMAIL_2: ${{ secrets.TEST_USER_EMAIL_2 }}
          TEST_USER_EMAIL_3: ${{ secrets.TEST_USER_EMAIL_3 }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
        run: node -e "require('./utils/helpers').generateUsersCSV()"
```

## Running Tests

### Running E2E Tests in Different Browsers

Playwright tests can be run in **Chrome (Chromium)** or **Safari (WebKit)**. The project is configured to support multiple browsers.

- To run demo tests in **Chrome (Chromium)**:

  ```bash
  yarn pw:demo:chromium
  ```

- To run demo tests in **Safari (WebKit)**:

  ```bash
  yarn pw:demo:webkit
  ```

- To run editor tests in **Chrome (Chromium)**:

  ```bash
  yarn pw:editor:chromium
  ```

- To run editor tests in **Safari (WebKit)**:

  ```bash
  yarn pw:editor:webkit
  ```

You can also run the tests for all configured browsers (Chrome and Safari) at once:

- Run demo tests in all browsers:

  ```bash
  yarn pw:demo
  ```

- Run editor tests in all browsers:

  ```bash
  yarn pw:editor
  ```

### Running Load Tests

Before running the load tests, you need to generate the Artillery configuration file:

1. Generate Artillery configuration:

   ```bash
   yarn art-gen
   ```

2. Run load tests and publish reports to Artillery Cloud:

   #### 1) Local Run

   To run load tests locally and publish reports to Artillery Cloud, you need to add your API key in the command. For local usage, you can either export the key as an environment variable or add it directly in the command:

   - Export the key as an environment variable:

     ```bash
     export ARTILLERY_CLOUD_API_KEY=your_api_key_here
     ```

   - Run the command using the environment variable:

     ```bash
     yarn art-cloud --key $ARTILLERY_CLOUD_API_KEY
     ```

   Alternatively, you can directly pass the API key:

   ```bash
   yarn art-cloud --key <your_api_key_here>
   ```

   #### 2) Running in GitHub Actions

   For GitHub Actions, store the `ARTILLERY_CLOUD_API_KEY` in GitHub Secrets to keep it secure:

   1. Add the key to **Settings** > **Secrets and variables** > **Actions** in your repository.
   2. Use the following command in your GitHub Actions workflow file to securely pass the secret during load test execution:

      ```yaml
      - name: Run Artillery Load Tests
        run: yarn art-cloud --key ${{ secrets.ARTILLERY_CLOUD_API_KEY }}
      ```

   This way, your API key will remain secure both locally and in CI/CD pipelines without exposing it in your codebase.

```

```
