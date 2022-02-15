const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  build: {
    // https://qiita.com/hiroyukiwk/items/b283ef5312b289be6ce8
    babel: {
      presets({ isServer }, [preset, options]) {
        options.loose = true;
      },
    },
  },
};

module.exports = withPWA({
  pwa: {
    dest: "public",
    runtimeCaching,
  },
  ...nextConfig,
});
