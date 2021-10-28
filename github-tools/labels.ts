import { Octokit } from "https://cdn.skypack.dev/octokit?dts";

const octokit = new Octokit({
  auth: Deno.env.get("GITHUB_TOKEN"),
  userAgent: 'deno',
});

const createLabel = async ({ owner, repo, text, color }: { owner: string; repo: string; text: string; color: string }) => {
  await octokit.request("POST /repos/{owner}/{repo}/labels", {
    owner,
    repo,
    name: text,
    color,
  });
  return text;
};

await [
  "repo",
].reduce(async (p, it) => {
  await p;
  console.log("Start creating label in ", it);
  return createLabel({
    owner: "owner",
    repo: it,
    text: "no release",
    color: "bfd4f2",
  })
}, Promise.resolve(""));
