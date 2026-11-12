# smartpark-infra

Infraestrutura, gateway NGINX, Docker Compose, Bicep, testes integrados e documentação de entrega.

## Integrantes

Allanys Schultz · Gustavo Araujo · Gabriel Lyra · Guilherme Cheutchuk

PUCPR — Arquitetura e Soluções Cloud — PJBL, novembro de 2026.

## Arquitetura

Fluxo: Shell + microfrontends → API Gateway → BFF → Catálogo/MongoDB + Reservas/Azure SQL + Azure Functions.

Reserva representa capacidade por período, nunca uma vaga física específica. O serviço Reservas é a única fonte oficial de capacidade e tarifa. O catálogo mantém dados descritivos. Bancos não são acessados diretamente por outro serviço.

O gateway é um componente separado do BFF. Apenas o gateway tem ingress público no ambiente Container Apps.

## Execução local

Pré-requisitos: Node.js 22, Docker Desktop com containers Linux e Git.

Clone os oito repositórios como pastas irmãs. No repositório [smartpark-infra](https://github.com/gksz01/smartpark-infra), siga o README e execute Docker Compose. Os serviços usam MongoDB, SQL Server Developer e Azurite reais localmente.

Gere uma configuração local com segredos aleatórios e execute:

```sh
node scripts/init-local.mjs
docker compose --env-file .env up -d --build
```

Gateway: http://localhost:8088 · Swagger: `/catalog/docs`, `/booking/docs` e `/docs`.

O script cria uma conta e chave próprias para o emulador Azurite no `.env` ignorado pelo Git. Nunca reutilize credenciais locais em produção. Os volumes persistem os dados entre reinícios.

Teste integrado: exporte `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `INTERNAL_API_KEY`, e execute `node tests/e2e.mjs`. `API_URL` permite apontar para a implantação cloud. O teste cria usuários e registros fictícios próprios e desativa o estacionamento ao concluir.

## Publicação

- Portal: https://stsmartparkgkszz1126.z15.web.core.windows.net/
- Microfrontend motorista: https://stsmartparkgkszz1126.z15.web.core.windows.net/driver/
- Microfrontend administração: https://stsmartparkgkszz1126.z15.web.core.windows.net/admin/
- API Gateway: https://gateway.redmushroom-409e0858.brazilsouth.azurecontainerapps.io
- Repositórios: https://github.com/gksz01?tab=repositories&q=smartpark

Os links acima são os destinos configurados. Consulte [as evidências de entrega](https://github.com/gksz01/smartpark-infra/blob/main/docs/EVIDENCIAS.md) para verificar quais testes de publicação já foram executados.

**Ajuste de infraestrutura:** a assinatura Azure for Students bloqueou todas as regiões disponíveis para Static Web Apps. Os três builds são publicados independentemente no Azure Storage Static Website: `/`, `/driver/` e `/admin/`. A composição continua sendo realizada em runtime por Module Federation.

## CI/CD e configuração

GitHub Actions valida o build antes de publicar a branch `main`. Pull requests apenas validam. A identidade federada Azure possui acesso restrito ao grupo do projeto. Nenhum segredo é versionado.

Consulte `.env.example` e o workflow para as variáveis necessárias. Configurações `VITE_*` são públicas e não podem conter credenciais. Tokens JWT expiram em duas horas; a interface mantém a sessão em sessionStorage. O backend valida perfil e propriedade dos registros independentemente da interface.

## Regras e limites do MVP

- Datas armazenadas em UTC e exibidas no fuso do navegador.
- Intervalos de reserva são semiabertos: `[início, fim)`; reservas consecutivas não se sobrepõem.
- Tarifa em centavos por hora iniciada. Pagamento aprovado/recusado é simulado.
- Reservas pagas não permitem alteração do período; cancelamento antes do início libera a capacidade e mantém histórico.
- Notificações são processadas por eventos publicados após o commit da operação. Se a fila falhar, a Outbox preserva os eventos e o Timer de recuperação tenta novamente a cada duas horas (UTC), ou na próxima operação. Cold starts podem acrescentar latência.
- Entrega de eventos é pelo menos uma vez, com deduplicação por eventId; não se promete entrega exatamente uma vez.
- Não há hardware, mapas externos, pagamento financeiro ou envio de e-mail/SMS.

## Operação

Recursos dimensionados para demonstração acadêmica. Containers escalam a zero e a primeira requisição pode ser lenta. Aqueça o sistema antes do vídeo. Não confunda health checks com testes de todas as dependências.

O objetivo é manter a aplicação disponível até 30/11/2026, sujeito às cotas gratuitas e créditos. Não há desligamento automático configurado. Para rollback dos containers, selecione a imagem do commit anterior; mantenha migrations compatíveis.

### Correção operacional — 12/11/2026

O SQL esgotou sua franquia gratuita e pausou. Com autorização do grupo, `BillOverUsage` foi habilitado para consumir os créditos estudantis, mantendo `useFreeLimit=true` e pausa por inatividade de 60 minutos. O Timer mudou de 2 minutos para 2 horas (`0 0 */2 * * *`), sem execução no startup. Criação, pagamento e cancelamento tentam publicar a Outbox após o commit; falhas preservam o sucesso da operação e o evento pendente. A deduplicação no consumidor continua necessária. A recuperação periódica ainda pode acordar o SQL e consumir créditos; a redução efetiva de custos deve ser acompanhada no Azure.
