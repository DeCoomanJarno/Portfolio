# Navigate to the source directory
$sourcePath = ".\src\app"

# Find and rename all .component.ts files
Get-ChildItem -Path $sourcePath -Recurse -Filter "*.component.ts" | ForEach-Object {
    $oldName = $_.Name
    $newName = $oldName -replace '\.component\.ts$', '.ts'
    Rename-Item -Path $_.FullName -NewName $newName -PassThru
}

# Find and rename all .component.spec.ts files
Get-ChildItem -Path $sourcePath -Recurse -Filter "*.component.spec.ts" | ForEach-Object {
    $oldName = $_.Name
    $newName = $oldName -replace '\.component\.spec\.ts$', '.spec.ts'
    Rename-Item -Path $_.FullName -NewName $newName -PassThru
}

# Find and rename .html and .css files with the suffix (optional, based on your project)
Get-ChildItem -Path $sourcePath -Recurse -Filter "*.html" | ForEach-Object {
    $oldName = $_.Name
    $newName = $oldName -replace '\.component\.html$', '.html'
    Rename-Item -Path $_.FullName -NewName $newName -PassThru
}
Get-ChildItem -Path $sourcePath -Recurse -Filter "*.css" | ForEach-Object {
    $oldName = $_.Name
    $newName = $oldName -replace '\.component\.css$', '.css'
    Rename-Item -Path $_.FullName -NewName $newName -PassThru
}

# Now, update all file references
Write-Host "Updating import paths..."
Get-ChildItem -Path $sourcePath -Recurse -Filter "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName
    $content -replace '\.component$', '' | Set-Content $_.FullName
}

Write-Host "Component renaming complete."