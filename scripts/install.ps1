param(
  [ValidateSet("all", "codex", "claude", "copilot", "cursor")]
  [string]$Target = "all",

  [string]$Repo
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$SkillNames = @("map-project", "audit-accessibility", "shopify-theme-audit", "fix-accessibility")

function Copy-SkillSet {
  param(
    [Parameter(Mandatory = $true)][string]$DestinationRoot
  )

  New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
  foreach ($Name in $SkillNames) {
    $Source = Join-Path $Root "skills\$Name"
    $Destination = Join-Path $DestinationRoot $Name
    if (-not (Test-Path -LiteralPath $Source)) {
      throw "Missing skill source: $Source"
    }
    if (Test-Path -LiteralPath $Destination) {
      Remove-Item -LiteralPath $Destination -Recurse -Force
    }
    Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
    Write-Host "Installed $Name -> $Destination"
  }
}

function Install-CopilotAdapter {
  param([string]$TargetRepo)

  if ([string]::IsNullOrWhiteSpace($TargetRepo)) {
    Write-Host "Copilot adapter templates are available in adapters/copilot/. Pass -Repo <path> to install them into a project."
    return
  }

  $ResolvedRepo = (Resolve-Path -LiteralPath $TargetRepo).Path
  $GithubDir = Join-Path $ResolvedRepo ".github"
  $InstructionsDir = Join-Path $GithubDir "instructions"
  New-Item -ItemType Directory -Force -Path $InstructionsDir | Out-Null

  $SourceMain = Join-Path $Root "adapters\copilot\copilot-instructions.md"
  $DestinationMain = Join-Path $GithubDir "copilot-instructions.md"
  $BlockStart = "<!-- BEGIN BINCLUSIVE ACCESSIBILITY SKILLS -->"
  $BlockEnd = "<!-- END BINCLUSIVE ACCESSIBILITY SKILLS -->"
  $Block = $BlockStart + [Environment]::NewLine + (Get-Content -LiteralPath $SourceMain -Raw) + [Environment]::NewLine + $BlockEnd

  if (Test-Path -LiteralPath $DestinationMain) {
    $Current = Get-Content -LiteralPath $DestinationMain -Raw
    $Pattern = [regex]::Escape($BlockStart) + "(?s).*?" + [regex]::Escape($BlockEnd)
    if ($Current -match $Pattern) {
      $Updated = [regex]::Replace($Current, $Pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $Block })
    } else {
      $Updated = $Current.TrimEnd() + [Environment]::NewLine + [Environment]::NewLine + $Block + [Environment]::NewLine
    }
    Set-Content -LiteralPath $DestinationMain -Value $Updated -Encoding utf8
  } else {
    Set-Content -LiteralPath $DestinationMain -Value ($Block + [Environment]::NewLine) -Encoding utf8
  }

  Copy-Item -LiteralPath (Join-Path $Root "adapters\copilot\.github\instructions\binclusive-accessibility.instructions.md") -Destination (Join-Path $InstructionsDir "binclusive-accessibility.instructions.md") -Force
  Write-Host "Installed Copilot adapter -> $GithubDir"
}

function Install-CursorAdapter {
  param([string]$TargetRepo)

  if ([string]::IsNullOrWhiteSpace($TargetRepo)) {
    Write-Host "Cursor adapter templates are available in adapters/cursor/. Pass -Repo <path> to install them into a project."
    return
  }

  $ResolvedRepo = (Resolve-Path -LiteralPath $TargetRepo).Path
  $RulesDir = Join-Path $ResolvedRepo ".cursor\rules"
  New-Item -ItemType Directory -Force -Path $RulesDir | Out-Null

  Copy-Item -LiteralPath (Join-Path $Root "adapters\cursor\.cursor\rules\binclusive-accessibility.mdc") -Destination (Join-Path $RulesDir "binclusive-accessibility.mdc") -Force
  Write-Host "Installed Cursor adapter -> $RulesDir"
}

if ($Target -eq "all" -or $Target -eq "codex") {
  Copy-SkillSet -DestinationRoot (Join-Path $HOME ".agents\skills")
}

if ($Target -eq "all" -or $Target -eq "claude") {
  Copy-SkillSet -DestinationRoot (Join-Path $HOME ".claude\skills")
}

if ($Target -eq "all" -or $Target -eq "copilot") {
  Install-CopilotAdapter -TargetRepo $Repo
}

if ($Target -eq "all" -or $Target -eq "cursor") {
  Install-CursorAdapter -TargetRepo $Repo
}
