# Drupalize.Me React & Drupal 8 Code Examples

This repo contains the example code used in the https://drupalize.me/series/drupal-8-and-reactjs series.

## Drupal 8

The /drupal directory contains a Drupal 8 project with basic configuration for JSON:API, and to demonstrate embedding a React application inside a Drupal theme or module.

Install all the Drupal dependencies:

```bash
cd /drupal
composer install
```

If you're using ddev this contains ddev configuration and can be started with:

```bash
ddev start
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
