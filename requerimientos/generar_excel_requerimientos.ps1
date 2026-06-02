$ErrorActionPreference = 'Stop'

$basePath = Split-Path -Parent $MyInvocation.MyCommand.Path
$reqsPath = Join-Path $basePath 'requerimientos.json'
$tasksPath = Join-Path $basePath 'tareas.json'

$reqs = Get-Content $reqsPath -Raw -Encoding UTF8 | ConvertFrom-Json
$tasks = Get-Content $tasksPath -Raw -Encoding UTF8 | ConvertFrom-Json

function Normalize-Text([string]$value) {
    if ([string]::IsNullOrWhiteSpace($value)) { return '' }
    return ($value -replace '\s+', ' ').Trim()
}

function Normalize-Comments($comments) {
    if ($null -eq $comments) { return '' }

    $items = @()
    if ($comments -is [System.Array]) {
        $items = $comments
    }
    else {
        $items = @($comments)
    }

    $cleanItems = @()
    foreach ($item in $items) {
        $clean = Normalize-Text ([string]$item)
        if (-not [string]::IsNullOrWhiteSpace($clean)) {
            $cleanItems += $clean
        }
    }

    return ($cleanItems -join ' | ')
}

function Join-UniqueParts([string[]]$parts) {
    $seen = @{}
    $result = @()

    foreach ($part in $parts) {
        $clean = Normalize-Text $part
        if ([string]::IsNullOrWhiteSpace($clean)) { continue }

        $key = $clean.ToLowerInvariant()
        if (-not $seen.ContainsKey($key)) {
            $seen[$key] = $true
            $result += $clean
        }
    }

    return ($result -join ' | ')
}

$reqMap = @{}
foreach ($r in $reqs) {
    $reqMap[[int]$r.id] = [string]$r.titulo
}

$rows = New-Object System.Collections.Generic.List[object]

foreach ($task in $tasks) {
    $reqTitle = if ($reqMap.ContainsKey([int]$task.requerimiento_id)) { $reqMap[[int]$task.requerimiento_id] } else { '' }
    $subs = @($task.subtareas)
    $taskTitle = Normalize-Text ([string]$task.titulo)
    $taskComments = Normalize-Comments $task.comentarios

    if ($subs.Count -gt 0) {
        foreach ($sub in $subs) {
            $fecha = if ($sub.inicio) { ([string]$sub.inicio).Split(' ')[0] } elseif ($sub.fin) { ([string]$sub.fin).Split(' ')[0] } else { '' }
            $desde = if ($sub.inicio) { (($sub.inicio -split ' ', 2)[1]) } else { '' }
            $hasta = if ($sub.fin) { (($sub.fin -split ' ', 2)[1]) } else { '' }
            $subTitle = Normalize-Text ([string]$sub.titulo)
            $subComments = Normalize-Comments $sub.comentarios
            $descripcion = Join-UniqueParts @($subTitle, $taskTitle, $subComments, $taskComments)

            $rows.Add([pscustomobject]@{
                FECHA = $fecha
                DESDE = $desde
                HASTA = $hasta
                MINUTOS = [int]$sub.minutos
                REQUERIMIENTO = $reqTitle
                DESCRIPCION = $descripcion
            })
        }
    }
    else {
        $fecha = if ($task.inicio) { ([string]$task.inicio).Split(' ')[0] } elseif ($task.fin) { ([string]$task.fin).Split(' ')[0] } else { '' }
        $desde = if ($task.inicio) { (($task.inicio -split ' ', 2)[1]) } else { '' }
        $hasta = if ($task.fin) { (($task.fin -split ' ', 2)[1]) } else { '' }

        $rows.Add([pscustomobject]@{
            FECHA = $fecha
            DESDE = $desde
            HASTA = $hasta
            MINUTOS = [int]$task.minutos
            REQUERIMIENTO = $reqTitle
            DESCRIPCION = (Join-UniqueParts @($taskTitle, $taskComments))
        })
    }
}

$rows = $rows | Sort-Object FECHA, DESDE, REQUERIMIENTO, DESCRIPCION

$dataStartRow = 2
$dataEndRow = $rows.Count + 1
$minutosRange = if ($rows.Count -gt 0) { "D$($dataStartRow):D$($dataEndRow)" } else { 'D2:D2' }
$totalHmFormula = ('=INT(SUM({0})/60)&":"&TEXT(MOD(SUM({0}),60),"00")' -f $minutosRange)

