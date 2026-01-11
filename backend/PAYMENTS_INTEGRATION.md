# Integração de Pagamentos (PIX)

Este arquivo descreve opções para integrar pagamentos PIX no backend.

1) MercadoPago (recomendado)

- Adicione a variável `MERCADOPAGO_ACCESS_TOKEN` em `backend/.env` (ou no provedor):

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx
```

- Exemplo de fluxo:
  - Criar preferência/pagamento via API MercadoPago (v1/payments) com `payment_method_id: 'pix'`.
  - Receber `transaction_details.qr_code` e/ou `point_of_interaction.transaction_data.qr_code` no retorno.
  - Salvar `payment_id` e estado do pedido (PENDING/PAID) e monitorar webhooks.

2) Gerencianet / Outros provedores

- A maioria dos gateways no Brasil fornece endpoints para gerar payload/QR e webhooks para status.

3) Implementação no projeto

- O endpoint `POST /api/payments/pix` já existe em modo *mock* (veja `backend/src/controllers/PagamentoController.ts`).
- Para ativar a integração real, implemente a chamada ao gateway dentro desse controller quando `MERCADOPAGO_ACCESS_TOKEN` estiver presente.

4) Webhooks

- Configure um endpoint `/api/payments/webhook` para receber notificações do gateway e atualizar `paymentStatus` e `orders`.

 - Se usar MercadoPago, configure o `Notification URL` no painel de desenvolvedor para:
   `https://<seu-dominio>/api/payments/webhook` (ou a URL exposta pelo seu provedor/NGROK em dev).
  - O webhook pode enviar `{"action":"payment.created","data":{"id":<payment_id>}}` ou similares;
    o handler busca o pagamento via API (`GET /v1/payments/{id}`) e atualiza `Order.external_reference`.

5) Testes locais

- Em desenvolvimento, o endpoint retorna um `pixPayload` mock e `qrCodeData` (data URL SVG) para testes de frontend.
