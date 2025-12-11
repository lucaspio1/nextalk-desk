#!/bin/bash

# Script de teste de envio WhatsApp
# Baseado nas configurações da Meta

PHONE_NUMBER_ID="823581997515238"
ACCESS_TOKEN="EAAKNtwS6kTsBQBZAyPjNyVKE6FS2cZBejdZA9ym0T8d9adKf58Yyxo8M9R5ZA6PmduFQa4c8YZA7a4JgASeIhk5D8YywmOm6To81BdmdcKat35ZBBqMkTHzP2cOCeVgCFiY2LTUDCRNMk7ZAdVcZCJChuoM713LbrKBSQ38iksbfbeTArQ4CyfzzYzxT7GvrsuOp87ICDmwIycvXOHnaRkwgU4GAPlEr4VBdiIp2nn82SgAY5j8ESx8bRQxrbxeL2ZAk9tV2Gbc55l22PWQu3sw1g"
TO_NUMBER="5548996372539"

echo "🧪 Testando envio de mensagem WhatsApp"
echo "Para: $TO_NUMBER"
echo ""

curl -X POST "https://graph.facebook.com/v19.0/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"messaging_product\": \"whatsapp\",
    \"to\": \"$TO_NUMBER\",
    \"type\": \"text\",
    \"text\": {
      \"body\": \"🔔 Teste $(date +%H:%M:%S) - Se você receber esta mensagem, a integração está funcionando!\"
    }
  }" | python3 -m json.tool 2>/dev/null

echo ""
echo "✅ Comando executado. Verifique seu WhatsApp!"
