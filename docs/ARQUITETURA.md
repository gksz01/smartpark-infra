# Decisões de arquitetura

## ADR-01 — TypeScript e NestJS

Frontend React e backend NestJS, conforme escolha do grupo. Repositórios e pipelines separados. Domain contém regras puras; Application define portas e features; Infrastructure implementa MongoDB, SQL e HTTP; API trata transporte, validação e autenticação.

## ADR-02 — Capacidade como autoridade transacional

SQL mantém capacidade, tarifa e reservas. Todas as mutações de um estacionamento obtêm sp_getapplock exclusivo com dono Transaction. A varredura de início/fim calcula o pico real de reservas sobrepostas, não a soma de todos os intervalos. Alterações de capacidade passam pelo mesmo bloqueio.

O MongoDB mantém descrição do local e identidade, sem duplicar capacidade. Cadastro de local e configuração de capacidade são etapas explícitas: o local sem capacidade não aceita reservas. Não se promete transação global entre bancos.

## ADR-03 — Outbox e entrega pelo menos uma vez

Reserva e evento são gravados na mesma transação SQL. O Timer Trigger solicita despacho a cada dois minutos. O publicador envia para Storage Queue antes de marcar a Outbox enviada. Falhas entre esses passos podem duplicar mensagens. Table Storage usa PartitionKey=userId e RowKey=eventId; createEntity trata conflito como evento já processado. Após cinco falhas a mensagem segue para a fila poison do Azure Functions.

## ADR-04 — Microfrontends independentes

Shell carrega driver/App e admin/App em runtime via Module Federation. Cada repositório produz um remoteEntry e seu pipeline publica somente o próprio prefixo. Os três builds usam a mesma origem do Azure Storage, evitando exigência de CORS entre módulos. Static Web Apps foi substituído porque nenhuma região suportada era permitida pela política da assinatura.

## ADR-05 — Segurança e exposição

Gateway tem ingress externo; BFF, Catálogo e Reservas têm ingress interno. JWT HS256 com issuer/audience e expiração é verificado pelos backends. Serviço interno exige x-service-key, armazenado como segredo Azure. API Function HTTP tem authLevel anonymous no runtime, mas exige a mesma credencial de serviço no handler; nunca é chamada pelo navegador. Usuário de banco Atlas limitado ao catálogo. Firewall SQL e Atlas limitam origem aos IPs de saída necessários.

## ADR-06 — Limitações acadêmicas

Pagamento é uma transição de estado simulada, idempotente no bloqueio da reserva. Não há transação financeira ou estorno real. Histórico de reservas não é apagado. Não há integração IoT, email ou mapas. Serviços escalam a zero e podem apresentar cold start.

## API

GET /aggregated-data?start=<ISO UTC>&end=<ISO UTC> retorna parkings, availability, reservations, notifications, correlationId e generatedAt. Falhas de dependência retornam erro, sem fallback fictício. Swagger detalhado: /catalog/docs, /booking/docs e /docs pelo gateway.

POST /auth/register e /auth/login; GET/POST /parkings e /vehicles; GET/PUT/DELETE /parkings/:id e /vehicles/:id; PUT /capacities/:id; GET /availability; GET/POST /reservations; GET/PUT/DELETE /reservations/:id; POST /reservations/:id/payment; POST /internal/outbox/dispatch protegido por segredo.
