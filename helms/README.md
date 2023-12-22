## Helm Charts Deployment

### Prerequisites

- Kubernetes cluster
- Helm 3
- SendGrid API Key (for sending verification emails)
    - Update API key in the `./chart-acquirer-backend/values.yaml` file:

### Deploying the Helm Charts


1. Build Dependency Chart
```bash
helm dependency build <rootProject>/helms
```

2. Install the Helm chart:

```bash
helm install my-release <rootProject>/helms
```

2. Default Ingress DNS (add following records to the `/etc/hosts` file)
    - www.acquirer-merchant.local
    - api.acquirer-merchant.local
    - oracle.acquirer-merchant.local


### IMPORTANT NOTES:
When updating ingress's host make sure to update the `apiUrl` of `./chart-acquirer-frontend/values.yaml` file too. 
Otherwise frontend will not be able to communicate with backend.
