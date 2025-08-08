#!/data/data/com.termux/files/usr/bin/bash

# Captura o IP do Wi-Fi
ip=$(ip -4 addr show wlan0 | grep inet | awk '{print $2}' | cut -d/ -f1)

# Monta o link
link="http://$ip:8080"

# Mostra o QR Code
echo ""
echo "📱 Escaneie o QR Code para abrir a página:"
qrencode -t ANSIUTF8 "$link"
echo ""
echo "🌐 Ou acesse manualmente: $link"
echo ""

# Inicia o servidor
live-server --host=0.0.0.0
