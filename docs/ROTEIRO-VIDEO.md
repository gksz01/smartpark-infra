# Roteiro de apresentação

1. Abrir https://stsmartparkgkszz1126.z15.web.core.windows.net/ e mostrar a URL pública.
2. Exibir o diagrama: React microfrontends → NGINX → NestJS BFF → Catálogo/MongoDB + Reservas/Azure SQL + Functions.
3. No administrador, cadastrar um estacionamento e configurar capacidade/tarifa.
4. Entrar como motorista, cadastrar veículo e consultar disponibilidade.
5. Reservar período, alterar antes do pagamento, simular recusa e depois aprovação. Mostrar que não existe cobrança real.
6. Atualizar notificações após processamento da fila e cancelar uma reserva futura.
7. Na aba Network do navegador, mostrar GET /aggregated-data contendo as três origens.
8. Abrir Swagger dos dois microserviços pelo gateway e mostrar os CRUDs.
9. Mostrar Azure: Container Apps, Azure SQL (oferta gratuita), Storage Queue/Table, Function HTTP/Queue/Timer. Mostrar Atlas Free.
10. Mostrar repositórios públicos, Docker Hub e pipelines verdes. Explicar builds independentes dos microfrontends e o ajuste de hospedagem por restrição regional.
11. Mostrar relatórios reais de testes, especialmente disputa pela última capacidade e idempotência.

Não exibir senhas, connection strings, tokens JWT, Secrets do GitHub ou chaves de Storage no vídeo. Preparar dados fictícios e aquecer a aplicação antes de gravar. Gravar após a verificação cloud registrada em EVIDENCIAS.md.
