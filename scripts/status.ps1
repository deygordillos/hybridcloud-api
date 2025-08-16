# Script de verificacion de estado para Hybrid Auth Service
param(
    [string]$Namespace = "hybrid",
    [switch]$Detailed = $false,
    [switch]$Watch = $false
)

Write-Host "Verificando estado de Hybrid Auth Service..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Función para logging
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Cyan
}

# Verificar que kubectl esté configurado
try {
    $clusterInfo = kubectl cluster-info 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "kubectl no esta configurado"
    }
    Write-Info "kubectl configurado correctamente"
} catch {
    Write-Error "kubectl no esta configurado o no puede conectarse al cluster"
    Write-Error "Error: $_"
    exit 1
}

# Verificar si el namespace existe
$namespaceExists = kubectl get namespace $Namespace 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Namespace '$Namespace' no existe. El API Gateway no esta desplegado."
    exit 0
}

# Función para mostrar estado
function Show-Status {
    Write-Host "`nEstado del despliegue:" -ForegroundColor Yellow
    Write-Host "------------------------" -ForegroundColor Yellow
    
    # Verificar pods
    Write-Info "Pods:"
    $pods = kubectl get pods -n $Namespace -l app=hybrid-auth-service 2>$null
    if ($LASTEXITCODE -eq 0 -and $pods) {
        kubectl get pods -n $Namespace -l app=hybrid-auth-service
    } else {
        Write-Warn "No se encontraron pods del API Gateway"
    }
    
    # Verificar deployments
    Write-Info "`nDeployments:"
    $deployments = kubectl get deployments -n $Namespace -l app=hybrid-auth-service 2>$null
    if ($LASTEXITCODE -eq 0 -and $deployments) {
        kubectl get deployments -n $Namespace -l app=hybrid-auth-service
    } else {
        Write-Warn "No se encontraron deployments del API Gateway"
    }
    
    # Verificar servicios
    Write-Info "`nServicios:"
    $services = kubectl get services -n $Namespace -l app=hybrid-auth-service 2>$null
    if ($LASTEXITCODE -eq 0 -and $services) {
        kubectl get services -n $Namespace -l app=hybrid-auth-service
    } else {
        Write-Warn "No se encontraron servicios del API Gateway"
    }
    
    # Verificar ingress
    Write-Info "`nIngress:"
    $ingress = kubectl get ingress -n $Namespace -l app=hybrid-auth-service 2>$null
    if ($LASTEXITCODE -eq 0 -and $ingress) {
        kubectl get ingress -n $Namespace -l app=hybrid-auth-service
    } else {
        Write-Warn "No se encontraron ingress del API Gateway"
    }
    
    # Obtener IP externa del servicio
    $serviceIP = kubectl get service hybrid-auth-service -n $Namespace -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
    if ($serviceIP) {
        Write-Host "`nInformacion de acceso:" -ForegroundColor Green
        Write-Host "   IP Externa: $serviceIP" -ForegroundColor Yellow
        Write-Host "   Health Check: http://$serviceIP/health" -ForegroundColor Yellow
        Write-Host "   Sync Service: http://$serviceIP" -ForegroundColor Yellow
        
        # Probar health check
        try {
            $response = Invoke-WebRequest -Uri "http://$serviceIP/health" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "Health check exitoso"
                $healthData = $response.Content | ConvertFrom-Json
                Write-Info "   Status: $($healthData.status)"
                Write-Info "   Timestamp: $($healthData.timestamp)"
                Write-Info "   Service: $($healthData.service)"
            } else {
                Write-Warn "Health check fallo (Status: $($response.StatusCode))"
            }
        } catch {
            Write-Warn "No se pudo conectar al health check: $($_.Exception.Message)"
        }
    } else {
        Write-Warn "IP externa del servicio no disponible aun"
    }
    
    # Informacion detallada si se solicita
    if ($Detailed) {
        Write-Host "`nInformacion detallada:" -ForegroundColor Yellow
        Write-Host "------------------------" -ForegroundColor Yellow
        
        # Logs recientes
        Write-Info "Logs recientes del deployment:"
        kubectl logs deployment/hybrid-auth-service -n $Namespace --tail=10 2>$null
        
        # Eventos
        Write-Info "`nEventos recientes:"
        kubectl get events -n $Namespace --sort-by='.lastTimestamp' --field-selector involvedObject.name=hybrid-auth-service 2>$null
        
        # Recursos utilizados
        Write-Info "`nUso de recursos:"
        kubectl top pods -n $Namespace -l app=hybrid-auth-service 2>$null
    }
}

# Mostrar estado inicial
Show-Status

# Modo watch si se especifica
if ($Watch) {
    Write-Host "`nModo watch activado. Presiona Ctrl+C para salir." -ForegroundColor Cyan
    try {
        while ($true) {
            Start-Sleep -Seconds 10
            Clear-Host
            Write-Host "Estado de Hybrid Auth Service (Actualizado cada 10s)..." -ForegroundColor Cyan
            Write-Host "==================================================" -ForegroundColor Cyan
            Show-Status
        }
    } catch {
        Write-Host "`nModo watch terminado." -ForegroundColor Cyan
    }
}

Write-Host "`nVerificacion completada!" -ForegroundColor Green
