/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://broks.ru',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/api/*', '/admin/*'],
  generateIndexSitemap: false,
};

module.exports = config;
