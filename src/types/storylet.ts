/** Version 1 authoring contract. Runtime uses the dependency-free studio-core.js validator. */
export type GameId = "neathbound" | "undercity";
export type PrimaryStat = "nerve" | "insight" | "poise" | "shadow" | "observation" | "guile" | "persuasion" | "resolve";
export type Comparison = ">=" | "==" | "!=" | ">" | "<" | "<=";
export interface QualityRequirement { type: "quality" | "menace" | "quirk" | "flag" | "item"; id: string; op: Comparison; value: number | string | boolean }
export interface QualityEffect { type: "quality" | "menace" | "quirk" | "ambition-progress"; id?: string; amount: number }
export interface ItemEffect { type: "item"; id: string; amount: number }
export type StoryEffect = QualityEffect | ItemEffect | {type:"currency";amount:number} | {type:"flag";id:string;value?:true} | {type:"living-story";id:string;amount:number};
export interface Challenge { stat: PrimaryStat; difficulty: number; mode: "broad" | "narrow" | "classic"; action_cost: number }
export interface Outcome { title: string; text: string; effects: StoryEffect[] }
export interface Branch extends Challenge { id:string; label:string; requirements:QualityRequirement[]; success:Outcome; failure:Outcome; rare_success:Outcome|null }
export type ApprovalStage = "pitch" | "midflight" | "prose" | "content-qa" | "design-qa" | "mechanical-qa" | "continuity" | "review" | "approved";
export interface Storylet {
 schema_version:1;game:GameId;id:string;title:string;location:string;description:string;kicker:string;
 once:boolean;author:string;reviewer:string;status:ApprovalStage;pitch:string;review_notes:string;
 secret_ids:string[];reveal_depth:number;tags:string[];ambition_id:string;progress:number|null;next_storylet:string|null;
 requirements:QualityRequirement[];choices:Branch[];
 qa:{content:boolean;design:boolean;mechanical:boolean;continuity:boolean;peer:boolean};
 history:Array<{from:string;to:string;at:string;reviewer:string|null}>;
}
/** Runtime storylet adapter schemas differ per game; compile with tools/cms/build.mjs. */
