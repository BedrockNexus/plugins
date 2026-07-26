export const ADAPTER_IDS = ["pocketmine-mp", "powernukkitx"] as const;

export type AdapterId = (typeof ADAPTER_IDS)[number];
export type AdapterConfidence = "none" | "low" | "medium" | "high";
export type BuildSystem = "composer" | "gradle" | "maven";

export type RepositoryFile = {
  path: string;
  content?: string;
};

export type RepositorySnapshot = {
  fullName: string;
  defaultBranch: string;
  files: ReadonlyArray<RepositoryFile>;
};

export type DetectionSignal = {
  id: string;
  label: string;
  weight: number;
  matched: boolean;
  detail: string;
  path?: string;
};

export type AdapterDetection = {
  adapterId: AdapterId;
  adapterName: string;
  score: number;
  confidence: AdapterConfidence;
  signals: ReadonlyArray<DetectionSignal>;
  summary: string;
};

export type AdapterResolution =
  | {
      kind: "matched";
      selected: AdapterDetection;
      candidates: ReadonlyArray<AdapterDetection>;
      explanation: string;
    }
  | {
      kind: "ambiguous";
      candidates: ReadonlyArray<AdapterDetection>;
      explanation: string;
    }
  | {
      kind: "unsupported";
      candidates: ReadonlyArray<AdapterDetection>;
      explanation: string;
    };

export type AdapterMetadata = {
  name: string;
  version: string;
  description?: string;
  authors: ReadonlyArray<string>;
  website?: string;
  license?: string;
  apiVersions: ReadonlyArray<string>;
  mainClass: string;
  buildSystem: BuildSystem;
};

export type AdapterMetadataResult =
  | {
      ok: true;
      metadata: AdapterMetadata;
      sources: ReadonlyArray<string>;
    }
  | {
      ok: false;
      errors: ReadonlyArray<AdapterIssue>;
    };

export type AdapterIssueSeverity = "error" | "warning";

export type AdapterIssue = {
  code: string;
  severity: AdapterIssueSeverity;
  message: string;
  path?: string;
};

export type AdapterValidation = {
  valid: boolean;
  issues: ReadonlyArray<AdapterIssue>;
};

export type BuildCommandOverride = {
  command: string;
  userConfirmed: boolean;
};

export type WorkflowGenerationInput = {
  metadata: AdapterMetadata;
  defaultBranch: string;
  buildCommandOverride?: BuildCommandOverride;
};

export type GeneratedWorkflow = {
  path: ".github/workflows/bedrocknexus-publish.yml";
  content: string;
  buildCommand: string;
  releaseAssetPattern: string;
};

export interface PluginAdapter {
  readonly id: AdapterId;
  readonly name: string;
  readonly enabled: boolean;
  detect(snapshot: RepositorySnapshot): AdapterDetection;
  extractMetadata(snapshot: RepositorySnapshot): AdapterMetadataResult;
  validate(snapshot: RepositorySnapshot): AdapterValidation;
  generateWorkflow(input: WorkflowGenerationInput): GeneratedWorkflow;
}
