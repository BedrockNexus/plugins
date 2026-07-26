# Plugin adapters

Adapters translate a granted GitHub repository into a validated Bedrock plugin
project and a reviewable publishing workflow. They are pure TypeScript modules:
they inspect a repository snapshot and return data, issues, or generated text.
They never clone or execute repository code on the BedrockNexus Plugins server.

## Contract and registry

Every adapter implements `PluginAdapter` from
`src/lib/adapters/types.ts`:

- `detect` returns weighted, human-readable signals.
- `extractMetadata` returns normalized plugin metadata and its source files.
- `validate` returns stable issue codes with error or warning severity.
- `generateWorkflow` returns the canonical
  `.github/workflows/bedrocknexus-publish.yml` file.

The explicit registry exposes `getAdapterById`, `getEnabledAdapters`, and
`detectCompatibleAdapters`. Adding another adapter requires implementing the
contract and adding one registry entry; the generic resolution and publishing
flow do not need adapter-specific branches.

## Confidence behavior

Detection scores are capped at 100:

- `80–100`: high confidence
- `65–79`: medium confidence and eligible for automatic selection
- `1–64`: low confidence and not automatically selected
- `0`: no matching evidence

If the two strongest eligible adapters are within 15 points, the result is
ambiguous and the developer must choose. If no adapter reaches 65, the
repository is unsupported. All outcomes retain the matched and unmatched
signals so the UI can explain the result.

## PocketMine-MP

The PocketMine-MP adapter uses:

- a root `plugin.yml` with a PocketMine API declaration;
- Composer type `pocketmine-plugin` and PocketMine references; and
- PHP files under `src/`.

Metadata comes from `plugin.yml` and `composer.json`. Validation checks the
declared main class, required plugin fields, valid Composer JSON, and the
recommended Composer plugin type.

The generated workflow syntax-checks PHP, installs Composer dependencies when
present, packages a PHAR with the official PMMP DevTools release, uploads the
validated package as a workflow artifact, and creates a GitHub Release only for
`v*` tags.

## PowerNukkitX

The PowerNukkitX adapter supports Gradle and Maven projects. It detects:

- a `cn.powernukkitx` or `powernukkitx` build dependency;
- a Nukkit `plugin.yml`;
- a Gradle or Maven build; and
- Java sources under `src/main/java/`.

Validation checks the descriptor, required metadata, PowerNukkitX dependency,
and declared main Java class. The generated workflow runs the repository
wrapper when present and otherwise uses the runner build tool.

Primary JAR selection rejects sources, Javadocs, tests, Gradle plain JARs, and
Maven `original-*` JARs. Packaging fails unless exactly one primary JAR remains.

## Workflow security

Normal branches and pull requests receive only `contents: read`. They validate,
package, and upload a temporary Actions artifact but never create a release.

The separate release job runs only when the ref starts with `refs/tags/v`, waits
for the build job, receives `contents: write`, downloads the validated package,
and creates the permanent GitHub Release.

Custom build commands require explicit user confirmation. They are limited to
the adapter's approved executables and arguments; shell chaining, redirects,
substitution, newlines, and command separators are rejected.
