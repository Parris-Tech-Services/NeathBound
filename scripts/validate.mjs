#!/usr/bin/env node
/** Read-only cross-engine source validation, including CMS publication checks. */
import {spawnSync} from "node:child_process";
import {readFileSync} from "node:fs";
const pkg=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
const commands=pkg.name==="neathbound"
 ? [["tools/cms/build.mjs","--check"],["tools/validate-content.mjs"]]
 : [["tools/cms/build.mjs","--check"],["scripts/validate-content.mjs"],["scripts/content-tracker.mjs","--check"]];
for(const argv of commands){
 const result=spawnSync(process.execPath,argv,{stdio:"inherit"});
 if(result.status!==0)process.exit(result.status||1);
}
console.log("Studio content and engine reference checks passed.");