$columns = @(
    [pscustomobject]@{ Key = 'FECHA'; Header = 'FECHA'; MinWidth = 70; MaxWidth = 120 },
    [pscustomobject]@{ Key = 'DESDE'; Header = 'DESDE'; MinWidth = 65; MaxWidth = 90 },
    [pscustomobject]@{ Key = 'HASTA'; Header = 'HASTA'; MinWidth = 65; MaxWidth = 90 },
    [pscustomobject]@{ Key = 'MINUTOS'; Header = 'MINUTOS'; MinWidth = 80; MaxWidth = 110 },
    [pscustomobject]@{ Key = 'REQUERIMIENTO'; Header = 'REQUERIMIENTO'; MinWidth = 180; MaxWidth = 520 },
    [pscustomobject]@{ Key = 'DESCRIPCION'; Header = 'DESCRIPCION'; MinWidth = 200; MaxWidth = 800 }
)

function Width-FromChars([int]$chars, [int]$minWidth, [int]$maxWidth) {
    $estimated = [int][Math]::Ceiling(($chars + 2) * 7)
    return [Math]::Max($minWidth, [Math]::Min($maxWidth, $estimated))
}

$columnWidths = @{}
foreach ($col in $columns) {
    $maxChars = [int]([string]$col.Header).Length

    foreach ($row in $rows) {
        $text = [string]$row.($col.Key)
        if ($text.Length -gt $maxChars) {
            $maxChars = $text.Length
        }
    }

    $columnWidths[$col.Key] = Width-FromChars $maxChars ([int]$col.MinWidth) ([int]$col.MaxWidth)
}

function Escape-Xml([string]$value) {
    if ($null -eq $value) { return '' }

    return $value.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;').Replace("'", '&apos;')
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<?mso-application progid="Excel.Sheet"?>')
[void]$sb.AppendLine('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">')
[void]$sb.AppendLine('<Styles>')
[void]$sb.AppendLine('<Style ss:ID="HeaderStyle">')
[void]$sb.AppendLine('<Font ss:Bold="1" ss:Color="#334155"/>')
[void]$sb.AppendLine('<Interior ss:Color="#E8EEF5" ss:Pattern="Solid"/>')
[void]$sb.AppendLine('</Style>')
[void]$sb.AppendLine('</Styles>')
[void]$sb.AppendLine('<Worksheet ss:Name="Tareas">')
[void]$sb.AppendLine('<Table>')

foreach ($col in $columns) {
    [void]$sb.AppendLine("<Column ss:Width=`"$($columnWidths[$col.Key])`"/>")
}

$headers = $columns | ForEach-Object { $_.Header }
[void]$sb.AppendLine('<Row>')
foreach ($h in $headers) {
    [void]$sb.AppendLine("<Cell ss:StyleID=`"HeaderStyle`"><Data ss:Type=`"String`">$(Escape-Xml $h)</Data></Cell>")
}
[void]$sb.AppendLine('</Row>')

foreach ($row in $rows) {
    [void]$sb.AppendLine('<Row>')
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml ([string]$row.FECHA))</Data></Cell>")
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml ([string]$row.DESDE))</Data></Cell>")
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml ([string]$row.HASTA))</Data></Cell>")
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"Number`">$($row.MINUTOS)</Data></Cell>")
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml ([string]$row.REQUERIMIENTO))</Data></Cell>")
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml ([string]$row.DESCRIPCION))</Data></Cell>")
    [void]$sb.AppendLine('</Row>')
}

[void]$sb.AppendLine('<Row>')
[void]$sb.AppendLine('<Cell><Data ss:Type="String"></Data></Cell>')
[void]$sb.AppendLine('</Row>')

[void]$sb.AppendLine('<Row>')
[void]$sb.AppendLine('<Cell><Data ss:Type="String"></Data></Cell>')
[void]$sb.AppendLine('<Cell><Data ss:Type="String"></Data></Cell>')
[void]$sb.AppendLine('<Cell><Data ss:Type="String">HORAS TOTALES (HH:MM)</Data></Cell>')
[void]$sb.AppendLine("<Cell ss:Formula=`"$(Escape-Xml $totalHmFormula)`"><Data ss:Type=`"String`">00:00</Data></Cell>")
[void]$sb.AppendLine('</Row>')

[void]$sb.AppendLine('</Table>')
[void]$sb.AppendLine('</Worksheet>')
[void]$sb.AppendLine('</Workbook>')

$outPath = Join-Path $basePath 'tareas-requerimientos.xls'

[System.IO.File]::WriteAllText($outPath, $sb.ToString(), [System.Text.UTF8Encoding]::new($true))

Write-Output "ARCHIVO_OK: $outPath"
Write-Output "FILAS: $($rows.Count)"
