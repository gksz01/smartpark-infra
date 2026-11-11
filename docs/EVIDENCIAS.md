# Evidências de validação

## Executado localmente

- Build TypeScript dos três backends e da Function: aprovado.
- Build React/Vite dos três frontends: aprovado.
- 39 testes unitários e arquiteturais: aprovados novamente com Vitest 5.1.0 em 10/11/2026, 23h02 (Brasília).
- Teste HTTP integrado em Docker com MongoDB 8, SQL Server 2022 e Azure Functions/Azurite: 11 verificações aprovadas, incluindo concorrência pela última capacidade e notificações.
- Repositórios públicos criados na conta gksz01.
- Azure SQL gratuito, Storage e Container Apps Environment provisionados na assinatura estudantil.
- Cluster Atlas Free criado sobre infraestrutura Azure; usuário com readWrite em smartpark_catalog.

## Validação cloud

Em 10/11/2026, aproximadamente 23h05 (Brasília), `tests/e2e.mjs` concluiu **11 verificações** pela URL pública `https://gateway.redmushroom-409e0858.brazilsouth.azurecontainerapps.io`, usando MongoDB Atlas, Azure SQL e Azure Functions/Storage reais:

1. Cadastro e login.
2. Motorista sem permissão administrativa.
3. Isolamento de veículos entre usuários.
4. Duas reservas concorrentes disputam capacidade 1: uma aceita e outra retorna conflito.
5. Isolamento de reservas.
6. Alteração de período.
7. Pagamento simulado recusado/aprovado, repetição idempotente e bloqueio de alteração após pagamento.
8. Cancelamento.
9. Agregação dos dois serviços e Function, capacidade liberada e três notificações persistidas.
10. Isolamento das notificações por destinatário.
11. Rotas internas protegidas e autenticação obrigatória.

Swagger JSON do catálogo e de reservas retornaram HTTP 200 pelo gateway. Function HTTP retornou notificações do Table Storage com `source: azure-functions`. Gateway publicado com imagem `gkszz/smartpark-gateway:v1.1`; serviços com tag `v1`.

## Pendências e limites da evidência

- GitHub Actions não inicia jobs: conta `gksz01` bloqueada por billing. Build/testes e publicação foram executados diretamente; não há pipelines verdes confirmados. A tela de billing não apresentou cobrança pendente, exigindo análise do suporte GitHub.
- A lista Atlas inclui o IP local e o IP de saída atual do catálogo (4.228.166.5). Por decisão do responsável, apenas o IP atual será mantido por enquanto. Se o Container Apps trocar o IP de saída, a conexão ficará indisponível até atualizar a regra.
- Testes adicionais de reinício/persistência, indisponibilidade da fila e poison queue ainda não estão registrados nesta evidência.
- A suíte de pagamento repetido verifica ausência de notificações extras; isso não substitui o teste explícito de reenviar a mesma mensagem de fila.
