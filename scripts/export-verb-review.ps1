param(
  [string]$InputJson = "out/data/roots",
  [string]$OutputPath = "exports/SarfMate-verb-review.xlsx"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$inputFile = Join-Path $projectRoot $InputJson
$outputFile = Join-Path $projectRoot $OutputPath
$outputDirectory = Split-Path -Parent $outputFile

if (-not (Test-Path -LiteralPath $inputFile)) {
  throw "Missing $inputFile. Run npm run build first."
}

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$roots = Get-Content -Raw -Encoding UTF8 -LiteralPath $inputFile | ConvertFrom-Json
$formKeys = @(
  "past",
  "present",
  "imperative",
  "place_or_mim_masdar",
  "active_participle",
  "passive_participle"
)
$formNames = @{
  past = "Past verb"
  present = "Present verb"
  imperative = "Imperative"
  place_or_mim_masdar = "Place noun - mim-masdar"
  active_participle = "Active participle"
  passive_participle = "Passive participle"
}

$headers = [System.Collections.Generic.List[string]]::new()
@(
  "Root", "Display root", "Verb entry ID", "Entry type", "Measure", "Status",
  "Verb meaning", "Quranic", "Updated at", "Missing fields"
) | ForEach-Object { $headers.Add($_) }
foreach ($key in $formKeys) {
  $name = $formNames[$key]
  @(
    "$name - Arabic",
    "$name - Transliteration",
    "$name - Meaning",
    "$name - Example Arabic",
    "$name - Example English",
    "$name - Review state"
  ) | ForEach-Object { $headers.Add($_) }
}
$headers.Add("Reviewer decision")
$headers.Add("Reviewer notes")

$entries = [System.Collections.Generic.List[object]]::new()
foreach ($root in $roots) {
  $main = [pscustomobject]@{
    Root = $root
    Verb = [pscustomobject]@{
      id = "$($root.root)-main"
      meaningEn = $root.meaningEn
      status = $root.status
      measure = $root.measure
      forms = $root.forms
      updatedAt = $root.updatedAt
    }
    EntryType = "Main"
  }
  $entries.Add($main)
  if ($root.variants) {
    foreach ($variant in $root.variants) {
      $entries.Add([pscustomobject]@{ Root = $root; Verb = $variant; EntryType = "Variant" })
    }
  }
}

$data = New-Object 'object[,]' ($entries.Count + 1), $headers.Count
for ($column = 0; $column -lt $headers.Count; $column++) {
  $data[0, $column] = $headers[$column]
}

for ($row = 0; $row -lt $entries.Count; $row++) {
  $entry = $entries[$row]
  $root = $entry.Root
  $verb = $entry.Verb
  $missing = [System.Collections.Generic.List[string]]::new()
  $values = [System.Collections.Generic.List[object]]::new()
  @(
    $root.root,
    $root.displayRoot,
    $verb.id,
    $entry.EntryType,
    $verb.measure,
    $verb.status,
    $verb.meaningEn,
    $(if ($root.quranic) { "Yes" } else { "No" }),
    $verb.updatedAt
  ) | ForEach-Object { $values.Add($_) }

  $formValues = [System.Collections.Generic.List[object]]::new()
  foreach ($key in $formKeys) {
    $form = @($verb.forms | Where-Object { $_.key -eq $key })[0]
    foreach ($field in @("arabic", "transliteration", "meaningEn", "exampleAr", "exampleEn")) {
      $value = if ($null -ne $form) { $form.$field } else { $null }
      if ([string]::IsNullOrWhiteSpace([string]$value)) {
        $missing.Add("$key.$field")
      }
      $formValues.Add($value)
    }
    $reviewState = if ($null -ne $form) { $form.reviewState } else { "pending" }
    $formValues.Add($reviewState)
  }

  $values.Add(($missing -join "; "))
  foreach ($value in $formValues) { $values.Add($value) }
  $values.Add("")
  $values.Add("")

  for ($column = 0; $column -lt $values.Count; $column++) {
    $data[($row + 1), $column] = $values[$column]
  }
}

$excel = $null
$workbook = $null
try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $workbook = $excel.Workbooks.Add()

  $review = $workbook.Worksheets.Item(1)
  $review.Name = "Verb review"
  $range = $review.Range($review.Cells.Item(1, 1), $review.Cells.Item($entries.Count + 1, $headers.Count))
  $range.Value2 = $data
  $range.VerticalAlignment = -4160
  $range.WrapText = $true

  $header = $review.Range($review.Cells.Item(1, 1), $review.Cells.Item(1, $headers.Count))
  $header.Font.Bold = $true
  $header.Font.Color = 16777215
  $header.Interior.Color = 5061903
  $header.RowHeight = 42
  $header.AutoFilter() | Out-Null

  $review.Application.ActiveWindow.SplitRow = 1
  $review.Application.ActiveWindow.SplitColumn = 10
  $review.Application.ActiveWindow.FreezePanes = $true
  $review.Rows.Item("2:$($entries.Count + 1)").RowHeight = 54
  $review.Columns.Item("A:J").ColumnWidth = 14
  $review.Columns.Item("G:G").ColumnWidth = 24
  $review.Columns.Item("J:J").ColumnWidth = 34
  $review.Columns.Item("K:AT").ColumnWidth = 22
  $review.Columns.Item("AU:AV").ColumnWidth = 24

  foreach ($column in @(1, 2, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44)) {
    if ($column -le $headers.Count) {
      $review.Columns.Item($column).HorizontalAlignment = -4152
      $review.Columns.Item($column).Font.Name = "Arial"
      $review.Columns.Item($column).Font.Size = 14
    }
  }

  $missingColumn = $review.Range("J2:J$($entries.Count + 1)")
  $missingColumn.FormatConditions.Add(1, 7, "=LEN(J2)>0") | Out-Null
  $missingColumn.FormatConditions.Item(1).Interior.Color = 13421823
  $decisionColumn = $review.Range("AU2:AU$($entries.Count + 1)")
  $decisionColumn.Validation.Delete()
  $decisionColumn.Validation.Add(3, 1, 1, "Approved,Needs changes,Incomplete,Skip")

  $instructions = $workbook.Worksheets.Add()
  $instructions.Name = "Instructions"
  $instructions.Range("A1").Value2 = "SarfMate verb review workbook"
  $instructions.Range("A1").Font.Bold = $true
  $instructions.Range("A1").Font.Size = 18
  $instructions.Range("A3").Value2 = "How to review"
  $instructions.Range("A3").Font.Bold = $true
  $instructions.Range("A4").Value2 = "1. Open the Verb review sheet. Each row is one verb entry; variants have their own rows."
  $instructions.Range("A5").Value2 = "2. Filter Missing fields to find blanks, or Status to focus on ai_draft entries."
  $instructions.Range("A6").Value2 = "3. Type corrected or missing content directly into the relevant cells."
  $instructions.Range("A7").Value2 = "4. Set Reviewer decision and explain uncertain changes in Reviewer notes."
  $instructions.Range("A8").Value2 = "5. Do not change Root, Verb entry ID, Entry type, or form-column headings."
  $instructions.Range("A9").Value2 = "6. Save the workbook and send it back to Codex for validation and import."
  $instructions.Range("A11").Value2 = "Important Arabic note"
  $instructions.Range("A11").Font.Bold = $true
  $instructions.Range("A12").Value2 = "For hamzat-waṣl imperatives, use forms such as اِسْمَعْ rather than إسمع."
  $instructions.Range("A14").Value2 = "Workbook summary"
  $instructions.Range("A14").Font.Bold = $true
  $instructions.Range("A15").Value2 = "Root entries"
  $instructions.Range("B15").Value2 = $roots.Count
  $instructions.Range("A16").Value2 = "Verb entries including variants"
  $instructions.Range("B16").Value2 = $entries.Count
  $instructions.Columns.Item("A:A").ColumnWidth = 95
  $instructions.Columns.Item("B:B").ColumnWidth = 18
  $instructions.Range("A1:B20").WrapText = $true
  $instructions.Range("A1:B20").VerticalAlignment = -4160
  $instructions.Activate()

  $absoluteOutput = [System.IO.Path]::GetFullPath($outputFile)
  $workbook.SaveAs($absoluteOutput, 51)
  Write-Output "Created $absoluteOutput"
  Write-Output "Exported $($roots.Count) roots and $($entries.Count) verb entries."
}
finally {
  if ($workbook) { $workbook.Close($false) }
  if ($excel) { $excel.Quit() }
  if ($review) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($review) | Out-Null }
  if ($instructions) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($instructions) | Out-Null }
  if ($workbook) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null }
  if ($excel) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
