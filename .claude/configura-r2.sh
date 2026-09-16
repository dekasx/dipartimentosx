#!/bin/zsh
# Scrive la configurazione di rclone per Cloudflare R2 senza passare dal
# questionario interattivo. Le due chiavi le digiti qui: il Secret non si
# vede mentre lo scrivi e non finisce nella cronologia della shell, perché
# viene letto in una variabile e non compare mai in un comando.
set -e

ENDPOINT="https://cd46d83054e3a0e889ff0f7bfdf4071c.r2.cloudflarestorage.com"
CONF="$HOME/.config/rclone/rclone.conf"

if [ -f "$CONF" ] && grep -q "^\[r2\]" "$CONF"; then
  echo "Esiste già un profilo [r2] in $CONF."
  printf "Lo sostituisco? (s/n) "
  read RISP
  [ "$RISP" = "s" ] || { echo "lasciato com'era"; exit 0; }
  cp "$CONF" "$CONF.backup-$(date +%Y%m%d%H%M)"
fi

printf "Access Key ID:  "
read AK
printf "Secret Access Key (non si vede mentre digiti): "
read -s SK
echo

[ -n "$AK" ] && [ -n "$SK" ] || { echo "chiavi vuote, non faccio niente"; exit 1; }

mkdir -p "$(dirname "$CONF")"
printf '[r2]\ntype = s3\nprovider = Cloudflare\nenv_auth = false\naccess_key_id = %s\nsecret_access_key = %s\nregion = auto\nendpoint = %s\nacl = private\n' \
  "$AK" "$SK" "$ENDPOINT" > "$CONF"
chmod 600 "$CONF"
unset AK SK

echo
echo "configurazione scritta in $CONF"
echo "provo a collegarmi..."
echo
rclone lsd r2:
