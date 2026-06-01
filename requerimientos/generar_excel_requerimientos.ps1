$ErrorActionPreference = 'Stop'

$basePath = Split-Path -Parent $MyInvocation.MyCommand.Path
$reqsPath = Join-Path $basePath 'requerimientos.json'
$tasksPath = Join-Path $basePath 'tareas.json'

$reqs = Get-Content $reqsPath -Raw -Encoding UTF8 | ConvertFrom-Json
$tasks = Get-Content $tasksPath -Raw -Encoding UTF8 | ConvertFrom-Json

$reqMap = @{}
foreach ($r in $reqs) {
    $reqMap[[int]$r.id] = [string]$r.titulo
}

$rows = New-Object System.Collections.Generic.List[object]

foreach ($task in $tasks) {
    $reqTitle = if ($reqMap.ContainsKey([int]$task.requerimiento_id)) { $reqMap[[int]$task.requerimiento_id] } else { '' }
    $subs = @($task.subtareas)

    if ($subs.Count -gt 0) {
        foreach ($sub in $subs) {
            $fecha = if ($sub.inicio) { ([string]$sub.inicio).Split(' ')[0] } elseif ($sub.fin) { ([string]$sub.fin).Split(' ')[0] } else { '' }
            $desde = if ($sub.inicio) { (($sub.inicio -split ' ', 2)[1]) } else { '' }
            $hasta = if ($sub.fin) { (($sub.fin -split ' ', 2)[1]) } else { '' }

            $rows.Add([pscustomobject]@{
                FECHA = $fecha
                DESDE = $desde
                HASTA = $hasta
                'SUBTOTAL (MINUTOS)' = [int]$sub.minutos
                REQUERIMIENTO = $reqTitle
                DESCRIPCION = [string]$sub.titulo
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
            'SUBTOTAL (MINUTOS)' = [int]$task.minutos
            REQUERIMIENTO = $reqTitle
            DESCRIPCION = [string]$task.titulo
        })
    }
}

$rows = $rows | Sort-Object FECHA, DESDE, REQUERIMIENTO, DESCRIPCION

function Escape-Xml([string]$value) {
    if ($null -eq $value) { return '' }

    return $value.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;').Replace("'", '&apos;')
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<?mso-application progid="Excel.Sheet"?>')
[void]$sb.AppendLine('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">')
[void]$sb.AppendLine('<Worksheet ss:Name="Tareas">')
[void]$sb.AppendLine('<Table>')

$headers = @('FECHA', 'DESDE', 'HASTA', 'SUBTOTAL (MINUTOS)', 'REQUERIMIENTO', 'DESCRIPCION')
[void]$sb.AppendLine('<Row>')
foreach ($h in $headers) {
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml $h)</Data></Cell>")
}
[void]$sb.AppendLine('</Row>')

foreach ($row in $rows) {
    [void]$sb.AppendLine('<Row>')
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml ([string]$row.FECHA))</Data></Cell>")
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml ([string]$row.DESDE))</Data></Cell>")
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml ([string]$row.HASTA))</Data></Cell>")
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"Number`">$($row.'SUBTOTAL (MINUTOS)')</Data></Cell>")
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml ([string]$row.REQUERIMIENTO))</Data></Cell>")
    [void]$sb.AppendLine("<Cell><Data ss:Type=`"String`">$(Escape-Xml ([string]$row.DESCRIPCION))</Data></Cell>")
    [void]$sb.AppendLine('</Row>')
}

[void]$sb.AppendLine('</Table>')
[void]$sb.AppendLine('</Worksheet>')
[void]$sb.AppendLine('</Workbook>')

$outPath = Join-Path $basePath 'tareas-requerimientos.xls'
[System.IO.File]::WriteAllText($outPath, $sb.ToString(), [System.Text.UTF8Encoding]::new($true))

Write-Output "ARCHIVO_OK: $outPath"
Write-Output "FILAS: $($rows.Count)"
