param location string = 'brazilsouth'
param suffix string = 'gkszz1126'
@secure()
param sqlPassword string
resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
 name: 'stsmartpark${suffix}'
 location: location
 sku: {name:'Standard_LRS'}
 kind: 'StorageV2'
 properties: {minimumTlsVersion:'TLS1_2',allowBlobPublicAccess:false,supportsHttpsTrafficOnly:true}
}
resource sql 'Microsoft.Sql/servers@2023-08-01-preview' = {
 name: 'sql-smartpark-${suffix}'
 location: location
 properties: {administratorLogin:'smartparkadmin',administratorLoginPassword:sqlPassword,minimalTlsVersion:'1.2',publicNetworkAccess:'Enabled'}
}
resource db 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
 parent: sql
 name: 'smartpark'
 location: location
 sku: {name:'GP_S_Gen5',tier:'GeneralPurpose',family:'Gen5',capacity:2}
 properties: {autoPauseDelay:60,minCapacity:json('0.5'),maxSizeBytes:34359738368,useFreeLimit:true,freeLimitExhaustionBehavior:'AutoPause',requestedBackupStorageRedundancy:'Local'}
}
resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
 name: 'cae-smartpark-${suffix}'
 location: location
 properties: {
  workloadProfiles: [{name:'Consumption',workloadProfileType:'Consumption'}]
 }
}
output storageName string = storage.name
output sqlServer string = sql.properties.fullyQualifiedDomainName
output environmentId string = environment.id
