import * as giacCore from "https://denopkg.com/gov-suite/governed-iac@v0.9.2/core/mod.ts";
import * as autoBaaS from "https://denopkg.com/gov-suite/governed-iac@v0.9.2/models/omnibus/middleware-rdbms-api-auto-baas.services.giac.ts";
import * as pgsc from "https://denopkg.com/gov-suite/governed-iac@v0.9.2/models/persistence/postgreSQL-engine.service.giac.ts";
import * as govnImTrSqlDia from "https://denopkg.com/gov-suite/governed-im-transform@v0.9.2/rds/sql/dialect/mod.ts";
import * as govnImTrSQL from "https://denopkg.com/gov-suite/governed-im-transform@v0.9.2/rds/sql/mod.ts";
import type * as govnImCore from "https://denopkg.com/gov-suite/governed-im@v0.6.5/core/mod.ts";
import type * as artfPersist from "https://denopkg.com/shah/artifacts-persistence@v1.0.24/mod.ts";
import * as contextMgr from "https://denopkg.com/shah/context-manager@v1.0.6/mod.ts";
import * as specModule from "https://denopkg.com/shah/specification-module@v1.0.6/mod.ts";
import * as model from "https://denopkg.com/gov-suite/governed-im-rds@v0.10.5/models/test-model.gim.ts";

function persistRelatedComposeArtifacts(
  ctx: giacCore.ConfigContext,
  dc: giacCore.dockerTr.DockerCompose,
  ph: artfPersist.PersistenceHandler,
  er?: giacCore.OrchestratorErrorReporter,
): giacCore.dockerTr.PersistRelatedComposeArtifactsResult {
  dc.options.configuredServices.forEachService((sc: giacCore.ServiceConfig) => {
    if (sc instanceof pgsc.PostgreSqlEngineServiceConfig) {
      sc.persistRelatedArtifacts(ctx, ph, er);
      govnImTrSQL.transformRdbmsModel(
        govnImTrSqlDia.PostgreSqlTransformerWithDriverScript,
        specModule.specFactory.spec<govnImCore.InformationModel>(
          new model.TestModel(),
        ),
        govnImTrSqlDia.PostgreSqlCommonPkColNamedIdDialect,
        sc.initDbPersistenceHandler(ctx, ph),
      );
    }
  });
  return giacCore.dockerTr.PersistRelatedComposeArtifactsResult
    .PersistRelatedServiceConfigArtifacts;
}

const projectCtx = contextMgr.ctxFactory.projectContext(".");
giacCore.dockerTr.transformDockerArtifacts(
  {
    projectCtx: projectCtx,
    spec: specModule.specFactory.spec<giacCore.ConfiguredServices>(
      new autoBaaS.AutoBaaS(projectCtx),
    ),
    persistRelatedArtifacts: persistRelatedComposeArtifacts,
  },
);
