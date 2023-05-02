import { Octokit as OctokitCore } from 'https://cdn.skypack.dev/@octokit/core?dts';
import { restEndpointMethods } from 'https://cdn.skypack.dev/@octokit/plugin-rest-endpoint-methods?dts';
import { difference } from "https://deno.land/std@0.185.0/datetime/difference.ts";

if (!Deno.env.has("GITHUB_TOKEN")) {
  throw new Error("Please set GITHUB_TOKEN");
}
if (!Deno.env.has("GITHUB_OWNER")) {
  throw new Error("Please set GITHUB_OWNER");
}
if (!Deno.env.has("GITHUB_REPO")) {
  throw new Error("Please set GITHUB_REPO");
}


const Octokit = OctokitCore.plugin(restEndpointMethods);
const octokit = new Octokit({
  userAgent: "Script via Deno",
  auth: Deno.env.get("GITHUB_TOKEN")!,
  timeZone: "Asia/Tokyo",
});

const listAllReleases = async (owner: string, repo: string) => {
  const releases: Awaited<ReturnType<typeof octokit.rest.repos.listReleases>>[] = [];

  let page = 1;
  while (true) {
    const resp = await octokit.rest.repos.listReleases({
      owner,
      repo,
      per_page: 100,
      page,
      sort: "created",
      direction: "desc",
    });
    releases.push(resp);

    if (resp.headers.link?.match(/rel="next"/)) {
      page++;
    } else {
      break;
    }
  }
  return releases.map((r) => r.data).flat();
};


const owner = Deno.env.get("GITHUB_OWNER")!;
const repo = Deno.env.get("GITHUB_REPO")!;
const all = await listAllReleases(owner, repo);
const releases = all.filter((v) => v.created_at && v.tag_name.startsWith("prod-") && v.target_commitish === "master")

console.log(["repo","tag_name","diff_days","created_at","publisher","name"].join("\t"));
releases
  .forEach((release, i) => {
    if (i + 1 >= releases.length) {
      const output = [
        repo,
        release.tag_name,
        0,
        release.created_at,
        release.author.login,
        release.name,
      ]
      console.log(`${output.join("\t")}`);
      return;
    }
    const createdAt = new Date(release.created_at!);

    const previous = releases[i + 1];
    const previouscreatedAt = new Date(previous.created_at!);
    const diff = difference(createdAt, previouscreatedAt, { units: ["days"] });

    const output = [
      repo,
      release.tag_name,
      diff.days,
      release.created_at,
      release.author.login,
      release.name,
    ]
    console.log(`${output.join("\t")}`);
  });
