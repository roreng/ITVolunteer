const BaseUrl = "http://tep-itv.dench";

const appConfig = {
  BaseUrl,
  GraphQLServer: `${BaseUrl}/graphql`,
  AjaxUrl: `${BaseUrl}/wp-admin/admin-ajax.php`,
  LoginUrl: `${BaseUrl}/itv-protected-99xkQ2bZJH5e-login`,
  RestApiUrl: `${BaseUrl}/wp-json`,
  AuthTokenLifeTimeMs: 600,
  MongoConnection: "mongodb://itv-mongo:27017",
};

module.exports = appConfig;