import { IModelWithAppAndEntrypoint, PostType } from "../model.typing";
import { capitalize } from "../../utilities/utilities";

const pageModel = async (request, postType, pageQueryVars) => {
  const pageModel = await import("../page-model");
  const pageQuery = pageModel.graphqlQuery[`get${capitalize(postType)}BySlug`];
  const { [`${postType}By`]: page } = await request(
    process.env.GraphQLServer,
    pageQuery,
    pageQueryVars
  );

  return ["page", page];
};

const archiveModel = async (request, postType, archiveQueryVars) => {
  const archiveModel = await import("../archive-model");
  const archiveQuery = archiveModel.graphqlQuery[`get${capitalize(postType)}s`];
  const { [`${postType}s`]: archive } = await request(
    process.env.GraphQLServer,
    archiveQuery,
    archiveQueryVars
  );

  if (postType === "task") {
    Object.assign(archive, {
      seo: {
        canonical: "https://itv.te-st.ru/tasks",
        title: "Задачи - it-волонтер",
        opengraphTitle: "Задачи - it-волонтер",
        opengraphUrl: "https://itv.te-st.ru/tasks",
        opengraphSiteName: "it-волонтер",
      },
    });
  }

  return ["archive", archive];
};

const withAppAndEntrypointModel = async ({
  isArchive = false,
  entrypointQueryVars = null,
  entrypointType = "page" as PostType,
  componentModel,
}): Promise<IModelWithAppAndEntrypoint> => {
  const { request } = await import("graphql-request");
  const appModel = await import("../app-model");
  const appQuery = appModel.graphqlQuery.getMenusByLocation;

  const {
    menuItems: { nodes: socialMenu },
  } = await request(process.env.GraphQLServer, appQuery, {
    location: "SOCIAL",
  });

  const [entrypointTemplate, entrypointModel] = isArchive
    ? await archiveModel(request, entrypointType, entrypointQueryVars)
    : await pageModel(request, entrypointType, entrypointQueryVars);

  const componentData = isArchive
    ? {
        items: entrypointModel.edges.map(({ node: item }) => item),
      }
    : null;

  const [componentName, component] = await componentModel(
    request,
    componentData
  );

  const model = {
    app: {
      entrypointTemplate,
      menus: { social: socialMenu },
    },
    entrypointType,
    entrypoint: {
      [entrypointTemplate]: entrypointModel,
    },
    [componentName]: component,
  };

  return model;
};

export default withAppAndEntrypointModel;
