#!/bin/zsh
# Scrive la configurazione di rclone per Cloudflare R2 senza passare dal
# questionario interattivo. Le due chiavi le digiti qui: il Secret non si
# vede mentre lo scrivi e non finisce nella cronologia della shell, perché
# viene letto in una variabile e non compare mai in un comando.
#
# Il prompt muto ha un difetto noto: non vedendo niente comparire viene
# naturale incollare una seconda volta, e le due copie si attaccano. Per
# questo ogni chiave viene controllata nella forma (sono cifre esadecimali
# di lunghezza fissa) e riconfermata a schermo in forma mascherata.
set -e

ENDPOINT="https://cd46d83054e3a0e889ff0f7bfdf4071c.r2.cloudflarestorage.com"
CONF="$HOME/.config/rclone/rclone.conf"

# chiedi una chiave finché non ha la forma giusta
chiedi() {
  local etichetta="$1" attesi="$2" muta="$3" v tent=0
  while [ $tent -lt 3 ]; do
    tent=$((tent + 1))
    printf "%s (%d caratteri): " "$etichetta" "$attesi"
    if [ "$muta" = "muta" ]; then read -s v; echo; else read v; fi
    v="${v//[[:space:]]/}"                       # via spazi e a capo incollati
    if [ ${#v} -eq "$attesi" ] && [[ "$v" =~ ^[0-9a-fA-F]+$ ]]; then
      printf "   ok: %s…%s\n" "${v:0:4}" "${v: -4}"
      RISULTATO="$v"
      return 0
    fi
    if [ ${#v} -gt "$attesi" ]; then
      echo "   ne ho ricevuti ${#v}: sembra incollata più di una volta. Incolla UNA volta sola e premi Invio."
    else
      echo "   ne ho ricevuti ${#v}, me ne servono $attesi."
    fi
  done
  echo "tre tentativi andati male, non scrivo niente."
  exit 1
}

if [ -f "$CONF" ] && grep -q "^\[r2\]" "$CONF"; then
  echo "Esiste già un profilo [r2] in $CONF."
  printf "Lo sostituisco? (s/n) "
  read RISP
  [ "$RISP" = "s" ] || { echo "lasciato com'era"; exit 0; }
  cp "$CONF" "$CONF.backup-$(date +%Y%m%d%H%M)"
fi

chiedi "Access Key ID" 32 visibile; AK="$RISULTATO"
chiedi "Secret Access Key" 64 muta;  SK="$RISULTATO"

mkdir -p "$(dirname "$CONF")"
printf '[r2]\ntype = s3\nprovider = Cloudflare\nenv_auth = false\naccess_key_id = %s\nsecret_access_key = %s\nregion = auto\nendpoint = %s\nacl = private\n' \
  "$AK" "$SK" "$ENDPOINT" > "$CONF"
chmod 600 "$CONF"
unset AK SK RISULTATO

echo
echo "configurazione scritta in $CONF"
