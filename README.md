# Drupalize.Me React & Drupal 8 Code Examples

This repo contains the example code used in the https://drupalize.me/series/drupal-8-and-reactjs series.

**Note:** The `hello-world` branch contains a trimmed down version of the code that reflects the application as it would be after completing this tutorial covering how to [Connect React to a Drupal Theme or Module](https://drupalize.me/tutorial/connect-react-drupal-theme-or-module?p=3253).

## Drupal 8

The /drupal directory contains a Drupal 8 project with basic configuration for JSON:API, and to demonstrate embedding a React application inside a Drupal theme or module.

Install all the Drupal dependencies:

```bash
cd drupal
composer install
```

Then import the database snapshot in _drupal/backup.sql.gz_.

The default admin account is admin/admin. You can change this with `drush upwd admin {NEW_PASSWORD}`.

If you're using [ddev](https://ddev.readthedocs.io/en/stable/) this contains ddev configuration and can be started with:

```bash
cd drupal
# Start ddev.
ddev start
# Install/update composer dependencies.
ddev composer install
# Import the database snapshot.
ddev import-db --src=./backup.sql.gz
# Run any necessary database updates, and re-import config.
ddev exec "drush updb -y && drush cim -y && drush cr -y"
```

The _/drupal/web/themes/react\_example\_theme/_ contains a custom theme with a React application embedded via the theme. This demonstrates using Webpack to bundle and transpile React/JavaScript files.

```bash
cd /drupal/web/themes/react_example_theme;
npm install
# Build the production JS files:
npm run build
# Build development JS files
npm run build:dev
# Start webpack in --watch mode while doing development
npm run start
# Start webpack in --watch mode with hot module reloading
# Requires some config to proxy requests to Drupal see .proxyrc
npm run start:hmr
```

## Decoupled React Application

The _/react-decoupled_ directory contains an example decoupled React application built with create-react-app. It is built to interact with the API provided by Drupal 8 installed in _/drupal_.

To download dependencies and start the local development server run:

```bash
cd react-decoupled
yarn install
yarn run start
```

You might need to update some configuration to make sure it points to your local Drupal installation.
