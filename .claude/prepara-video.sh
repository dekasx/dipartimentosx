#!/bin/zsh
# Prepara i video per il web SENZA ricomprimere l'immagine.
#   - la traccia video viene copiata bit per bit (-c:v copy)
#   - l'audio PCM/mp3 diventa AAC 320k, che i browser sanno decodificare
#   - ep1 è HEVC, che Firefox non riproduce: unico caso in cui il video
#     va ricodificato, a 60 Mbps con l'encoder hardware del Mac
#   - +faststart mette l'indice in testa: il video parte senza scaricarsi tutto
set -e
cd "$(dirname "$0")/.."
OUT=upload
for f in assets/projects/botteghe/ep*.mov; do
  n=$(basename "$f" .mov)
  d="$OUT/botteghe-$n.mp4"
  [ -f "$d" ] && { echo "già fatto: $d"; continue; }
  liberi=$(df -g . | tail -1 | awk '{print $4}')
  if [ "$liberi" -lt 2 ]; then echo "STOP: restano solo ${liberi} GB liberi"; exit 3; fi
  cod=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$f")
  if [ "$cod" = "hevc" ]; then
    echo "-> $n (HEVC: ricodifico il video)"
    ffmpeg -v error -y -i "$f" -map 0:v:0 -map 0:a:0 \
      -c:v h264_videotoolbox -b:v 60M -profile:v high -pix_fmt yuv420p \
      -c:a aac -b:a 320k -movflags +faststart "$d"
  else
    echo "-> $n (video copiato, solo audio)"
    ffmpeg -v error -y -i "$f" -map 0:v:0 -map 0:a:0 \
      -c:v copy -c:a aac -b:a 320k -movflags +faststart "$d"
  fi
  ls -lh "$d" | awk '{print "   "$5"  "$9}'
done
echo "fatto"
