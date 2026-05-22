$musicUrl = "https://happybirthdayvip.onrender.com/assets/audios/BIRTHDAY%20XINH%20IU.mp3"
$musicDest = "assets/audios/BIRTHDAY XINH IU.mp3"
$parent = Split-Path -Path $musicDest
if (-not (Test-Path -Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
}
Write-Host "Downloading music from $musicUrl..."
try {
    Invoke-WebRequest -Uri $musicUrl -OutFile $musicDest -TimeoutSec 30
} catch {
    Write-Warning "Failed to download music: $_"
}

$imgFolder = "assets/images"
if (-not (Test-Path -Path $imgFolder)) {
    New-Item -ItemType Directory -Path $imgFolder -Force | Out-Null
}
$images = @(
    "https://pub-e56627ca597e4198855cd7ae54de1444.r2.dev/uploads/hb-vip-album-1-20260416-072252-vxd4qu.jpg",
    "https://pub-e56627ca597e4198855cd7ae54de1444.r2.dev/uploads/hb-vip-album-2-20260416-072254-q4cq3f.jpg",
    "https://pub-e56627ca597e4198855cd7ae54de1444.r2.dev/uploads/hb-vip-album-3-20260416-072250-zch48a.jpg",
    "https://pub-e56627ca597e4198855cd7ae54de1444.r2.dev/uploads/hb-vip-album-4-20260416-072252-df85ka.jpg",
    "https://pub-e56627ca597e4198855cd7ae54de1444.r2.dev/uploads/hb-vip-album-5-20260416-072252-899xgk.jpg",
    "https://pub-e56627ca597e4198855cd7ae54de1444.r2.dev/uploads/hb-vip-album-6-20260416-072252-sa2k2t.jpg",
    "https://pub-e56627ca597e4198855cd7ae54de1444.r2.dev/uploads/hb-vip-album-7-20260416-072252-9pldjx.jpg",
    "https://pub-e56627ca597e4198855cd7ae54de1444.r2.dev/uploads/hb-vip-album-8-20260416-072253-mg6464.jpg"
)

for ($i = 0; $i -lt $images.Length; $i++) {
    $imgUrl = $images[$i]
    $imgDest = Join-Path -Path $imgFolder -ChildPath "img$($i + 1).jpg"
    Write-Host "Downloading img$($i + 1) from $imgUrl to $imgDest..."
    try {
        Invoke-WebRequest -Uri $imgUrl -OutFile $imgDest -TimeoutSec 30
    } catch {
        Write-Warning "Failed to download img$($i + 1): $_"
    }
}
