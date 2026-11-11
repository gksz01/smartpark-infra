# Rede Atlas e Azure Container Apps

O catálogo utiliza 181 possíveis IPs de saída, conforme consulta de `outboundIpAddresses` na Azure. A lista observada está em `azure/atlas-outbound-ips.json`. Cada entrada deve ser cadastrada no Atlas como /32; não usar 0.0.0.0/0.

Um único IP não cobre mudanças de réplica/revisão: o catálogo passou de 4.228.166.5 para 20.226.185.243 durante a validação, causando indisponibilidade enquanto o novo endereço não estava permitido.

Revalidar após alterações de infraestrutura:

```powershell
az containerapp show --subscription 413fec5f-9be1-4f29-a3ed-94fff79b4d7a --resource-group rg-pjblfinal-dev-brazilsouth-01 --name catalog --query properties.outboundIpAddresses -o json
```

Comparar o resultado com a lista versionada e a lista de acesso do Atlas. A lista não constitui promessa de IP fixo: endereços podem mudar. Saída fixa exigiria configuração de rede com NAT Gateway, com custo e alteração de infraestrutura. As regras permitem origem de rede; autenticação continua obrigatória e o usuário tem acesso somente a smartpark_catalog.

Referência: https://learn.microsoft.com/en-us/azure/container-apps/networking
