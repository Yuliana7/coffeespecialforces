import {
  defineRailway,
  github,
  preserve,
  project,
  service,
  volume,
} from "railway/iac";

/*
 * Railway Infrastructure as Code. This file is the desired state of the whole
 * Railway environment: `railway config plan` diffs it against what is live and
 * `railway config apply` reconciles the two. Anything removed from here is
 * deleted on the next apply, so keep every resource in this one file.
 *
 * It replaces the older `railway.json` / `railway.toml` "Config as Code", which
 * is deprecated — new services cannot opt into it and existing files stop being
 * read on 2026-12-01.
 */

/**
 * The database file and the uploads directory both live on local disk, so both
 * have to sit on the volume or a redeploy loses them. One volume holds both.
 *
 * A volume attaches to exactly one service and cannot be shared, which is what
 * caps this project at a single instance — see CLAUDE.md.
 */
const VOLUME_PATH = "/data";

/**
 * Amsterdam — the closest region to the site's Ukrainian readers. Railway
 * charges the same rates in every region (billing is per minute of CPU, memory,
 * egress and volume size), so this is a latency choice, not a cost one. The
 * identifiers are listed in Railway's "Regions" reference; the trailing suffix
 * is part of the name for every region except `us-west2`.
 */
const REGION = "europe-west4-drams3a";

export default defineRailway((ctx) => {
  const data = volume("coffeesf-data", {
    region: REGION,
    sizeMB: 5000,
  });

  const web = service("web", {
    source: github("Yuliana7/coffeespecialforces", { branch: "main" }),

    /*
     * A volume follows the region of the service it is attached to, so pinning
     * the service is what actually places both. Left unset, the service would
     * land in the workspace's default region and the volume would be migrated
     * to follow it — which is downtime, not a no-op.
     */
    replicas: { [REGION]: 1 },

    build: "pnpm build",

    /*
     * Migrations run here rather than in `preDeploy`, because Railway does not
     * mount volumes for the pre-deploy container — a migration there would
     * apply to a throwaway filesystem and the real database would stay empty.
     *
     * `mkdir -p` covers the first boot, when the volume is an empty directory
     * and nothing has created the uploads folder yet.
     *
     * NODE_ENV is set on the command rather than as a service variable, because
     * service variables are also present during the build. `next start` sets it
     * itself; `payload migrate` runs before that, and @payloadcms/db-sqlite
     * turns schema auto-push on whenever NODE_ENV is not "production" — which
     * stops at an interactive y/N prompt and hangs the deploy with no error.
     */
    start: `mkdir -p ${VOLUME_PATH}/media && NODE_ENV=production pnpm payload migrate && pnpm start`,

    volumeMounts: {
      [VOLUME_PATH]: data,
    },

    env: {
      /*
       * `preserve()` keeps whatever value is set on Railway, so the secret
       * never enters git. Set it once with
       *   railway variables --set PAYLOAD_SECRET="$(openssl rand -base64 32)"
       *
       * It still has to be listed here: this file is the complete desired
       * state, so a variable missing from it is deleted on the next apply.
       */
      PAYLOAD_SECRET: preserve(),

      DATABASE_URI: `file:${VOLUME_PATH}/coffeesf.db`,
      MEDIA_DIR: `${VOLUME_PATH}/media`,

      /*
       * Railway injects PORT and expects the process to listen on it, which
       * `next start` already does. It is pinned anyway so the port is knowable
       * before anything runs: Railway's "magic port detection" reads the port
       * off a *running* deployment, and the first deploy here crashes before it
       * listens, so the Generate Domain dialog would otherwise have nothing to
       * detect and would ask. The answer to that prompt is this number.
       */
      PORT: "3000",

      /*
       * `${{...}}` is Railway's own template syntax, resolved by Railway when
       * it materialises the variable — not by Next, and not by the shell.
       * RAILWAY_PUBLIC_DOMAIN is injected by Railway and holds the service's
       * public hostname (`web-production-xxxx.up.railway.app`). It is empty
       * until a domain exists, which is why the domain is generated before the
       * deploy that counts.
       *
       * Must be exactly the public origin or Payload rejects every save in the
       * admin panel with a 403 while reads keep working. Next inlines
       * NEXT_PUBLIC_* at build time, so changing the domain needs a rebuild,
       * not a restart.
       *
       * Once a custom domain exists, replace this with that origin spelled out.
       * RAILWAY_PUBLIC_DOMAIN resolves to "the public service or customer
       * domain" — with both attached it names one of them, and requests from
       * the other are then rejected as cross-origin.
       */
      NEXT_PUBLIC_SERVER_URL: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
    },
  });

  return project(ctx.projectName ?? "coffeespecialforces", {
    resources: [web, data],
  });
});
