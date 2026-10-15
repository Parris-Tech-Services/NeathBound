import test from "node:test";
import assert from "node:assert/strict";
import {loadEditorialContext} from "../tools/storylet-generator.mjs";
test("Groq prompt builder always includes the actual local bible and house style",()=>{
 const ctx=loadEditorialContext({includeSecrets:false});
 assert.match(ctx,/Project Bible|Living Project Bible/);
 assert.match(ctx,/Style Guide/);
 assert.ok(!ctx.includes("NB-S40")&&!ctx.includes("UC-S40"));
});
test("continuity-aware prompts load all 40 proposed secret entries with explicit provisional status",()=>{
 const text=loadEditorialContext();
 assert.match(text,/(?:NB|UC)-S40/);
 assert.match(text,/not.*canon/i);
});
