param serverName string = 'sql-smartpark-gkszz1126'
@description('Exact outbound IPv4 addresses reported by Container Apps; never use an allow-all rule.')
param outboundIps array
resource server 'Microsoft.Sql/servers@2023-08-01-preview' existing = {name: serverName}
resource rules 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = [for (ip, index) in outboundIps: {
 parent: server
 name: 'smartpark-container-${index}'
 properties: {startIpAddress:ip,endIpAddress:ip}
}]
