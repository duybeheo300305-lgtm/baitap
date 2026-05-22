$baseUrl = "https://happybirthdayvip.onrender.com/"
$files = @(
    "css/style.css",
    "css/letter.css",
    "css/intro.css",
    "css/introCake.css",
    "css/imageFly.css",
    "js/detect-devtools.js",
    "js/hbDefaultDemoData.js",
    "js/hbGiftBootstrap.js",
    "js/cakeFlyBackground.js",
    "js/imageFly.js",
    "js/introCake.js",
    "js/main.js",
    "js/letter.js",
    "assets/icons/gift-box.png",
    "assets/icons/nature.png",
    "assets/icons/letter.png",
    "assets/icons/next.png",
    "assets/icons/cake.png",
    "assets/audios/Happy Birthday to You  - AMEE x Hoàng Dũng.mp3",
    "create.html"
)

foreach ($file in $files) {
    $encodedFile = $file -replace " ", "%20"
    $url = $baseUrl + $encodedFile
    $dest = Join-Path -Path $Pwd.Path -ChildPath $file
    
    $parent = Split-Path -Path $dest
    if (-not (Test-Path -Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    
    Write-Host "Downloading $url to $dest..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -TimeoutSec 30 -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download $file : $_"
    }
}
