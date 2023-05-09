import { Octokit } from 'https://cdn.skypack.dev/@octokit/core?dts';
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

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}
interface Release {
  tagName: string;
  name: string;
  createdAt: Date;
  tagCommit: {
    abbreviatedOid: string;
    oid: string;
    addtions: number;
    deletions: number;
  }
  author: {
    name: string;
  }
}

const octokit = new Octokit({
  userAgent: "Script via Deno",
  auth: Deno.env.get("GITHUB_TOKEN")!,
  timeZone: "Asia/Tokyo",
});

const listReleases  = async (owner: string, repo: string, size = 100, cursor?: string): Promise<{ pageInfo: PageInfo, releases: Release[] }> => {
  const resp = await octokit.graphql<{ repository: { releases: { pageInfo: PageInfo, nodes: Release[] } } }>(`
  query ($owner: String!, $repo: String!, $size: Int = 100, $cursor: String) {
    repository(owner: $owner, name: $repo) {
      releases(first: $size, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          createdAt
          tagName
          name
          tagCommit {
            abbreviatedOid
            oid
            additions
            deletions
          }
          author {
            name
          }
        }
      }
    }
  }`, {
    owner,
    repo,
    size,
    cursor,
  });

  const { pageInfo, nodes: releases } = resp.repository.releases;
  return { pageInfo, releases };
};

const listAllReleases = async (aggregate: Release[], owner: string, repo: string,cursor?: string): Promise<Release[]> => {
  console.warn("aggregated", aggregate.length);
  const { pageInfo, releases } = await listReleases(owner, repo, 100, cursor);
  const result = aggregate.concat(releases);
  if (!pageInfo.hasNextPage) {
    return result;
  }

  return await listAllReleases(result, owner, repo, pageInfo.endCursor);
}

const owner = Deno.env.get("GITHUB_OWNER")!;
const repo = Deno.env.get("GITHUB_REPO")!;

const all = await listAllReleases([], owner, repo);
const releases = all.filter((v) => v.createdAt && v.tagName.startsWith("prod"))

console.log(["repo","tag_name","tag_commit","diff_days","created_at","publisher","name"].join("\t"));
releases
  .forEach((release, i) => {
    if (i + 1 >= releases.length) {
      const output = [
        repo,
        release.tagName,
        release.tagCommit.abbreviatedOid,
        0,
        release.createdAt,
        release.author.name,
        release.name,
      ]
      console.log(`${output.join("\t")}`);
      return;
    }
    const createdAt = new Date(release.createdAt!);

    const previous = releases[i + 1];
    const previouscreatedAt = new Date(previous.createdAt!);
    const diff = difference(createdAt, previouscreatedAt, { units: ["days"] });

    const output = [
      repo,
      release.tagName,
      release.tagCommit.abbreviatedOid,
      diff.days,
      release.createdAt,
      release.author.name,
      release.name,
    ]
    console.log(`${output.join("\t")}`);
  });
